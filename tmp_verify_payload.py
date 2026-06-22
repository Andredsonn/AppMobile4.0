import json
from urllib import request, error

url = 'https://midasproject.azurewebsites.net/Usuario/Autenticar'

payloads = [
    {'emailUsuario': 'admin@midas.com', 'PasswordString': 'senha123'},
    {'nomeUsuario': 'Admin', 'PasswordString': 'Senha@123'},
    {'credenciais': {'emailUsuario': 'admin@midas.com', 'PasswordString': 'senha123'}},
    {'credenciais': {'nomeUsuario': 'Admin', 'PasswordString': 'Senha@123'}},
    {'credenciais': {'credenciais': {'emailUsuario': 'admin@midas.com', 'PasswordString': 'senha123'}}},
]

for payload in payloads:
    data = json.dumps(payload).encode('utf-8')
    req = request.Request(url, data=data, headers={'Content-Type': 'application/json'})
    print('PAYLOAD:', json.dumps(payload))
    try:
        with request.urlopen(req, timeout=20) as resp:
            print('STATUS', resp.status)
            print(resp.read().decode('utf-8'))
    except error.HTTPError as e:
        print('STATUS', e.code)
        print(e.read().decode('utf-8'))
    except Exception as exc:
        print('ERROR', exc)
    print('=' * 80)
