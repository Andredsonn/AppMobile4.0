import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import axios from 'axios';
import { GoogleAuth, JWT } from 'google-auth-library';


dotenv.config();

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const GOOGLE_GENERATIVE_API_KEY = process.env.GOOGLE_GENERATIVE_API_KEY;
const GOOGLE_SERVICE_ACCOUNT_JSON = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
const GOOGLE_SERVICE_ACCOUNT_KEYFILE = process.env.GOOGLE_APPLICATION_CREDENTIALS;

let googleServiceAccountCredentials = null;
if (GOOGLE_SERVICE_ACCOUNT_JSON) {
  try {
    googleServiceAccountCredentials = JSON.parse(GOOGLE_SERVICE_ACCOUNT_JSON.replace(/\\n/g, '\n'));
  } catch (error) {
    console.error('Invalid GOOGLE_SERVICE_ACCOUNT_JSON:', error);
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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
  const lower = String(pergunta || '').toLowerCase()

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

  if (!pergunta) {
    return res.json({ reply: 'Envie sua pergunta no corpo da requisição.' })
  }

  try {
    const useServiceAccount = Boolean(googleServiceAccountCredentials || GOOGLE_SERVICE_ACCOUNT_KEYFILE)
    if (!GOOGLE_GENERATIVE_API_KEY && !useServiceAccount) {
      return res.json({ reply: 'Desculpe, não consigo acessar o assistente de IA agora. Você ainda pode usar o sistema normalmente.', fallback: true })
    }

    const modelsToTry = [
      'gemini-2.5-pro',
      'gemini-2.5-flash',
      'gemini-2.0-flash'
    ]

    const headers = { 'Content-Type': 'application/json' }
    let accessToken = null
    if (useServiceAccount) {
      accessToken = await getGoogleGenerativeAccessToken()
      if (!accessToken && !GOOGLE_GENERATIVE_API_KEY) {
        return res.json({ reply: 'Desculpe, não consigo acessar o assistente de IA agora. Você ainda pode usar o sistema normalmente.', fallback: true })
      }
    }

    const authModes = []
    if (useServiceAccount && accessToken) {
      authModes.push('serviceAccount')
    }
    if (GOOGLE_GENERATIVE_API_KEY) {
      authModes.push('apiKey')
    }
    if (authModes.length === 0) {
      return res.json({ reply: 'Desculpe, não consigo acessar o assistente de IA agora. Você ainda pode usar o sistema normalmente.', fallback: true })
    }

    const tryOrder = requestedModel ? [requestedModel, ...modelsToTry.filter(m => m !== requestedModel)] : modelsToTry

    async function callGoogleModel(model, authMode) {
      const endpoints = ['generateContent', 'generateText']
      let lastError = null

      for (const endpoint of endpoints) {
        try {
          const apiKeySuffix = authMode === 'apiKey' ? `?key=${GOOGLE_GENERATIVE_API_KEY}` : ''
          const url = `https://generativelanguage.googleapis.com/v1/models/${model}:${endpoint}${apiKeySuffix}`
          const requestHeaders = { ...headers }
          if (authMode === 'serviceAccount') {
            requestHeaders.Authorization = `Bearer ${accessToken}`
          }
          const payload = endpoint === 'generateText'
            ? { prompt: { text: `Responda em Português do Brasil. ${enrichedPrompt}` } }
            : {
              contents: [
                { parts: [{ text: 'Responda em Português do Brasil. Sempre responda em português, de forma clara e direta.' }] },
                { parts: [{ text: enrichedPrompt }] },
              ],
            }

          const r = await axios.post(url, payload, { headers: requestHeaders, timeout: 10000 })
          const output = extractGenerativeResponseText(r.data)
          return { output, raw: r.data }
        } catch (err) {
          lastError = err
          const resp = err?.response?.data || null
          const msg = String(resp?.error?.message || err?.message || '')
          const isNotFound = resp?.error?.code === 404 || msg.toLowerCase().includes('not found')
          if (isNotFound) {
            continue
          }
          throw err
        }
      }

      throw lastError
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

    let sawQuotaError = false
    let sawInvalidKey = false
    for (const authMode of authModes) {
      for (let i = 0; i < tryOrder.length; i++) {
        const model = tryOrder[i]
      generativeMetrics.totalAttempts = (generativeMetrics.totalAttempts || 0) + 1
      generativeMetrics.attempts[model] = (generativeMetrics.attempts[model] || 0) + 1

      try {
        const { output, raw } = await callGoogleModel(model, authMode)
        if (output) {
          return res.json({ reply: String(output) })
        }
      } catch (err) {
        const resp = err?.response?.data || null
        const msg = String(resp?.error?.message || err?.message || '')
        const status = err?.response?.status
        const isQuota = status === 429 || msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('limit: 0')
        const isInvalidKey = msg.toLowerCase().includes('api key not valid') || msg.toLowerCase().includes('permission')
        const isNotFound = status === 404 || msg.toLowerCase().includes('not found')
        const isTransient = [429, 500, 502, 503, 504].includes(status) || /high demand|temporarily unavailable|unavailable|timeout/i.test(msg)

        console.warn('Generative model attempt failed', { model, status, message: msg })

        if (isQuota) {
          sawQuotaError = true
          generativeMetrics.quotaErrors[model] = (generativeMetrics.quotaErrors[model] || 0) + 1
        }
        if (isInvalidKey) {
          sawInvalidKey = true
        }

        if (requestedModel && requestedModel !== model) {
          const key = `${requestedModel}->${model}`
          generativeMetrics.fallbacks[key] = (generativeMetrics.fallbacks[key] || 0) + 1
        } else if (i > 0) {
          const prev = tryOrder[i - 1]
          const key = `${prev}->${model}`
          generativeMetrics.fallbacks[key] = (generativeMetrics.fallbacks[key] || 0) + 1
        }

        if (isInvalidKey) {
          return res.json({ reply: 'O assistente de IA não está disponível porque a chave gerada é inválida ou sem permissão.', fallback: true, invalidKey: true })
        }

        if (isQuota || isNotFound || isTransient) {
          continue
        }

        console.error('Generative API error while calling model', model, resp || msg)
        return res.json({ reply: 'Erro ao consultar o assistente. Tente novamente mais tarde.', fallback: true })
      }
    }
    }

    if (sawInvalidKey) {
      return res.json({ reply: 'O assistente de IA não está disponível porque a chave gerada é inválida ou sem permissão.', fallback: true, invalidKey: true })
    }
    if (sawQuotaError) {
      return res.json({ reply: 'Desculpe, o assistente está sem cota nos modelos disponíveis no momento. Tente novamente mais tarde.', fallback: true })
    }
    return res.json({ reply: 'Desculpe, o assistente não conseguiu responder no momento. Tente novamente mais tarde.', fallback: true })
  } catch (error) {
    const responseData = error?.response?.data || null
    const isInvalidKey = responseData?.error?.message && String(responseData.error.message).toLowerCase().includes('api key not valid')

    if (isInvalidKey) {
      console.error('Generative API invalid key', responseData)
      return res.json({ reply: 'O assistente de IA não está disponível porque a chave gerada é inválida. Continue usando o sistema normalmente e validaremos a chave depois.', fallback: true, invalidKey: true })
    }

    console.error('Generative API error', responseData || error.message)
    return res.json({ reply: 'Erro ao consultar o assistente. Tente novamente mais tarde.', fallback: true })
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
