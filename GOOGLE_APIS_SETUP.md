# Configuração de APIs do Google - Guia Completo

## 📋 Visão Geral

Este guia descreve como ativar e configurar as APIs do Google para expandir as capacidades do MIDAS. Com essas APIs, você pode:

- **Google Sheets API**: Importar/exportar dados diretamente de planilhas
- **Google Maps API**: Geocodificação e análises de localização
- **Google Drive API**: Armazenamento em nuvem e sincronização de dados
- **Google Calendar API**: Agendamento automático de eventos
- **Gmail API**: Notificações por email
- **Generative Language API**: Já ativada (IA para análises)

---

## 🔧 Pré-requisitos

1. Conta Google (Gmail) pessoal ou corporativa
2. Cartão de crédito válido (alguns planos têm período gratuito)
3. Acesso ao [Google Cloud Console](https://console.cloud.google.com/)

---

## 📍 PASSO 1: Acessar Google Cloud Console

### 1.1 Criar Novo Projeto

```
1. Acesse: https://console.cloud.google.com/
2. Clique no seletor de projetos (canto superior esquerdo)
3. Clique em "Novo Projeto"
4. Nome: "MIDAS Finance API"
5. Clique em "Criar"
⏳ Aguarde 30-60 segundos para o projeto ser criado
```

### 1.2 Verificar Projeto Ativo

```
1. No topo do console, confirme "MIDAS Finance API" está selecionado
2. Copie o Project ID (você precisará dele depois)
3. Exemplo: midas-finance-api-12345
```

---

## 📱 PASSO 2: Ativar APIs Necessárias

### 2.1 Ativar Google Sheets API

```
1. Acesse: https://console.cloud.google.com/apis/library/sheets.googleapis.com
2. Clique em "Ativar" (botão azul)
3. Aguarde a confirmação "API ativada"
4. Pronto! ✅
```

### 2.2 Ativar Google Maps API

```
1. Acesse: https://console.cloud.google.com/apis/library/maps-backend.googleapis.com
2. Clique em "Ativar"
3. **IMPORTANTE**: Depois ative também:
   - Geocoding API: https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com
   - Places API: https://console.cloud.google.com/apis/library/places-backend.googleapis.com
4. Aguarde confirmação de cada uma
```

### 2.3 Ativar Google Drive API

```
1. Acesse: https://console.cloud.google.com/apis/library/drive.googleapis.com
2. Clique em "Ativar"
```

### 2.4 Ativar Google Calendar API (Opcional)

```
1. Acesse: https://console.cloud.google.com/apis/library/calendar.googleapis.com
2. Clique em "Ativar"
```

### 2.5 Ativar Gmail API (Opcional)

```
1. Acesse: https://console.cloud.google.com/apis/library/gmail.googleapis.com
2. Clique em "Ativar"
```

---

## 🔐 PASSO 3: Criar Credenciais de Serviço

Este é o passo mais importante - você criará as chaves de autenticação.

### 3.1 Acessar Credenciais

```
1. Clique em "Credenciais" (menu esquerdo)
2. Clique em "Criar Credenciais" (botão azul no topo)
3. Selecione "Conta de Serviço"
```

### 3.2 Preencher Informações da Conta de Serviço

```
Tela 1 - Detalhes da Conta:
├─ Nome da conta de serviço: "midas-api-service"
├─ ID da conta de serviço: (auto-preenchido)
└─ Descrição: "Serviço de integração com APIs do MIDAS"
   → Clique em "Criar e Continuar"

Tela 2 - Permissões (OPCIONAL - pule se preferir):
   → Clique em "Continuar"

Tela 3 - Acesso de Usuários (OPCIONAL):
   → Clique em "Pronto"
```

### 3.3 Gerar Chave JSON

```
1. Na lista de contas de serviço, clique na conta criada
2. Vá para a aba "Chaves"
3. Clique em "Adicionar Chave" → "Criar nova chave"
4. Selecione "JSON"
5. Clique em "Criar"
   ⏬ Um arquivo JSON será baixado automaticamente
6. **IMPORTANTE**: Salve este arquivo em local seguro!
   Exemplo: ~/.config/midas-service-account.json
```

### 3.4 Conteúdo da Chave JSON

O arquivo baixado terá este formato:

```json
{
  "type": "service_account",
  "project_id": "midas-finance-api-12345",
  "private_key_id": "key-id-aqui",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "midas-api-service@midas-finance-api-12345.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs"
}
```

---

## 🛡️ PASSO 4: Configurar Variáveis de Ambiente

### 4.1 Para Ambiente Local

Crie ou edite o arquivo `.env` na raiz do projeto:

```bash
# Credenciais Google (Chaves de Serviço)
GOOGLE_APPLICATION_CREDENTIALS=/caminho/para/midas-service-account.json
GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...}'

# Project ID do Google Cloud
GOOGLE_CLOUD_PROJECT_ID=midas-finance-api-12345

# APIs específicas
GOOGLE_SHEETS_SPREADSHEET_ID=1A2B3C4D5E6F7G8H9I0J (ID da planilha - veja Passo 5)
GOOGLE_MAPS_API_KEY=AIza... (API Key pública - veja Passo 6)

# Servidor
PORT=3000
VITE_API_BASE_URL=http://localhost:3000
```

### 4.2 Para Ambiente de Produção (Azure, Heroku, etc)

1. Vá para o dashboard do seu servidor em nuvem
2. Procure por "Environment Variables" ou "Settings"
3. Adicione as mesmas variáveis acima

**Exemplo (Azure):**
```
Portal → Seu App → Configuration → Application Settings
Adicionar cada variável com o respectivo valor
```

---

## 📊 PASSO 5: Configurar Google Sheets (Opcional)

### 5.1 Criar Planilha de Exemplo

```
1. Acesse: https://sheets.google.com
2. Clique em "Novo" → "Planilha em branco"
3. Renomeie para "MIDAS - Dados de Análise"
4. Crie colunas:
   ├─ A: Data
   ├─ B: Descrição
   ├─ C: Valor
   ├─ D: Tipo (Receita/Despesa)
   ├─ E: Categoria
   └─ F: Responsável
5. Adicione alguns dados de exemplo
```

### 5.2 Obter ID da Planilha

```
URL: https://docs.google.com/spreadsheets/d/1A2B3C4D5E6F7G8H9I0J/edit
                                           ^^^^^^^^^^^^^^^^^^^^^^
Copie esta parte - é seu SPREADSHEET_ID
```

### 5.3 Compartilhar Planilha com Serviço

```
1. Clique em "Compartilhar"
2. Copie o email da conta de serviço de sua chave JSON:
   midas-api-service@midas-finance-api-12345.iam.gserviceaccount.com
3. Cole no campo de compartilhamento
4. Clique em "Compartilhar"
   ✅ Agora o serviço tem acesso à planilha
```

---

## 🗺️ PASSO 6: Configurar Google Maps (Opcional)

### 6.1 Criar API Key Pública

```
1. Vá para: https://console.cloud.google.com/apis/credentials
2. Clique em "Criar Credenciais" → "Chave de API"
3. Clique em "Restringir Chave"
4. **Restrições de Aplicativo**:
   ├─ HTTP Referrers (websites)
   └─ Adicione seu domínio: https://seu-dominio.com/*
5. **Restrições de API**:
   ├─ Google Maps Platform
   └─ Selecione: Maps JavaScript API, Places API, Geocoding API
6. Clique em "Salvar"
7. Copie a chave de API
```

### 6.2 Adicionar ao Frontend

No arquivo `.env` ou `vite.config.ts`:

```typescript
// vite.config.ts
export default defineConfig({
  define: {
    'import.meta.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(
      process.env.GOOGLE_MAPS_API_KEY || ''
    ),
  },
});
```

---

## 📋 PASSO 7: Próximos Passos de Implementação

Após completar os passos acima, o servidor está pronto para:

### Fase 1 - Integração Básica (1-2 semanas)
- [ ] Endpoint para importar dados de Google Sheets
- [ ] Geocodificação com Google Maps (endereços → coordenadas)
- [ ] Cache de resultados para reduzir custos de API

### Fase 2 - Análises Avançadas (2-3 semanas)
- [ ] Dashboard com mapa de transações por localidade
- [ ] Relatórios gerados em Google Sheets automaticamente
- [ ] Integração com Google Drive para backup em nuvem

### Fase 3 - Automação (3-4 semanas)
- [ ] Sincronização automática com Google Calendar
- [ ] Alertas via Gmail
- [ ] IA analisando dados de várias fontes

---

## 💰 PASSO 8: Monitorar Custos

### 8.1 Configurar Alertas de Orçamento

```
1. Acesse: https://console.cloud.google.com/billing
2. Clique em "Orçamentos e Alertas"
3. Clique em "Criar Orçamento"
4. Configure:
   ├─ Projeto: "MIDAS Finance API"
   ├─ Orçamento: R$ 100/mês (ajuste conforme necessário)
   └─ Alertas: 50%, 90%, 100%
5. Clique em "Criar"
```

### 8.2 Consultar Uso de APIs

```
1. Acesse: https://console.cloud.google.com/monitoring/dashboards
2. Veja:
   ├─ Requests por API
   ├─ Erros e quotas
   ├─ Custo estimado
```

---

## 🔍 PASSO 9: Testar Configuração

### 9.1 Verificar Autenticação

```bash
# Na pasta do projeto, execute:
node -e "
const sa = require('./midas-service-account.json');
console.log('✅ Chave carregada com sucesso');
console.log('Email:', sa.client_email);
console.log('Project ID:', sa.project_id);
"
```

### 9.2 Testar Google Sheets API

```javascript
// Criar arquivo: test-sheets.js
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import fs from 'fs';

const keyFile = './midas-service-account.json';
const keyData = JSON.parse(fs.readFileSync(keyFile, 'utf8'));

const client = new JWT({
  email: keyData.client_email,
  key: keyData.private_key,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth: client });

// Listar dados da planilha
const result = await sheets.spreadsheets.values.get({
  spreadsheetId: 'COLOQUE_SEU_SPREADSHEET_ID',
  range: 'Sheet1!A1:F100',
});

console.log('✅ Conexão com Sheets bem-sucedida!');
console.log('Dados:', result.data.values);
```

```bash
# Execute:
node test-sheets.js
```

---

## 📚 Recursos Úteis

| Recurso | Link |
|---------|------|
| Google Cloud Console | https://console.cloud.google.com/ |
| Google APIs Docs | https://developers.google.com/apis-explorer |
| Sheets API Docs | https://developers.google.com/sheets/api |
| Maps API Docs | https://developers.google.com/maps/documentation |
| Drive API Docs | https://developers.google.com/drive/api |
| Pricing Calculator | https://cloud.google.com/products/calculator |

---

## ⚠️ Boas Práticas de Segurança

### ✅ FAÇA:
- Armazene chaves JSON em arquivos `.env` (não commite no Git)
- Use contas de serviço em produção
- Implemente quotas de API
- Monitore uso e custos
- Rotacione chaves a cada 90 dias

### ❌ NÃO FAÇA:
- Não compartilhe chaves JSON em emails ou Slack
- Não commite chaves no repositório Git
- Não use a mesma chave para múltiplos ambientes
- Não exponha API Keys públicas sem restrições
- Não deixe APIs ativas sem uso

---

## 🚀 Próximos Passos

1. **Imediato** (hoje):
   - Criar projeto no Google Cloud Console
   - Ativar APIs necessárias

2. **Curto prazo** (semana 1):
   - Criar conta de serviço
   - Configurar variáveis de ambiente
   - Testar conexão básica

3. **Médio prazo** (semana 2-3):
   - Implementar endpoints no servidor
   - Criar componentes no frontend
   - Testar fluxos de importação/exportação

4. **Longo prazo** (semana 4+):
   - Otimizar e cache de dados
   - Implementar sincronização em tempo real
   - Análises avançadas com IA

---

## 📞 Suporte

Se encontrar erros comuns:

**Erro: "Credentials not found"**
```
Solução: Verifique se GOOGLE_APPLICATION_CREDENTIALS aponta para arquivo válido
```

**Erro: "Permission denied"**
```
Solução: Compartilhe a planilha/recurso com o email da conta de serviço
```

**Erro: "Quota exceeded"**
```
Solução: Verifique limites de API em console.cloud.google.com/apis/dashboard
```

---

**Última atualização:** 2026-06-19  
**Status:** Guia Completo ✅
