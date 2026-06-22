/**
 * Serviços de Integração com Google APIs
 * ======================================
 * 
 * Este arquivo contém funções para integrar:
 * - Google Sheets API
 * - Google Maps API (Geocodificação)
 * - Google Drive API
 * - Google Calendar API (opcional)
 */

import { google } from 'googleapis';
import axios from 'axios';

// ============================================================================
// 1. GOOGLE SHEETS INTEGRATION
// ============================================================================

/**
 * Importar dados de uma planilha Google Sheets
 * 
 * Uso:
 * ```
 * const dados = await importFromGoogleSheets(
 *   'spreadsheetId',
 *   'Sheet1!A1:F100'
 * );
 * ```
 */
export async function importFromGoogleSheets(
  spreadsheetId: string,
  range: string,
  auth: any
) {
  try {
    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const rows = response.data.values || [];
    
    if (rows.length < 2) {
      throw new Error('Planilha vazia ou sem cabeçalhos');
    }

    const headers = rows[0];
    const data = rows.slice(1).map((row: any[]) => {
      const obj: any = {};
      headers.forEach((header: string, index: number) => {
        obj[header] = row[index] || null;
      });
      return obj;
    });

    return {
      success: true,
      total: data.length,
      headers,
      data,
    };
  } catch (error: any) {
    console.error('Erro ao importar de Google Sheets:', error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
}

/**
 * Exportar dados para Google Sheets
 * 
 * Uso:
 * ```
 * await exportToGoogleSheets(
 *   'spreadsheetId',
 *   'Sheet1!A1',
 *   dados,
 *   auth
 * );
 * ```
 */
export async function exportToGoogleSheets(
  spreadsheetId: string,
  range: string,
  data: any[],
  auth: any
) {
  try {
    const sheets = google.sheets({ version: 'v4', auth });

    // Preparar dados: headers + rows
    if (data.length === 0) {
      throw new Error('Nenhum dado para exportar');
    }

    const headers = Object.keys(data[0]);
    const values = [
      headers,
      ...data.map(row =>
        headers.map(header => row[header] ?? '')
      ),
    ];

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: { values },
    });

    return {
      success: true,
      message: `${response.data.updatedRows} linhas atualizadas`,
      updatedRows: response.data.updatedRows,
    };
  } catch (error: any) {
    console.error('Erro ao exportar para Google Sheets:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Criar nova planilha no Google Sheets
 * 
 * Uso:
 * ```
 * const resultado = await createGoogleSheet(
 *   'Nome da Planilha',
 *   ['Coluna1', 'Coluna2'],
 *   auth
 * );
 * console.log(resultado.spreadsheetId); // ID da nova planilha
 * ```
 */
export async function createGoogleSheet(
  title: string,
  headers: string[],
  auth: any
) {
  try {
    const sheets = google.sheets({ version: 'v4', auth });

    // Criar planilha
    const createResponse = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title },
        sheets: [
          {
            properties: { sheetId: 0, title: 'Sheet1' },
            data: [
              {
                rowData: [
                  {
                    values: headers.map(h => ({
                      userEnteredValue: { stringValue: h },
                      userEnteredFormat: {
                        textFormat: { bold: true },
                        backgroundColor: { red: 0.2, green: 0.2, blue: 0.2 },
                      },
                    })),
                  },
                ],
              },
            ],
          },
        ],
      },
    });

    return {
      success: true,
      spreadsheetId: createResponse.data.spreadsheetId,
      url: `https://docs.google.com/spreadsheets/d/${createResponse.data.spreadsheetId}`,
      message: `Planilha "${title}" criada com sucesso`,
    };
  } catch (error: any) {
    console.error('Erro ao criar Google Sheet:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// ============================================================================
// 2. GOOGLE MAPS INTEGRATION (Geocodificação)
// ============================================================================

const mapsCache = new Map<string, any>(); // Cache simples em memória

/**
 * Geocodificar endereço para coordenadas (latitude, longitude)
 * 
 * Uso:
 * ```
 * const coords = await geocodeAddress('Rua das Flores, 123, São Paulo, SP');
 * console.log(coords); // { latitude, longitude, formatted_address }
 * ```
 */
export async function geocodeAddress(
  address: string,
  googleMapsApiKey: string
) {
  try {
    // Verificar cache
    if (mapsCache.has(address)) {
      return {
        success: true,
        cached: true,
        ...mapsCache.get(address),
      };
    }

    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/geocode/json',
      {
        params: {
          address,
          key: googleMapsApiKey,
          language: 'pt-BR',
        },
      }
    );

    if (response.data.results.length === 0) {
      return {
        success: false,
        error: 'Endereço não encontrado',
      };
    }

    const result = response.data.results[0];
    const geocoded = {
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
      formatted_address: result.formatted_address,
      address_components: result.address_components,
    };

    // Cachear resultado por 1 hora
    mapsCache.set(address, geocoded);
    setTimeout(() => mapsCache.delete(address), 3600000);

    return {
      success: true,
      cached: false,
      ...geocoded,
    };
  } catch (error: any) {
    console.error('Erro ao geocodificar endereço:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Reverter geocodificação: coordenadas para endereço
 * 
 * Uso:
 * ```
 * const endereco = await reverseGeocode(
 *   -23.5505,  // latitude
 *   -46.6333,  // longitude
 *   googleMapsApiKey
 * );
 * ```
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
  googleMapsApiKey: string
) {
  try {
    const cacheKey = `${latitude},${longitude}`;

    // Verificar cache
    if (mapsCache.has(cacheKey)) {
      return {
        success: true,
        cached: true,
        ...mapsCache.get(cacheKey),
      };
    }

    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/geocode/json',
      {
        params: {
          latlng: `${latitude},${longitude}`,
          key: googleMapsApiKey,
          language: 'pt-BR',
        },
      }
    );

    if (response.data.results.length === 0) {
      return {
        success: false,
        error: 'Localização não encontrada',
      };
    }

    const result = response.data.results[0];
    const reversed = {
      formatted_address: result.formatted_address,
      address_components: result.address_components,
      latitude,
      longitude,
    };

    // Cachear resultado
    mapsCache.set(cacheKey, reversed);
    setTimeout(() => mapsCache.delete(cacheKey), 3600000);

    return {
      success: true,
      cached: false,
      ...reversed,
    };
  } catch (error: any) {
    console.error('Erro ao reverter geocodificação:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Calcular distância entre dois pontos (em km)
 * 
 * Fórmula Haversine (não precisa de API Key)
 * 
 * Uso:
 * ```
 * const distancia = calculateDistance(
 *   -23.5505, -46.6333,  // São Paulo
 *   -22.9068, -43.1729   // Rio de Janeiro
 * );
 * console.log(distancia); // ~357.7 km
 * ```
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km

  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Arredondar para 1 casa decimal
}

/**
 * Buscar localizações próximas (usando Points of Interest)
 * 
 * Uso:
 * ```
 * const lugares = await findNearbyPlaces(
 *   -23.5505,
 *   -46.6333,
 *   'restaurant',
 *   5000, // 5 km
 *   googleMapsApiKey
 * );
 * ```
 */
export async function findNearbyPlaces(
  latitude: number,
  longitude: number,
  placeType: string,
  radiusMeters: number,
  googleMapsApiKey: string
) {
  try {
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
      {
        params: {
          location: `${latitude},${longitude}`,
          radius: radiusMeters,
          type: placeType,
          key: googleMapsApiKey,
          language: 'pt-BR',
        },
      }
    );

    return {
      success: true,
      places: response.data.results.map((place: any) => ({
        name: place.name,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        rating: place.rating,
        distance: calculateDistance(
          latitude,
          longitude,
          place.geometry.location.lat,
          place.geometry.location.lng
        ),
      })),
    };
  } catch (error: any) {
    console.error('Erro ao buscar lugares próximos:', error);
    return {
      success: false,
      error: error.message,
      places: [],
    };
  }
}

// ============================================================================
// 3. GOOGLE DRIVE INTEGRATION
// ============================================================================

/**
 * Listar arquivos no Google Drive
 * 
 * Uso:
 * ```
 * const arquivos = await listDriveFiles(auth);
 * ```
 */
export async function listDriveFiles(auth: any, maxResults: number = 50) {
  try {
    const drive = google.drive({ version: 'v3', auth });

    const response = await drive.files.list({
      pageSize: maxResults,
      fields: 'files(id, name, mimeType, createdTime, modifiedTime)',
      pageToken: undefined,
    });

    return {
      success: true,
      files: response.data.files || [],
    };
  } catch (error: any) {
    console.error('Erro ao listar arquivos do Drive:', error);
    return {
      success: false,
      error: error.message,
      files: [],
    };
  }
}

/**
 * Criar pasta no Google Drive
 * 
 * Uso:
 * ```
 * const pasta = await createDriveFolder('Minha Pasta', auth);
 * console.log(pasta.folderId);
 * ```
 */
export async function createDriveFolder(folderName: string, auth: any) {
  try {
    const drive = google.drive({ version: 'v3', auth });

    const response = await drive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      },
    });

    return {
      success: true,
      folderId: response.data.id,
      name: response.data.name,
    };
  } catch (error: any) {
    console.error('Erro ao criar pasta no Drive:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Fazer upload de arquivo para Google Drive
 * 
 * Uso:
 * ```
 * await uploadToDrive(
 *   './relatório.pdf',
 *   'application/pdf',
 *   'folderId',
 *   auth
 * );
 * ```
 */
export async function uploadToDrive(
  filePath: string,
  mimeType: string,
  parentFolderId: string | null,
  auth: any
) {
  try {
    const drive = google.drive({ version: 'v3', auth });
    const fileName = filePath.split('/').pop();

    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType,
        parents: parentFolderId ? [parentFolderId] : [],
      },
      media: {
        mimeType,
        body: require('fs').createReadStream(filePath),
      },
    });

    return {
      success: true,
      fileId: response.data.id,
      name: response.data.name,
      url: `https://drive.google.com/file/d/${response.data.id}/view`,
    };
  } catch (error: any) {
    console.error('Erro ao fazer upload para Drive:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// ============================================================================
// 4. GOOGLE CALENDAR INTEGRATION (Opcional)
// ============================================================================

/**
 * Criar evento no Google Calendar
 * 
 * Uso:
 * ```
 * await createCalendarEvent({
 *   summary: 'Reunião de Planejamento',
 *   description: 'Análise Q3',
 *   start: new Date('2026-07-01T10:00:00'),
 *   end: new Date('2026-07-01T11:00:00'),
 * }, auth);
 * ```
 */
export async function createCalendarEvent(
  eventData: {
    summary: string;
    description?: string;
    start: Date;
    end: Date;
    attendees?: string[];
  },
  auth: any
) {
  try {
    const calendar = google.calendar({ version: 'v3', auth });

    const event = {
      summary: eventData.summary,
      description: eventData.description,
      start: {
        dateTime: eventData.start.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: eventData.end.toISOString(),
        timeZone: 'America/Sao_Paulo',
      },
      attendees: eventData.attendees?.map(email => ({ email })),
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    return {
      success: true,
      eventId: response.data.id,
      link: response.data.htmlLink,
    };
  } catch (error: any) {
    console.error('Erro ao criar evento no Calendar:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// ============================================================================
// 5. ANÁLISES COMBINADAS (Usando múltiplas APIs)
// ============================================================================

/**
 * Análise de transações por localização
 * Geocodifica endereços e agrupa por região
 */
export async function analyzeTransactionsByLocation(
  transactions: any[],
  googleMapsApiKey: string
) {
  try {
    const analyzed = [];

    for (const tx of transactions) {
      if (!tx.endereco) continue;

      const geo = await geocodeAddress(tx.endereco, googleMapsApiKey);

      if (geo.success) {
        analyzed.push({
          ...tx,
          latitude: geo.latitude,
          longitude: geo.longitude,
          city: geo.address_components?.find((c: any) =>
            c.types.includes('administrative_area_level_2')
          )?.long_name,
        });
      }
    }

    return {
      success: true,
      total: transactions.length,
      geocoded: analyzed.length,
      data: analyzed,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Gerar relatório automático no Google Sheets
 */
export async function generateAutomaticReport(
  title: string,
  data: any[],
  auth: any
) {
  try {
    // Criar planilha
    const sheet = await createGoogleSheet(title, Object.keys(data[0]), auth);

    if (!sheet.success) throw new Error(sheet.error);

    // Exportar dados
    const exported = await exportToGoogleSheets(
      sheet.spreadsheetId!,
      'Sheet1!A2',
      data,
      auth
    );

    return {
      success: true,
      spreadsheetId: sheet.spreadsheetId,
      url: sheet.url,
      rows: exported.updatedRows,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Export all functions
export default {
  // Sheets
  importFromGoogleSheets,
  exportToGoogleSheets,
  createGoogleSheet,

  // Maps
  geocodeAddress,
  reverseGeocode,
  calculateDistance,
  findNearbyPlaces,

  // Drive
  listDriveFiles,
  createDriveFolder,
  uploadToDrive,

  // Calendar
  createCalendarEvent,

  // Combined
  analyzeTransactionsByLocation,
  generateAutomaticReport,
};
