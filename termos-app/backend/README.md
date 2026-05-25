# termos-app (backend)

Projeto termos-app (backend) - Minimal .NET API

## Objetivo

- Scaffold inicial para suportar o MVP do Termo de Entrega/Devolução.

## Endpoints

- `GET /inventory?user={user}` → retorna itens do inventário (mock).
- `POST /termo` → recebe JSON com os campos do termo e gera um arquivo PDF em `data/`.

## Como executar (Windows)

```powershell
cd "termos-app/backend"
dotnet restore
dotnet run
```

## Exemplo de payload para `POST /termo`

```json
{
  "type": "entrega",
  "matricula": "CS1234",
  "nome": "João Silva",
  "equipamento": { "tipo": "Notebook", "modelo": "Dell XPS 13", "serial": "ABC123" },
  "acessorios": "Fonte, Bag",
  "observacoes": "Sem danos",
  "incidentNumber": "INC12345"
}
```

## Observações

- Este projeto gera um arquivo PDF com texto. Para um layout mais rico, considere integrar uma biblioteca (ex.: QuestPDF, iText7) ou usar geração via Word/Power Automate.
- Integração com ServiceNow e OneDrive será implementada posteriormente via Power Automate ou chamadas REST autenticadas.
- Este backend agora gera PDFs reais usando `PdfSharpCore`.

Para restaurar dependências execute:

```powershell
cd "termos-app/backend"
dotnet restore
```

> Observação: imagens enviadas pelo frontend precisam ser tratadas (base64 → arquivo) antes de inserção no PDF; o backend atual gera o PDF com os campos principais.
