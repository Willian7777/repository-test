# Fallback estático para testar o backend sem Node/NPM

## Como servir (recomendado com Python)

```powershell
cd "termos-app/frontend/static-test"
python -m http.server 5173
```

Abra no navegador: http://localhost:5173

## Parâmetro opcional: apontar para outro backend

- Por padrão a página envia para `http://localhost:5000/termo`.
- Para testar outro endpoint, abra `http://localhost:5173/?api=https://seu-backend/termo`.

## Sem Python

- Abra o arquivo `index.html` diretamente no navegador (algumas funcionalidades de `fetch` podem falhar por CORS/file://). Recomendado usar Python para servir localmente.

## Teste sem UI (PowerShell)

```powershell
$payload = @{ type='entrega'; matricula='CS123'; nome='Teste'; equipamento=@{ tipo='Notebook'; modelo='X'; serial='S1' }; acessorios='Fonte'; observacoes='ok' } | ConvertTo-Json -Depth 5
Invoke-RestMethod -Uri http://localhost:5000/termo -Method Post -Body $payload -ContentType 'application/json'
```
