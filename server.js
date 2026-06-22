import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import axios from 'axios';
import { GoogleAuth, JWT } from 'google-auth-library';
import { setupGoogleApisRoutes } from './src/routes/googleApisRoutes.js';


dotenv.config();

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const GOOGLE_GENERATIVE_API_KEY = process.env.GOOGLE_GENERATIVE_API_KEY;
const GOOGLE_SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const GOOGLE_SERVICE_ACCOUNT_KEYFILE = process.env.GOOGLE_SERVICE_ACCOUNT_KEYFILE || process.env.GOOGLE_APPLICATION_CREDENTIALS;

let googleServiceAccountCredentials = null;

// First, try to load from JSON env var
if (GOOGLE_SERVICE_ACCOUNT_JSON) {
  try {
    googleServiceAccountCredentials = JSON.parse(GOOGLE_SERVICE_ACCOUNT_JSON.replace(/\\n/g, '\n'));
    console.log('✅ Service account loaded from GOOGLE_SERVICE_ACCOUNT_JSON');
  } catch (error) {
    console.error('Invalid GOOGLE_SERVICE_ACCOUNT_JSON:', error.message);
  }
}

// Then try to load from file if not loaded from env var
if (!googleServiceAccountCredentials && GOOGLE_SERVICE_ACCOUNT_KEYFILE) {
  try {
    const keyfileContent = fs.readFileSync(GOOGLE_SERVICE_ACCOUNT_KEYFILE, 'utf8');
    googleServiceAccountCredentials = JSON.parse(keyfileContent);
    console.log('✅ Service account loaded from file:', GOOGLE_SERVICE_ACCOUNT_KEYFILE);
  } catch (error) {
    console.error('Invalid service account keyfile:', error.message);
  }
}

const googleAuth = new GoogleAuth({
  scopes: [
    'https://www.googleapis.com/auth/cloud-platform',
    'https://www.googleapis.com/auth/generative-language',
  ],
});

// Simple in-memory metrics for generative model usage and fallbacks
const generativeMetrics = {
  totalAttempts: 0,
  attempts: {},
  fallbacks: {},
  quotaErrors: {},
};

async function getGoogleGenerativeAccessToken() {
  if (googleServiceAccountCredentials) {
    const client = new JWT({
      email: googleServiceAccountCredentials.client_email,
      key: googleServiceAccountCredentials.private_key,
      scopes: [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/generative-language',
      ],
    });
    const response = await client.authorize();
    return response?.access_token ?? null;
  }

  if (GOOGLE_SERVICE_ACCOUNT_KEYFILE) {
    const client = await googleAuth.getClient();
    const accessToken = await client.getAccessToken();
    return typeof accessToken === 'string' ? accessToken : accessToken?.token ?? null;
  }

  return null;
}

// Fallback: call Google Generative AI
async function callGoogleGenerativeModel(prompt, model = 'gemini-2.0-flash') {
  const useServiceAccount = Boolean(googleServiceAccountCredentials || GOOGLE_SERVICE_ACCOUNT_KEYFILE)
  
  if (!GOOGLE_GENERATIVE_API_KEY && !useServiceAccount) {
    throw new Error('GOOGLE_GENERATIVE_API_KEY or service account not configured')
  }

  let accessToken = null
  if (useServiceAccount) {
    accessToken = await getGoogleGenerativeAccessToken()
  }

  const headers = { 'Content-Type': 'application/json' }
  const endpoints = ['generateContent', 'generateText']

  for (const endpoint of endpoints) {
    try {
      const apiKeySuffix = !useServiceAccount && GOOGLE_GENERATIVE_API_KEY ? `?key=${GOOGLE_GENERATIVE_API_KEY}` : ''
      const url = `https://generativelanguage.googleapis.com/v1/models/${model}:${endpoint}${apiKeySuffix}`
      const requestHeaders = { ...headers }
      
      if (useServiceAccount && accessToken) {
        requestHeaders.Authorization = `Bearer ${accessToken}`
      }

      const payload = endpoint === 'generateText'
        ? { prompt: { text: `Responda em Português do Brasil. ${prompt}` } }
        : {
          contents: [
            { parts: [{ text: 'Responda em Português do Brasil. Sempre responda em português, de forma clara e direta.' }] },
            { parts: [{ text: prompt }] },
          ],
        }

      const r = await axios.post(url, payload, { headers: requestHeaders, timeout: 10000 })
      const text = extractGenerativeResponseText(r.data)
      if (text) return String(text).trim()
    } catch (err) {
      const resp = err?.response?.data || null
      const msg = String(resp?.error?.message || err?.message || '')
      const isNotFound = resp?.error?.code === 404 || msg.toLowerCase().includes('not found')
      if (isNotFound) continue
      throw err
    }
  }

  throw new Error('No valid endpoint returned a response')
}

function extractGenerativeResponseText(data) {
  const candidate = data?.candidates?.[0]
  if (candidate) {
    const content = Array.isArray(candidate?.content) ? candidate.content[0] : candidate?.content
    const text = content?.text || content?.parts?.[0]?.text || candidate?.text || candidate?.output
    return String(text || data?.output || data?.text || '').trim() || null
  }
  return String(data?.output || data?.text || '').trim() || null
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Registrar rotas das Google APIs
setupGoogleApisRoutes(app, googleAuth);

// Demo auth endpoint for local testing (username/password demo)
const DEMO_USER = process.env.DEMO_USER || 'Admin'
const DEMO_PASS = process.env.DEMO_PASS || 'Senha@123'

app.post('/api/demo-auth', (req, res) => {
  const { username, password } = req.body || {}
  if (username === DEMO_USER && password === DEMO_PASS) {
    return res.json({ token: 'demo-token', user: { username: DEMO_USER } })
  }
  return res.status(401).json({ message: 'Invalid credentials' })
})

const apiTarget = process.env.API_PROXY_TARGET || process.env.VITE_API_BASE_URL;
const useLocalAuth = !apiTarget;

console.log('API_PROXY_TARGET:', process.env.API_PROXY_TARGET || '(not set)');
console.log('VITE_API_BASE_URL:', process.env.VITE_API_BASE_URL || '(not set)');
console.log('Using local auth:', useLocalAuth ? 'yes' : 'no, forwarding /api to remote backend');

if (useLocalAuth) {
  // In-memory storage for registered emails (demo)
  const registeredEmails = new Set()
  const registeredUsernames = new Set()

  app.post('/api/Usuario/Autenticar', (req, res) => {
    const { nomeUsuario, PasswordString } = req.body || {}
    if (nomeUsuario === DEMO_USER && PasswordString === DEMO_PASS) {
      return res.json({
        usuario: {
          id: 1,
          IdUsuario: 1,
          nomeUsuario: DEMO_USER,
          NomeUsuario: DEMO_USER,
          sobrenome: 'Demo',
          emailUsuario: 'admin@demo.com',
          telefone: '+55 11 99999-9999',
          IdEmpresa: 1,
          idEmpresa: 1,
          perfil: 'Administrador',
          Perfil: 'Administrador',
        },
        token: 'demo-token',
      })
    }
    if (registeredUsernames.has(nomeUsuario)) {
      return res.json({
        usuario: {
          id: 2,
          IdUsuario: 2,
          nomeUsuario: nomeUsuario,
          NomeUsuario: nomeUsuario,
          sobrenome: 'User',
          emailUsuario: Array.from(registeredEmails).find(e => e.includes(nomeUsuario)) || `${nomeUsuario}@demo.com`,
          telefone: '+55 11 99999-9999',
          IdEmpresa: 1,
          idEmpresa: 1,
          perfil: 'Usuario',
          Perfil: 'Usuario',
        },
        token: 'user-demo-token',
      })
    }
    return res.status(401).json({ message: 'Credenciais inválidas' })
  })



  app.post('/api/Usuario/ValidarUsername', (req, res) => {
    const { nomeUsuario } = req.body || {}
    if (!nomeUsuario) {
      return res.status(400).json({ error: 'Nome de usuário é obrigatório' })
    }
    const exists = registeredUsernames.has(nomeUsuario.toLowerCase())
    return res.json({ exists, message: exists ? 'Este usuário já está registrado' : 'Usuário disponível' })
  })

  app.post('/api/Usuario/Registrar', (req, res) => {
    const { nomeUsuario, email, PasswordString } = req.body || {}
    
    if (!nomeUsuario || !email || !PasswordString) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
    }

    if (registeredEmails.has(email.toLowerCase())) {
      return res.status(400).json({ error: 'Este email já está registrado' })
    }

    if (registeredUsernames.has(nomeUsuario.toLowerCase())) {
      return res.status(400).json({ error: 'Este usuário já está registrado' })
    }

    // Register the new user
    registeredEmails.add(email.toLowerCase())
    registeredUsernames.add(nomeUsuario.toLowerCase())

    return res.json({
      success: true,
      message: 'Usuário registrado com sucesso',
      usuario: {
        id: Date.now(),
        nomeUsuario,
        emailUsuario: email,
      },
    })
  })
}

// Simple in-memory store for MIDAS profiles keyed by token
const midasProfiles = new Map()

app.get('/api/midas/profile', (req, res) => {
  const auth = req.headers.authorization || ''
  const token = auth.replace(/^Bearer\s+/, '')
  const profile = midasProfiles.get(token) || null
  return res.json({ profile })
})

app.put('/api/midas/profile', (req, res) => {
  const auth = req.headers.authorization || ''
  const token = auth.replace(/^Bearer\s+/, '')
  const profile = req.body || {}
  midasProfiles.set(token, profile)
  return res.json({ profile })
})

// Chat endpoint: forwards messages to external MIDAS API if configured,
// otherwise returns a simple demo response.
app.post('/api/midas/chat', async (req, res) => {
  const { message, context } = req.body || {}
  const apiUrl = process.env.MIDAS_API_URL
  const apiKey = process.env.MIDAS_API_KEY

  if (!apiUrl) {
    // Demo fallback reply
    const reply = `Midas (demo): Recebi sua mensagem: ${message || ''}`
    return res.json({ reply })
  }

  try {
    const headers = { 'Content-Type': 'application/json' }
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`

    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message, context }),
    })

    const data = await resp.json()

    const reply = data.reply || data.text || (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || JSON.stringify(data)

    return res.json({ reply })
  } catch (error) {
    console.error('MIDAS proxy error', error)
    return res.status(500).json({ error: 'Error calling MIDAS API' })
  }
})

app.post('/assistente', async (req, res) => {
  const { pergunta, model: requestedModel, permissoes } = req.body || {}

  if (!pergunta) {
    return res.json({ reply: 'Envie sua pergunta no corpo da requisição.' })
  }

  // Enriquecer prompt com contexto do usuário
  let enrichedPrompt = pergunta
  if (permissoes) {
    const contextParts = []
    
    if (permissoes.time) {
      contextParts.push(`Hora do usuário: ${permissoes.time}`)
    }
    
    if (permissoes.location) {
      contextParts.push(`Localização aproximada do usuário: Latitude ${permissoes.location.lat.toFixed(2)}, Longitude ${permissoes.location.lng.toFixed(2)}`)
    }
    
    if (permissoes.temperature) {
      contextParts.push(`Temperatura da região: ${permissoes.temperature}°C`)
    }
    
    if (contextParts.length > 0) {
      enrichedPrompt = `[Contexto: ${contextParts.join(', ')}]\n\n${pergunta}`
    }
  }

  try {
    const useServiceAccount = Boolean(googleServiceAccountCredentials || GOOGLE_SERVICE_ACCOUNT_KEYFILE)
    
    if (!GOOGLE_GENERATIVE_API_KEY && !useServiceAccount) {
      return res.json({ reply: 'Desculpe, o assistente não está configurado. Verifique as credenciais do Google.', fallback: true })
    }

    // Try Google Generative AI models in order
    const modelsToTry = requestedModel 
      ? [requestedModel, 'gemini-2.0-flash', 'gemini-2.5-pro']
      : ['gemini-2.0-flash', 'gemini-2.5-pro', 'gemini-2.5-flash']

    for (const model of modelsToTry) {
      try {
        console.log(`[Assistente] Tentando Google ${model}`)
        const reply = await callGoogleGenerativeModel(enrichedPrompt, model)
        if (reply) {
          console.log(`[Assistente] Sucesso com Google ${model}`)
          return res.json({ reply, source: 'google_generative', model })
        }
      } catch (err) {
        const resp = err?.response?.data || null
        const msg = String(resp?.error?.message || err?.message || '')
        const status = err?.response?.status

        console.warn(`[Assistente] Google ${model} falhou com status ${status}: ${msg}`)

        // Se é erro de modelo não encontrado, tenta o próximo
        if (status === 404 || msg.includes('not found')) {
          continue
        }

        // Se é erro de quota/rate limit, tenta o próximo
        if (status === 429 || msg.includes('quota') || msg.includes('rate limit')) {
          continue
        }

        // Para outros erros, retorna erro
        return res.json({ 
          reply: `Erro ao consultar Google Generative API: ${msg}`, 
          fallback: true, 
          error: msg 
        })
      }
    }

    // Se chegou aqui, nenhum modelo respondeu
    return res.json({ 
      reply: 'Desculpe, o assistente não conseguiu responder no momento. Tente novamente mais tarde.', 
      fallback: true 
    })
  } catch (error) {
    console.error(`[Assistente] Erro inesperado:`, error.message)
    return res.json({ 
      reply: 'Erro ao consultar o assistente. Tente novamente mais tarde.', 
      fallback: true,
      error: error.message
    })
  }
})

// Static frontend build
app.use(express.static(path.join(__dirname, 'dist')));

// API proxy for development or production integration
if (apiTarget) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: apiTarget,
      changeOrigin: true,
      pathRewrite: { '^/api': '' },
      logLevel: 'warn',
    })
  );
}

// Expose simple metrics for monitoring fallback and quota events (placed before wildcard route)
app.get('/assistente/metrics', (req, res) => {
  return res.json({ generativeMetrics })
})

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
