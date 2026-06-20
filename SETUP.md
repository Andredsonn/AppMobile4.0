# 🚀 Guia de Configuração Rápida - Projeto Midas

## Passo 1: Configurar a URL da API

Edite o arquivo `/src/services/api.ts` e altere a URL base:

```typescript
const API_BASE_URL = 'https://localhost:5001';
```

Substitua por:
- **Desenvolvimento:** `http://localhost:5001` ou `https://localhost:5001`
- **Produção:** `https://api.seuprojeto.com`

## Passo 2: Certificado SSL (HTTPS Local)

Se sua API usa HTTPS local (`https://localhost:5001`), você pode precisar:

1. Aceitar o certificado auto-assinado no navegador
2. Ou configurar CORS adequadamente na API

## Passo 3: CORS na API

Certifique-se de que sua API Midas está configurada para aceitar requisições do frontend.

No backend C# (.NET), adicione no `Program.cs` ou `Startup.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://seu-dominio.com")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

app.UseCors("AllowFrontend");
```

## Passo 4: Estrutura de Resposta da API

### Login Response

A API deve retornar após autenticação:

```json
{
  "IdUsuario": 1,
  "nomeUsuario": "João",
  "sobrenome": "Silva",
  "emailUsuario": "joao@email.com",
  "telefone": "(11) 99999-9999",
  "IdEmpresa": 1,
  "Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Somatória Response

A rota `/Lancamentos/somatoria` deve retornar:

```json
{
  "totalReceitas": 15000.00,
  "totalDespesas": 8000.00,
  "saldo": 7000.00
}
```

## Passo 5: Testar a Aplicação

1. **Inicie sua API Midas** (Backend C#)
2. **Acesse a aplicação** no navegador
3. **Faça login** com credenciais válidas
4. **Explore o Dashboard**

## Passo 6: Credenciais de Teste

Se sua aplicação já está integrada com a API e o usuário já existe no banco, use essas credenciais existentes do seu ambiente.

Se quiser testar localmente sem backend integrado, o servidor também suporta um usuário de demonstração quando nenhuma API remota estiver configurada:

- Usuário: `Admin`
- Senha: `Senha@123`

```json
{
  "emailUsuario": "admin@midas.com",
  "PasswordString": "senha123"
}
```

## 🔧 Troubleshooting

### Erro: "Erro de conexão com a API"

- ✅ Verifique se a API está rodando
- ✅ Confirme a URL no arquivo `api.ts`
- ✅ Verifique CORS na API

### Erro: 401 Unauthorized

- ✅ Verifique se o token JWT está sendo enviado
- ✅ Confirme que o token não expirou
- ✅ Verifique a configuração de autenticação na API

### Erro: NET::ERR_CERT_AUTHORITY_INVALID

- ✅ Aceite o certificado SSL no navegador
- ✅ Ou use HTTP ao invés de HTTPS em desenvolvimento

## 📝 Exemplo de Requisição

### Login (cURL)

```bash
curl -X POST https://localhost:5001/Usuario/Autenticar \
  -H "Content-Type: application/json" \
  -d '{
    "emailUsuario": "admin@midas.com",
    "PasswordString": "senha123"
  }'
```

### Criar Lançamento (cURL)

```bash
curl -X POST https://localhost:5001/Lancamentos/New \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "idUsuario": 1,
    "tipoLancamento": "RECEITA",
    "descricaoLancamento": "Venda de produto",
    "observacaoLancamento": "Cliente XYZ",
    "valor": 1500.00,
    "data": "2026-02-11T10:00:00Z",
    "dataCriacao": "2026-02-11T10:00:00Z"
  }'
```

## 🎯 Checklist de Configuração

- [ ] API Midas rodando
- [ ] URL da API configurada em `api.ts`
- [ ] CORS configurado na API
- [ ] Certificado SSL aceito (se HTTPS)
- [ ] Usuário de teste criado
- [ ] Login funcionando
- [ ] Dashboard carregando dados

## 📞 Suporte

Se encontrar problemas:

1. Verifique o console do navegador (F12)
2. Verifique os logs da API
3. Confirme que todos os endpoints estão respondendo
4. Teste os endpoints com Postman/Insomnia primeiro

---

**Pronto! Sua aplicação Midas está configurada! 🎉**
