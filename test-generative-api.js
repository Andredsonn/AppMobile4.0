import fs from 'fs';
import axios from 'axios';
import { JWT } from 'google-auth-library';

const serviceAccountKeyFile = './wise-bongo-463820-s0-ca67b511a460.json';

async function testGenerativeAPI() {
  try {
    // 1. Load service account credentials
    console.log('Loading service account credentials...');
    const credentials = JSON.parse(fs.readFileSync(serviceAccountKeyFile, 'utf8'));
    const projectId = credentials.project_id;
    console.log(`Project ID: ${projectId}`);

    // 2. Get access token using JWT
    console.log('\nGenerating access token...');
    const client = new JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/generative-language',
      ],
    });
    const response = await client.authorize();
    const accessToken = response?.access_token;
    console.log(`Access token generated: ${accessToken ? 'SUCCESS' : 'FAILED'}`);
    if (!accessToken) {
      throw new Error('Failed to get access token');
    }

    // 3. Make test call to Generative API
    console.log('\nMaking test call to Generative Language API...');
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`;
    
    const payload = {
      contents: [
        {
          parts: [
            {
              text: 'Olá! Pode me responder com uma frase curta?',
            },
          ],
        },
      ],
    };

    console.log(`URL: ${apiUrl}`);
    console.log(`Payload: ${JSON.stringify(payload)}`);

    const apiResponse = await axios.post(apiUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    console.log('\n✓ API Response (200 OK):');
    console.log(JSON.stringify(apiResponse.data, null, 2));
    console.log('\n✓ SUCCESS: The API accepted the request. Billing is likely active or using free tier quota.');

  } catch (error) {
    console.error('\n✗ Error occurred:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data, null, 2)}`);

      // Interpret common errors
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 429) {
        console.error('\n[QUOTA EXCEEDED 429]: You have hit the free tier daily quota limit.');
        console.error('   Solution: Enable billing and request quota increase.');
      } else if (status === 403) {
        console.error('\n[PERMISSION DENIED 403]: Likely billing not enabled or project not authorized.');
        console.error('   Solution: Enable billing for this project.');
      } else if (data?.error?.message) {
        console.error(`\n[ERROR]: ${data.error.message}`);
      }
    } else {
      console.error(`${error.message}`);
    }
  }
}

testGenerativeAPI();
