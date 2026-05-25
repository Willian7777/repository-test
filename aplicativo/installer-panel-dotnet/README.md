# Painel de Instalação (.NET) - Protótipo

Este é um protótipo inicial de um aplicativo WinForms que permite listar instaladores (a partir do SharePoint) e executar instalações com elevação (UAC).

Como testar localmente

1. Instale o SDK .NET 6+.
2. Abra um terminal na pasta `installer-panel-dotnet`.
3. Execute:

```powershell
dotnet run
```

Observações e próximos passos
- A versão atual carrega itens de exemplo (URLs do SharePoint fictícias).
- Próximo passo: implementar autenticação com Microsoft (MSAL) e usar Microsoft Graph ou CSOM para enumerar arquivos da biblioteca do SharePoint protegida por conta.
- O app baixa o instalador para `%TEMP%` e inicia com `Verb = runas` (exigirá UAC para inserir senha de administrador).

Implementação MSAL + Graph (atual)

1. Registre um aplicativo no Azure AD (App registrations) e anote o `ClientId`. Configure Redirect URI `http://localhost` e adicione as permissões delegadas `Sites.Read.All` e `Files.Read.All` (admin consent pode ser necessário no tenant).
2. No app, preencha `ClientId` (e opcionalmente `TenantId`) e clique em `Login MSAL (Graph)` — será aberto o fluxo de login no browser.
3. Depois do login, informe a URL do site SharePoint no campo superior no formato: `contoso.sharepoint.com/sites/nomeSite` e clique em `Carregar do SharePoint`.

Executando pelo VS Code

- Abra a pasta do repositório no VS Code.
- Certifique-se de ter o SDK .NET instalado (dotnet --version).
- No Terminal integrado, rode:

```powershell
cd installer-panel-dotnet
dotnet run
```

- Alternativamente, instale a extensão C# (Omnisharp) e pressione `F5` para depurar/rodar o app.


Upload local (nova funcionalidade)

- O aplicativo permite agora fazer upload de instaladores diretamente pela interface (`Upload`).
- Arquivos enviados são copiados para a pasta `packages` dentro da pasta do aplicativo e listados no painel.
- Os metadados dos pacotes ficam em `packages/packages.json`.
- Essa opção dispensa o acesso ao SharePoint; use `Upload` para adicionar instaladores e `Instalar selecionados` para executá-los localmente.

Notas de segurança

- As permissões `Sites.Read.All` e `Files.Read.All` podem requerer consentimento de administrador no Azure AD.
- Não armazene senhas em texto plano; este protótipo usa arquivos locais para instalar quando possível.

Upload local (nova funcionalidade)

- O aplicativo permite agora fazer upload de instaladores diretamente pela interface (`Upload`).
- Arquivos enviados são copiados para a pasta `packages` dentro da pasta do aplicativo e listados no painel.
- Os metadados dos pacotes ficam em `packages/packages.json`.
- Essa opção dispensa o acesso ao SharePoint; use `Upload` para adicionar instaladores e `Instalar selecionados` para executá-los localmente.

Observação: removi o fallback de exemplo para que a listagem local seja mostrada quando não autenticado no Graph.

