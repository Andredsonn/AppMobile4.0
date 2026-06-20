/**
 * Routes para Google APIs
 * ========================
 * 
 * Endpoints para integração com:
 * - Google Sheets
 * - Google Maps
 * - Google Drive
 * - Google Calendar
 * 
 * Adicione ao server.js:
 * import { setupGoogleApisRoutes } from './routes/googleApisRoutes.js';
 * setupGoogleApisRoutes(app, googleAuth);
 */

import {
  importFromGoogleSheets,
  exportToGoogleSheets,
  createGoogleSheet,
  geocodeAddress,
  reverseGeocode,
  calculateDistance,
  findNearbyPlaces,
  listDriveFiles,
  createDriveFolder,
  uploadToDrive,
  createCalendarEvent,
  analyzeTransactionsByLocation,
  generateAutomaticReport,
} from '../src/services/googleApisService.ts';

export function setupGoogleApisRoutes(app, googleAuth) {
  
  // ========================================================================
  // SHEETS ENDPOINTS
  // ========================================================================

  /**
   * POST /api/google/sheets/import
   * Importar dados de uma planilha Google Sheets
   * 
   * Body:
   * {
   *   "spreadsheetId": "1A2B3C4D...",
   *   "range": "Sheet1!A1:F100"
   * }
   */
  app.post('/api/google/sheets/import', async (req, res) => {
    try {
      const { spreadsheetId, range = 'Sheet1!A1:F1000' } = req.body;

      if (!spreadsheetId) {
        return res.status(400).json({ error: 'spreadsheetId é obrigatório' });
      }

      const result = await importFromGoogleSheets(
        spreadsheetId,
        range,
        googleAuth
      );

      return res.json(result);
    } catch (error) {
      console.error('Erro ao importar de Sheets:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/google/sheets/export
   * Exportar dados para Google Sheets
   * 
   * Body:
   * {
   *   "spreadsheetId": "1A2B3C4D...",
   *   "range": "Sheet1!A1",
   *   "data": [{ "coluna1": "valor1" }]
   * }
   */
  app.post('/api/google/sheets/export', async (req, res) => {
    try {
      const { spreadsheetId, range = 'Sheet1!A1', data } = req.body;

      if (!spreadsheetId || !data || !Array.isArray(data)) {
        return res
          .status(400)
          .json({
            error: 'spreadsheetId e data (array) são obrigatórios',
          });
      }

      const result = await exportToGoogleSheets(
        spreadsheetId,
        range,
        data,
        googleAuth
      );

      return res.json(result);
    } catch (error) {
      console.error('Erro ao exportar para Sheets:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/google/sheets/create
   * Criar nova planilha Google Sheets
   * 
   * Body:
   * {
   *   "title": "Meu Relatório",
   *   "headers": ["Data", "Descrição", "Valor"]
   * }
   */
  app.post('/api/google/sheets/create', async (req, res) => {
    try {
      const { title, headers = [] } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'title é obrigatório' });
      }

      const result = await createGoogleSheet(title, headers, googleAuth);
      return res.json(result);
    } catch (error) {
      console.error('Erro ao criar Sheet:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  // ========================================================================
  // MAPS ENDPOINTS
  // ========================================================================

  /**
   * POST /api/google/maps/geocode
   * Geocodificar endereço para coordenadas
   * 
   * Body:
   * {
   *   "address": "Rua das Flores, 123, São Paulo, SP"
   * }
   */
  app.post('/api/google/maps/geocode', async (req, res) => {
    try {
      const { address } = req.body;
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;

      if (!address) {
        return res.status(400).json({ error: 'address é obrigatório' });
      }

      if (!apiKey) {
        return res
          .status(500)
          .json({ error: 'GOOGLE_MAPS_API_KEY não configurada' });
      }

      const result = await geocodeAddress(address, apiKey);
      return res.json(result);
    } catch (error) {
      console.error('Erro ao geocodificar:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/google/maps/reverse-geocode
   * Reverter geocodificação (coordenadas para endereço)
   * 
   * Body:
   * {
   *   "latitude": -23.5505,
   *   "longitude": -46.6333
   * }
   */
  app.post('/api/google/maps/reverse-geocode', async (req, res) => {
    try {
      const { latitude, longitude } = req.body;
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;

      if (latitude === undefined || longitude === undefined) {
        return res
          .status(400)
          .json({ error: 'latitude e longitude são obrigatórios' });
      }

      if (!apiKey) {
        return res
          .status(500)
          .json({ error: 'GOOGLE_MAPS_API_KEY não configurada' });
      }

      const result = await reverseGeocode(latitude, longitude, apiKey);
      return res.json(result);
    } catch (error) {
      console.error('Erro ao reverter geocodificação:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/google/maps/distance
   * Calcular distância entre dois pontos
   * 
   * Body:
   * {
   *   "lat1": -23.5505,
   *   "lon1": -46.6333,
   *   "lat2": -22.9068,
   *   "lon2": -43.1729
   * }
   */
  app.post('/api/google/maps/distance', (req, res) => {
    try {
      const { lat1, lon1, lat2, lon2 } = req.body;

      if (
        lat1 === undefined ||
        lon1 === undefined ||
        lat2 === undefined ||
        lon2 === undefined
      ) {
        return res
          .status(400)
          .json({ error: 'lat1, lon1, lat2, lon2 são obrigatórios' });
      }

      const distance = calculateDistance(lat1, lon1, lat2, lon2);

      return res.json({
        success: true,
        distance,
        unit: 'km',
        origin: { latitude: lat1, longitude: lon1 },
        destination: { latitude: lat2, longitude: lon2 },
      });
    } catch (error) {
      console.error('Erro ao calcular distância:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/google/maps/nearby-places
   * Buscar lugares próximos
   * 
   * Body:
   * {
   *   "latitude": -23.5505,
   *   "longitude": -46.6333,
   *   "placeType": "restaurant",
   *   "radiusMeters": 5000
   * }
   */
  app.post('/api/google/maps/nearby-places', async (req, res) => {
    try {
      const { latitude, longitude, placeType = 'restaurant', radiusMeters = 5000 } =
        req.body;
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;

      if (latitude === undefined || longitude === undefined) {
        return res
          .status(400)
          .json({ error: 'latitude e longitude são obrigatórios' });
      }

      if (!apiKey) {
        return res
          .status(500)
          .json({ error: 'GOOGLE_MAPS_API_KEY não configurada' });
      }

      const result = await findNearbyPlaces(
        latitude,
        longitude,
        placeType,
        radiusMeters,
        apiKey
      );

      return res.json(result);
    } catch (error) {
      console.error('Erro ao buscar lugares próximos:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  // ========================================================================
  // DRIVE ENDPOINTS
  // ========================================================================

  /**
   * GET /api/google/drive/files
   * Listar arquivos no Google Drive
   * 
   * Query params:
   * - maxResults: número máximo de resultados (padrão: 50)
   */
  app.get('/api/google/drive/files', async (req, res) => {
    try {
      const maxResults = parseInt(req.query.maxResults as string) || 50;
      const result = await listDriveFiles(googleAuth, maxResults);
      return res.json(result);
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/google/drive/create-folder
   * Criar pasta no Google Drive
   * 
   * Body:
   * {
   *   "folderName": "Minha Pasta"
   * }
   */
  app.post('/api/google/drive/create-folder', async (req, res) => {
    try {
      const { folderName } = req.body;

      if (!folderName) {
        return res.status(400).json({ error: 'folderName é obrigatório' });
      }

      const result = await createDriveFolder(folderName, googleAuth);
      return res.json(result);
    } catch (error) {
      console.error('Erro ao criar pasta:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  // ========================================================================
  // CALENDAR ENDPOINTS
  // ========================================================================

  /**
   * POST /api/google/calendar/create-event
   * Criar evento no Google Calendar
   * 
   * Body:
   * {
   *   "summary": "Reunião de Planejamento",
   *   "description": "Análise Q3",
   *   "start": "2026-07-01T10:00:00",
   *   "end": "2026-07-01T11:00:00",
   *   "attendees": ["pessoa@example.com"]
   * }
   */
  app.post('/api/google/calendar/create-event', async (req, res) => {
    try {
      const { summary, description, start, end, attendees } = req.body;

      if (!summary || !start || !end) {
        return res
          .status(400)
          .json({
            error: 'summary, start e end são obrigatórios',
          });
      }

      const result = await createCalendarEvent(
        {
          summary,
          description,
          start: new Date(start),
          end: new Date(end),
          attendees,
        },
        googleAuth
      );

      return res.json(result);
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  // ========================================================================
  // ANALYSIS ENDPOINTS
  // ========================================================================

  /**
   * POST /api/google/analyze/transactions-by-location
   * Analisar transações por localização
   * 
   * Body:
   * {
   *   "transactions": [
   *     { "id": 1, "valor": 100, "endereco": "Rua X, São Paulo, SP" }
   *   ]
   * }
   */
  app.post('/api/google/analyze/transactions-by-location', async (req, res) => {
    try {
      const { transactions } = req.body;
      const apiKey = process.env.GOOGLE_MAPS_API_KEY;

      if (!transactions || !Array.isArray(transactions)) {
        return res
          .status(400)
          .json({ error: 'transactions (array) é obrigatório' });
      }

      if (!apiKey) {
        return res
          .status(500)
          .json({ error: 'GOOGLE_MAPS_API_KEY não configurada' });
      }

      const result = await analyzeTransactionsByLocation(transactions, apiKey);
      return res.json(result);
    } catch (error) {
      console.error('Erro na análise de transações:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/google/analyze/generate-report
   * Gerar relatório automático no Google Sheets
   * 
   * Body:
   * {
   *   "title": "Relatório Mensal",
   *   "data": [{ "data": "2026-01-01", "valor": 1000 }]
   * }
   */
  app.post('/api/google/analyze/generate-report', async (req, res) => {
    try {
      const { title, data } = req.body;

      if (!title || !data || !Array.isArray(data)) {
        return res
          .status(400)
          .json({
            error: 'title e data (array) são obrigatórios',
          });
      }

      const result = await generateAutomaticReport(title, data, googleAuth);
      return res.json(result);
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      return res.status(500).json({ error: error.message });
    }
  });

  // ========================================================================
  // HEALTH CHECK
  // ========================================================================

  /**
   * GET /api/google/health
   * Verificar status das APIs do Google
   */
  app.get('/api/google/health', (req, res) => {
    const status = {
      sheets: !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
      maps: !!process.env.GOOGLE_MAPS_API_KEY,
      drive: !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
      calendar: !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
    };

    const allEnabled = Object.values(status).every(v => v);

    return res.json({
      success: true,
      status,
      allEnabled,
      message: allEnabled
        ? 'Todas as APIs do Google estão configuradas'
        : 'Algumas APIs do Google não estão configuradas',
    });
  });

  console.log('✅ Rotas de Google APIs registradas');
}

export default setupGoogleApisRoutes;
