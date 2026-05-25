# Termos - Frontend (React + Vite)

## Execução rápida

```powershell
cd "termos-app/frontend"
npm install
npm run dev
```

O frontend por padrão envia `POST` para `http://localhost:5000/termo`. Para alterar, crie um arquivo `.env` com:

```
VITE_API_URL=https://seu-backend/termo
```

## Funcionalidades

- Preenchimento dos campos obrigatórios (matrícula, nome, dados do equipamento, acessórios).
- Upload de até 5 fotos (convertidas para base64 e enviadas no campo `fotos`).
- Envia JSON para o endpoint `/termo` e exibe o resultado.

## Observações

- Garanta que o backend esteja rodando e que CORS esteja habilitado (foi habilitado para desenvolvimento).