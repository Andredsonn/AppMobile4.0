import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const key = process.env.GOOGLE_GENERATIVE_API_KEY;
if (!key) {
  console.error('KEY MISSING');
  process.exit(1);
}

const apiUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-pro:generateContent?key=' + key;
const payloads = [
  { content: [{ type: 'text', text: 'Olá, qual é a previsão de fluxo de caixa hoje?' }] },
  { prompt: { text: 'Olá, qual é a previsão de fluxo de caixa hoje?' } },
  { prompt: [{ text: 'Olá, qual é a previsão de fluxo de caixa hoje?' }] },
  { input: { text: 'Olá, qual é a previsão de fluxo de caixa hoje?' } },
  { instances: [{ content: [{ type: 'text', text: 'Olá, qual é a previsão de fluxo de caixa hoje?' }] }] },
  { instances: [{ text: 'Olá, qual é a previsão de fluxo de caixa hoje?' }] },
  { message: [{ text: 'Olá, qual é a previsão de fluxo de caixa hoje?' }] },
  { messages: [{ text: 'Olá, qual é a previsão de fluxo de caixa hoje?' }] },
  { text: 'Olá, qual é a previsão de fluxo de caixa hoje?' },
];

for (const p of payloads) {
  try {
    console.log('Trying payload:', JSON.stringify(p));
    const response = await axios.post(apiUrl, p, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 20000,
    });
    console.log('SUCCESS payload:', JSON.stringify(p));
    console.log(JSON.stringify(response.data, null, 2));
    break;
  } catch (err) {
    console.error('FAIL payload:', JSON.stringify(p));
    if (err.response) {
      console.error(JSON.stringify(err.response.data, null, 2));
    } else {
      console.error(err.message);
    }
    console.error('---');
  }
}
