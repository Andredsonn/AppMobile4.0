MIDAS Assistant Integration

This project supports a MIDAS assistant that can use an external API.

Environment variables (set in your deployment environment):

- `MIDAS_API_URL` - URL of the external MIDAS API that accepts POST JSON { message, context } and returns JSON with `reply` or `text`.
- `MIDAS_API_KEY` - (optional) API key or Bearer token for the external service.

Google Cloud APIs (optional)
- `GOOGLE_API_KEY` - API key created in Google Cloud Console (APIs & Services → Credentials).
- `GOOGLE_GENERATIVE_API_KEY` - API key for Google Generative API, if you are not using a service account.
- `GOOGLE_SERVICE_ACCOUNT_JSON` - service account JSON payload (escaped newlines with `\n` inside the private key) used to authenticate calls to the Google Generative API.
- `GOOGLE_APPLICATION_CREDENTIALS` - local file path to a service account JSON file for Google authentication.

If you want MIDAS to use Google Translate or Vision, set `GOOGLE_API_KEY`.
Server exposes helper proxy endpoints:
- `POST /api/google/translate` - body: `{ text: string, target?: string }` returns `{ translatedText }`.
- `POST /api/google/vision` - body: `{ imageBase64?: string, imageUrl?: string }` returns `{ responses }` from Vision API.

These endpoints forward requests to Google using the `GOOGLE_API_KEY` and keep your key off the client.

Alpha Vantage support (optional)
- `ALPHA_VANTAGE_API_KEY` - API key from https://www.alphavantage.co/support/#api-key.
- `GET /api/finance/alpha/intraday?symbol=IBM&interval=5min` - returns latest intraday quote for the requested symbol.

Example Alpha Vantage intraday request:
```bash
curl "http://localhost:3000/api/finance/alpha/intraday?symbol=IBM&interval=5min"
```

Behavior:
- If `MIDAS_API_URL` is set, the server will forward chat messages to that URL via POST.
- If `MIDAS_API_URL` is not set, the server returns a demo fallback reply.

Example curl (replace placeholders):

```bash
curl -X POST $MIDAS_API_URL \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MIDAS_API_KEY" \
  -d '{"message":"Qual é a melhor prática para separar finanças?"}'
```

Server endpoint:
- `POST /api/midas/chat` - body: `{ message: string, context?: any }`.

Frontend:
- The widget in `src/components/MidasWidget.tsx` will POST to `/api/midas/chat` and show replies.

Deployment:
- Set `MIDAS_API_URL` and optionally `MIDAS_API_KEY` in your hosting provider (Heroku, Vercel, Azure, etc.).
- Restart the Node server.

Security note:
- Do not commit secret API keys to the repository. Use environment variables or secret managers.
