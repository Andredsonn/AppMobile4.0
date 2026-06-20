# Google APIs Integration - Exemplos de Uso

## 📋 Índice

1. [Google Sheets](#google-sheets)
2. [Google Maps](#google-maps)
3. [Google Drive](#google-drive)
4. [Google Calendar](#google-calendar)
5. [Análises Combinadas](#análises-combinadas)
6. [Tratamento de Erros](#tratamento-de-erros)

---

## 🔧 Google Sheets

### Importar Dados de Planilha

Importar dados de uma planilha existente do Google Sheets:

```typescript
// src/services/api.ts - Adicionar novo método

export async function importFromSheets(
  spreadsheetId: string,
  range: string = 'Sheet1!A1:F1000'
) {
  return api.post('/google/sheets/import', {
    spreadsheetId,
    range,
  });
}
```

### Usar no Componente

```tsx
// src/app/components/ImportSheets.tsx

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import * as api from '@/services/api';

export function ImportSheetsComponent() {
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    if (!spreadsheetId) {
      toast.error('Por favor, informe o ID da planilha');
      return;
    }

    setLoading(true);
    try {
      const result = await api.importFromSheets(spreadsheetId);

      if (result.success) {
        toast.success(`${result.total} linhas importadas com sucesso!`);
        console.log(result.data);
      } else {
        toast.error(result.error);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Cole o ID da planilha do Google Sheets"
        value={spreadsheetId}
        onChange={(e) => setSpreadsheetId(e.target.value)}
      />
      <Button
        onClick={handleImport}
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Importando...' : 'Importar de Google Sheets'}
      </Button>
    </div>
  );
}
```

### Exportar Dados para Planilha

```typescript
// src/services/api.ts

export async function exportToSheets(
  spreadsheetId: string,
  data: any[],
  range: string = 'Sheet1!A1'
) {
  return api.post('/google/sheets/export', {
    spreadsheetId,
    range,
    data,
  });
}
```

### Criar Nova Planilha

```typescript
// src/services/api.ts

export async function createNewSheet(
  title: string,
  headers: string[]
) {
  return api.post('/google/sheets/create', {
    title,
    headers,
  });
}
```

### Usar para Gerar Relatório

```tsx
// src/app/components/GenerateReportButton.tsx

import { Button } from '@/components/ui/button';
import { FileDownIcon } from 'lucide-react';
import { toast } from 'sonner';
import * as api from '@/services/api';

export function GenerateReportButton({ lancamentos }: { lancamentos: any[] }) {
  const handleGenerate = async () => {
    try {
      // 1. Criar nova planilha
      const sheetResult = await api.createNewSheet(
        `Relatório - ${new Date().toLocaleDateString('pt-BR')}`,
        ['Data', 'Descrição', 'Valor', 'Tipo', 'Categoria', 'Responsável']
      );

      if (!sheetResult.success) {
        throw new Error(sheetResult.error);
      }

      // 2. Exportar dados
      const exportResult = await api.exportToSheets(
        sheetResult.spreadsheetId,
        lancamentos.map(l => ({
          Data: l.data,
          Descrição: l.descricaoLancamento,
          Valor: l.valor,
          Tipo: l.tipoLancamento,
          Categoria: l.categoria,
          Responsável: l.responsavel,
        }))
      );

      if (exportResult.success) {
        toast.success('Relatório gerado com sucesso!');
        // Abrir planilha no navegador
        window.open(sheetResult.url, '_blank');
      }
    } catch (error: any) {
      toast.error(`Erro: ${error.message}`);
    }
  };

  return (
    <Button
      onClick={handleGenerate}
      className="flex items-center gap-2"
    >
      <FileDownIcon className="w-4 h-4" />
      Gerar Relatório em Sheets
    </Button>
  );
}
```

---

## 🗺️ Google Maps

### Geocodificar Endereço

Converter endereço em coordenadas (latitude, longitude):

```typescript
// src/services/api.ts

export async function geocodeAddress(address: string) {
  return api.post('/google/maps/geocode', { address });
}
```

### Usar no Formulário

```tsx
// src/app/components/LocationPicker.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { toast } from 'sonner';
import * as api from '@/services/api';

export function LocationPicker({
  onLocationSelect,
}: {
  onLocationSelect: (lat: number, lon: number) => void;
}) {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGeocode = async () => {
    if (!address) return;

    setLoading(true);
    try {
      const result = await api.geocodeAddress(address);

      if (result.success) {
        onLocationSelect(result.latitude, result.longitude);
        toast.success('Localização encontrada!');
      } else {
        toast.error('Endereço não encontrado');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Digite o endereço"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <Button
        onClick={handleGeocode}
        disabled={loading}
        variant="outline"
        size="icon"
      >
        <MapPin className="w-4 h-4" />
      </Button>
    </div>
  );
}
```

### Calcular Distância

```typescript
// src/services/api.ts

export async function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  return api.post('/google/maps/distance', {
    lat1,
    lon1,
    lat2,
    lon2,
  });
}
```

### Usar para Análise

```tsx
// src/app/components/DistanceAnalysis.tsx

import { useState } from 'react';
import * as api from '@/services/api';

export function DistanceAnalysis() {
  const [distance, setDistance] = useState<number | null>(null);

  const handleCalculate = async () => {
    // São Paulo para Rio de Janeiro
    const result = await api.calculateDistance(
      -23.5505, -46.6333,  // São Paulo
      -22.9068, -43.1729   // Rio de Janeiro
    );

    if (result.success) {
      setDistance(result.distance);
      // Output: ~357.7 km
    }
  };

  return (
    <div>
      <button onClick={handleCalculate}>
        Calcular Distância SP ↔ RJ
      </button>
      {distance && <p>Distância: {distance} km</p>}
    </div>
  );
}
```

### Buscar Lugares Próximos

```typescript
// src/services/api.ts

export async function findNearbyPlaces(
  latitude: number,
  longitude: number,
  placeType: string = 'restaurant',
  radiusMeters: number = 5000
) {
  return api.post('/google/maps/nearby-places', {
    latitude,
    longitude,
    placeType,
    radiusMeters,
  });
}
```

### Usar no Componente

```tsx
// src/app/components/NearbyPlaces.tsx

import { useState } from 'react';
import * as api from '@/services/api';

export function NearbyPlaces({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (type: string) => {
    setLoading(true);
    try {
      const result = await api.findNearbyPlaces(
        latitude,
        longitude,
        type,
        5000
      );

      if (result.success) {
        setPlaces(result.places);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={() => handleSearch('restaurant')}>
        Restaurantes próximos
      </button>
      <button onClick={() => handleSearch('bank')}>
        Bancos próximos
      </button>

      {places.map((place: any) => (
        <div key={place.name} className="p-2 border rounded">
          <strong>{place.name}</strong>
          <p>⭐ {place.rating || 'N/A'}</p>
          <p>📍 {place.distance.toFixed(1)} km</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 📁 Google Drive

### Listar Arquivos

```typescript
// src/services/api.ts

export async function listDriveFiles(maxResults: number = 50) {
  return api.get(`/google/drive/files?maxResults=${maxResults}`);
}
```

### Criar Pasta

```typescript
// src/services/api.ts

export async function createDriveFolder(folderName: string) {
  return api.post('/google/drive/create-folder', {
    folderName,
  });
}
```

### Usar no Componente

```tsx
// src/app/components/DriveManagement.tsx

import { useState } from 'react';
import * as api from '@/services/api';

export function DriveManagement() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleListFiles = async () => {
    setLoading(true);
    try {
      const result = await api.listDriveFiles(50);
      if (result.success) {
        setFiles(result.files);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    const folderName = prompt('Nome da pasta:');
    if (!folderName) return;

    try {
      const result = await api.createDriveFolder(folderName);
      if (result.success) {
        alert(`Pasta criada: ${result.url}`);
      }
    } catch (error) {
      alert('Erro ao criar pasta');
    }
  };

  return (
    <div>
      <button onClick={handleListFiles}>Listar Arquivos</button>
      <button onClick={handleCreateFolder}>Criar Pasta</button>

      {files.map((file: any) => (
        <div key={file.id}>
          📄 {file.name}
        </div>
      ))}
    </div>
  );
}
```

---

## 📅 Google Calendar

### Criar Evento

```typescript
// src/services/api.ts

export async function createCalendarEvent(eventData: {
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  attendees?: string[];
}) {
  return api.post('/google/calendar/create-event', {
    summary: eventData.summary,
    description: eventData.description,
    start: eventData.start.toISOString(),
    end: eventData.end.toISOString(),
    attendees: eventData.attendees,
  });
}
```

### Usar para Agendar Reunião

```tsx
// src/app/components/ScheduleMeeting.tsx

import { Button } from '@/components/ui/button';
import * as api from '@/services/api';

export function ScheduleMeeting() {
  const handleSchedule = async () => {
    const start = new Date();
    start.setDate(start.getDate() + 7); // Próxima semana
    start.setHours(10, 0, 0);

    const end = new Date(start);
    end.setHours(11, 0, 0);

    try {
      const result = await api.createCalendarEvent({
        summary: 'Análise de Lançamentos',
        description: 'Revisão mensal de transações',
        start,
        end,
        attendees: ['time@example.com'],
      });

      if (result.success) {
        alert(`Evento criado: ${result.link}`);
      }
    } catch (error) {
      alert('Erro ao criar evento');
    }
  };

  return (
    <Button onClick={handleSchedule}>
      Agendar Reunião
    </Button>
  );
}
```

---

## 📊 Análises Combinadas

### Analisar Transações por Localização

```typescript
// src/services/api.ts

export async function analyzeTransactionsByLocation(transactions: any[]) {
  return api.post('/google/analyze/transactions-by-location', {
    transactions,
  });
}
```

### Dashboard com Mapa

```tsx
// src/app/components/TransactionMap.tsx

import { useState } from 'react';
import * as api from '@/services/api';

export function TransactionMap({
  lancamentos,
}: {
  lancamentos: any[];
}) {
  const [geoData, setGeoData] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      // Adicionar endereços aos lançamentos (exemplo)
      const withAddresses = lancamentos.map((l, i) => ({
        ...l,
        endereco: ['Rua A, São Paulo, SP', 'Rua B, Rio de Janeiro, RJ'][i % 2],
      }));

      const result = await api.analyzeTransactionsByLocation(withAddresses);

      if (result.success) {
        setGeoData(result.data);
        console.log(`${result.geocoded} de ${result.total} geocodificados`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analisando...' : 'Mapear Transações'}
      </button>

      {geoData.map((item: any) => (
        <div key={item.id} className="p-2 border rounded">
          <p>{item.descricaoLancamento}</p>
          <p>📍 {item.city}</p>
          <p>💰 R$ {item.valor.toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
}
```

### Gerar Relatório Automático

```typescript
// src/services/api.ts

export async function generateAutomaticReport(
  title: string,
  data: any[]
) {
  return api.post('/google/analyze/generate-report', {
    title,
    data,
  });
}
```

### Usar para Criar Relatório

```tsx
// src/app/components/AutoGenerateReport.tsx

import { Button } from '@/components/ui/button';
import * as api from '@/services/api';

export function AutoGenerateReport({
  lancamentos,
}: {
  lancamentos: any[];
}) {
  const handleGenerate = async () => {
    try {
      const result = await api.generateAutomaticReport(
        `Relatório - ${new Date().toLocaleDateString('pt-BR')}`,
        lancamentos.map(l => ({
          Data: l.data,
          Descrição: l.descricaoLancamento,
          Valor: l.valor,
          Tipo: l.tipoLancamento,
        }))
      );

      if (result.success) {
        alert(`Relatório criado!\n${result.url}`);
        window.open(result.url, '_blank');
      }
    } catch (error: any) {
      alert(`Erro: ${error.message}`);
    }
  };

  return (
    <Button onClick={handleGenerate}>
      📊 Gerar Relatório Automático
    </Button>
  );
}
```

---

## ⚠️ Tratamento de Erros

### Padrão de Erro

Todas as APIs retornam:

```typescript
{
  success: boolean;
  error?: string;
  data?: any;
}
```

### Exemplo de Tratamento

```tsx
import { toast } from 'sonner';

const handleAPICall = async () => {
  try {
    const result = await api.importFromSheets('spreadsheetId');

    if (!result.success) {
      // Erro de negócio
      toast.error(result.error || 'Erro desconhecido');
      return;
    }

    // Sucesso
    toast.success('Operação concluída com sucesso!');
    console.log(result.data);

  } catch (error: any) {
    // Erro de rede/servidor
    toast.error(`Erro: ${error.message}`);
    console.error(error);
  }
};
```

---

## 🔍 Verificar Status das APIs

```typescript
// src/services/api.ts

export async function getGoogleApisHealth() {
  return api.get('/google/health');
}
```

### Usar no Dashboard

```tsx
// src/app/components/ApiStatus.tsx

import { useState, useEffect } from 'react';
import * as api from '@/services/api';

export function ApiStatus() {
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    api.getGoogleApisHealth().then(setStatus);
  }, []);

  if (!status) return <div>Carregando...</div>;

  return (
    <div className="grid grid-cols-4 gap-2">
      {Object.entries(status.status).map(([api, enabled]: [string, any]) => (
        <div key={api} className={`p-2 rounded ${enabled ? 'bg-green-100' : 'bg-red-100'}`}>
          {api}: {enabled ? '✅' : '❌'}
        </div>
      ))}
    </div>
  );
}
```

---

## 📚 Próximos Passos

1. **Implementar Geocodificação em Massa**
   - Adicionar campo de endereço aos lançamentos
   - Geocodificar automaticamente ao salvar

2. **Dashboard de Mapa**
   - Integrar com Google Maps JavaScript API
   - Exibir markers de transações

3. **Sincronização Automática**
   - Exportar relatórios diariamente
   - Sincronizar com Google Drive

4. **Notificações por Email**
   - Integrar Gmail API
   - Enviar resumos automáticos

---

**Última atualização:** 2026-06-19
