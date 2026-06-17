/**
 * Domínios oficiais de cada certificação, extraídos dos Study Guides da Microsoft.
 * Fonte: https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/
 */

export interface CertDomain {
  id: string;
  title: string;
  weight: string;
  objectives: string[];
  learnUrl: string;
}

export interface CertStudyData {
  examCode: string;
  certName: string;
  learnUrl: string;
  domains: CertDomain[];
}

const BASE = "https://learn.microsoft.com/en-us";

export const certStudyData: Record<string, CertStudyData> = {

  // ── Microsoft 365 Copilot ────────────────────────────────────────────────────
  "AB-900": {
    examCode: "AB-900",
    certName: "Microsoft 365 Copilot and Agent Administration Fundamentals",
    learnUrl: `${BASE}/credentials/certifications/copilot-and-agent-administration-fundamentals/`,
    domains: [
      {
        id: "ab-900-d1",
        title: "Principais recursos e objetos dos serviços do Microsoft 365",
        weight: "30–35%",
        objectives: [
          "Explicar como os tipos de licença atribuídos a usuários e grupos afetam o acesso aos recursos do Microsoft 365",
          "Explorar as configurações da organização usando o Centro de administração do Microsoft 365",
          "Identificar os objetos a serem configurados no Exchange Online: caixas de correio e listas de distribuição",
          "Identificar os objetos a serem configurados no SharePoint: sites, bibliotecas e pastas",
          "Identificar funções e permissões para sites no SharePoint",
          "Identificar os objetos a serem configurados no Teams: equipes, canais e políticas",
          "Explicar os princípios básicos de Confiança Zero (Zero Trust)",
          "Entender métodos de autenticação, autorização, proteção contra ameaças e Microsoft Defender XDR",
          "Entender recursos do Microsoft Entra e políticas de acesso condicional",
          "Entender a finalidade e os benefícios do SSO (logon único)",
          "Identificar ferramentas para solucionar problemas de MFA, acesso condicional e entradas arriscadas",
          "Interpretar a Classificação de Segurança de Identidade no Microsoft Entra ID",
          "Usar ferramentas para examinar logs de auditoria de atividades de usuário e administrador",
          "Identificar a função do PIM (Privileged Identity Management)",
          "Noções básicas sobre registros de aplicativos e aplicativos Empresariais",
        ],
        learnUrl: "https://learn.microsoft.com/pt-br/training/paths/m365-security-management/",
      },
      {
        id: "ab-900-d2",
        title: "Proteção e governança de dados para Microsoft 365 e Copilot",
        weight: "35–40%",
        objectives: [
          "Entender recursos do Microsoft Purview: Proteção de Informações, DLP, Gerenciamento de Riscos Internos, Conformidade de Comunicações",
          "Entender o DSPM (Gerenciamento de Postura de Segurança de Dados) para IA do Microsoft Purview",
          "Identificar casos de uso para rótulos de confidencialidade no Microsoft Purview",
          "Entender a classificação de dados e retenção no Microsoft Purview",
          "Entender como o Copilot acessa dados e como o Microsoft Graph influencia as respostas",
          "Entender como o Copilot usa permissões e controles do Microsoft 365, Purview e Defender",
          "Entender os princípios de IA responsável",
          "Identificar riscos usando o Gerenciador de Conformidade do Microsoft Purview",
          "Identificar informações confidenciais usando o Microsoft Purview Data Explorer",
          "Identificar riscos com o Gerenciamento de Risco Interno e responder a alertas de DLP",
          "Descobrir e gerenciar atividade de IA usando o DSPM para IA",
          "Pesquisar arquivos e emails usando eDiscovery do Microsoft Purview",
          "Identificar ferramentas para solucionar problemas de compartilhamento excessivo no SharePoint",
          "Executar um relatório de governança de acesso a dados no SharePoint",
          "Entender recursos do Gerenciamento Avançado do SharePoint, incluindo acesso restrito ao site",
        ],
        learnUrl: "https://learn.microsoft.com/pt-br/training/paths/implement-microsoft-365-security-threat-management/",
      },
      {
        id: "ab-900-d3",
        title: "Tarefas administrativas básicas para Copilot e agentes",
        weight: "25–30%",
        objectives: [
          "Comparar funcionalidades integradas do Copilot e dos agentes",
          "Comparar o modelo de licença mensal do Copilot com o pagamento conforme o uso, incluindo o SharePoint",
          "Identificar quais recursos do Copilot podem ser habilitados ou desabilitados",
          "Identificar casos de uso para Pesquisador, Analista e agentes personalizados",
          "Atribuir licenças do Copilot",
          "Monitorar e gerenciar políticas de cobrança do Copilot pague conforme o uso",
          "Monitorar o uso e adoção do Copilot com Análise do Copilot e Centro de administração do M365",
          "Gerenciar prompts: salvar, compartilhar, agendar e excluir",
          "Identificar como configurar o acesso do usuário aos agentes",
          "Criar um agente e entender o processo de aprovação para agentes",
          "Monitorar agentes: uso, insights operacionais e ciclo de vida, via Centro de administração do M365 e Power Platform",
        ],
        learnUrl: "https://learn.microsoft.com/pt-br/training/paths/m365-teams-sharepoint/",
      },
    ],
  },
  "AI-900": {
    examCode: "AI-900",
    certName: "Azure AI Fundamentals",
    learnUrl: `${BASE}/credentials/certifications/azure-ai-fundamentals/`,
    domains: [
      {
        id: "ai-900-d1",
        title: "Cargas de trabalho e considerações de IA",
        weight: "15–20%",
        objectives: [
          "Identificar cargas de trabalho de visão computacional",
          "Identificar cargas de trabalho de processamento de linguagem natural",
          "Identificar cargas de trabalho de processamento de documentos",
          "Identificar cargas de trabalho de IA generativa",
          "Descrever considerações de IA responsável: imparcialidade, confiabilidade, privacidade, inclusão, transparência e responsabilidade",
        ],
        learnUrl: `${BASE}/training/paths/get-started-with-artificial-intelligence-on-azure/`,
      },
      {
        id: "ai-900-d2",
        title: "Princípios de Machine Learning no Azure",
        weight: "15–20%",
        objectives: [
          "Identificar cenários de regressão, classificação e clustering",
          "Identificar técnicas de deep learning e arquitetura Transformer",
          "Descrever features e labels em datasets para ML",
          "Descrever como datasets de treino e validação são usados",
          "Descrever capacidades do Azure Machine Learning: AutoML, serviços de dados e compute, gerenciamento de modelos",
        ],
        learnUrl: `${BASE}/training/paths/explore-fundamentals-of-machine-learning/`,
      },
      {
        id: "ai-900-d3",
        title: "Visão Computacional no Azure",
        weight: "15–20%",
        objectives: [
          "Identificar soluções de classificação de imagem e detecção de objetos",
          "Identificar soluções de OCR (reconhecimento óptico de caracteres)",
          "Identificar soluções de detecção e análise facial",
          "Descrever capacidades do Azure AI Vision",
          "Descrever capacidades do Azure AI Face detection",
        ],
        learnUrl: `${BASE}/training/paths/explore-computer-vision-microsoft-azure/`,
      },
      {
        id: "ai-900-d4",
        title: "Processamento de Linguagem Natural (NLP) no Azure",
        weight: "15–20%",
        objectives: [
          "Identificar usos de extração de frases-chave, reconhecimento de entidades e análise de sentimentos",
          "Identificar usos de modelagem de linguagem, reconhecimento e síntese de fala, e tradução",
          "Descrever capacidades do Azure AI Language",
          "Descrever capacidades do Azure AI Speech",
        ],
        learnUrl: `${BASE}/training/paths/explore-natural-language-processing/`,
      },
      {
        id: "ai-900-d5",
        title: "IA Generativa no Azure",
        weight: "20–25%",
        objectives: [
          "Identificar características de modelos de IA generativa",
          "Identificar cenários comuns de IA generativa",
          "Descrever considerações de IA responsável para IA generativa",
          "Descrever recursos e capacidades do Azure AI Foundry",
          "Descrever recursos e capacidades do Azure OpenAI Service",
          "Descrever o catálogo de modelos do Azure AI Foundry",
        ],
        learnUrl: `${BASE}/training/paths/introduction-generative-ai/`,
      },
    ],
  },

  "AI-102": {
    examCode: "AI-102",
    certName: "Azure AI Engineer Associate",
    learnUrl: `${BASE}/credentials/certifications/azure-ai-engineer/`,
    domains: [
      {
        id: "ai-102-d1",
        title: "Planejar e gerenciar uma solução de IA do Azure",
        weight: "15–20%",
        objectives: [
          "Selecionar os recursos do Azure AI Services adequados",
          "Planejar e configurar a segurança para os recursos do Azure AI Services",
          "Criar e gerenciar recursos de Azure AI Services",
          "Monitorar os recursos do Azure AI Services",
        ],
        learnUrl: `${BASE}/training/paths/prepare-for-ai-engineering/`,
      },
      {
        id: "ai-102-d2",
        title: "Implementar soluções de Visão Computacional",
        weight: "25–30%",
        objectives: [
          "Analisar imagens com Azure AI Vision",
          "Implementar reconhecimento óptico de caracteres",
          "Implementar detecção e análise facial com Azure AI Face",
          "Treinar modelos de visão computacional personalizada com Custom Vision",
        ],
        learnUrl: `${BASE}/training/paths/create-computer-vision-solutions-azure-cognitive-services/`,
      },
      {
        id: "ai-102-d3",
        title: "Implementar soluções de NLP",
        weight: "25–30%",
        objectives: [
          "Analisar texto com o Azure AI Language",
          "Gerenciar e implantar modelos de linguagem",
          "Implementar soluções de fala com Azure AI Speech",
          "Criar soluções de tradução com Azure AI Translator",
        ],
        learnUrl: `${BASE}/training/paths/process-translate-text-azure-cognitive-services/`,
      },
      {
        id: "ai-102-d4",
        title: "Implementar soluções de Mineração de Conhecimento e Documento",
        weight: "15–20%",
        objectives: [
          "Implementar Azure Cognitive Search",
          "Implementar enriquecimento de IA em pipelines de indexação",
          "Implementar soluções de inteligência de documentos com Azure AI Document Intelligence",
        ],
        learnUrl: `${BASE}/training/paths/implement-knowledge-mining-azure-cognitive-search/`,
      },
      {
        id: "ai-102-d5",
        title: "Implementar soluções de IA Generativa",
        weight: "15–20%",
        objectives: [
          "Usar o Azure OpenAI Service para desenvolver soluções de IA generativa",
          "Implementar prompts com engenharia de prompt",
          "Implementar o Azure AI Foundry para soluções de agentes de IA",
        ],
        learnUrl: `${BASE}/training/paths/develop-ai-solutions-azure-openai/`,
      },
    ],
  },

  // ── Azure Admin ─────────────────────────────────────────────────────────────
  "AZ-900": {
    examCode: "AZ-900",
    certName: "Azure Fundamentals",
    learnUrl: `${BASE}/credentials/certifications/azure-fundamentals/`,
    domains: [
      {
        id: "az-900-d1",
        title: "Conceitos de Cloud",
        weight: "25–30%",
        objectives: [
          "Definir computação em nuvem e seus modelos (IaaS, PaaS, SaaS)",
          "Descrever o modelo de responsabilidade compartilhada",
          "Comparar nuvem pública, privada e híbrida",
          "Descrever cloud scaling: vertical e horizontal",
          "Descrever benefícios: alta disponibilidade, escalabilidade, agilidade, elasticidade, alcance global, DR",
        ],
        learnUrl: `${BASE}/training/paths/microsoft-azure-fundamentals-describe-cloud-concepts/`,
      },
      {
        id: "az-900-d2",
        title: "Arquitetura e Serviços do Azure",
        weight: "35–40%",
        objectives: [
          "Descrever componentes de arquitetura central: regiões, zonas de disponibilidade, grupos de recursos, assinaturas",
          "Descrever serviços de computação: VMs, App Service, Azure Container Instances, AKS, Azure Functions",
          "Descrever serviços de rede: Virtual Network, VPN Gateway, Azure ExpressRoute, Azure DNS",
          "Descrever serviços de armazenamento: Blob, Disk, File, Queue, Table",
          "Descrever serviços de identidade, acesso e segurança: Entra ID, MFA, RBAC, Microsoft Defender for Cloud",
        ],
        learnUrl: `${BASE}/training/paths/azure-fundamentals-describe-azure-architecture-services/`,
      },
      {
        id: "az-900-d3",
        title: "Gestão e Governança do Azure",
        weight: "30–35%",
        objectives: [
          "Descrever gerenciamento de custos: calculadora de preços, calculadora TCO, Azure Cost Management",
          "Descrever ferramentas de governança: Azure Policy, locks de recursos, Microsoft Purview",
          "Descrever ferramentas de implantação: Azure Portal, CLI, PowerShell, ARM templates, Azure Arc",
          "Descrever ferramentas de monitoramento: Azure Advisor, Service Health, Azure Monitor",
        ],
        learnUrl: `${BASE}/training/paths/describe-azure-management-governance/`,
      },
    ],
  },

  "AZ-104": {
    examCode: "AZ-104",
    certName: "Azure Administrator Associate",
    learnUrl: `${BASE}/credentials/certifications/azure-administrator/`,
    domains: [
      {
        id: "az-104-d1",
        title: "Gerenciar Identidades e Governança do Azure",
        weight: "15–20%",
        objectives: [
          "Gerenciar objetos do Microsoft Entra ID: usuários, grupos, dispositivos",
          "Gerenciar acesso a recursos com RBAC",
          "Gerenciar assinaturas e governança: políticas, locks, grupos de gerenciamento",
        ],
        learnUrl: `${BASE}/training/paths/az-104-manage-identities-governance/`,
      },
      {
        id: "az-104-d2",
        title: "Implementar e Gerenciar Armazenamento",
        weight: "15–20%",
        objectives: [
          "Configurar contas de armazenamento e acesso",
          "Gerenciar Azure Blob Storage e Azure Files",
          "Configurar Azure Storage replication e backups",
        ],
        learnUrl: `${BASE}/training/paths/az-104-manage-storage/`,
      },
      {
        id: "az-104-d3",
        title: "Implantar e Gerenciar Recursos de Computação",
        weight: "20–25%",
        objectives: [
          "Automatizar a implantação de VMs usando templates ARM e Bicep",
          "Configurar VMs: tamanho, armazenamento, networking, alta disponibilidade",
          "Provisionar e gerenciar containers com ACI e AKS",
          "Criar e configurar Azure App Service",
        ],
        learnUrl: `${BASE}/training/paths/az-104-manage-compute-resources/`,
      },
      {
        id: "az-104-d4",
        title: "Implementar e Gerenciar Redes Virtuais",
        weight: "15–20%",
        objectives: [
          "Configurar Virtual Networks e subnets",
          "Configurar roteamento de rede e service endpoints",
          "Configurar Azure Load Balancer e Azure Application Gateway",
          "Implementar Azure VPN Gateway e ExpressRoute",
          "Configurar Network Security Groups e Azure Firewall",
        ],
        learnUrl: `${BASE}/training/paths/az-104-manage-virtual-networks/`,
      },
      {
        id: "az-104-d5",
        title: "Monitorar e Manter Recursos do Azure",
        weight: "10–15%",
        objectives: [
          "Configurar e interpretar monitoramento com Azure Monitor",
          "Implementar backup e recuperação com Azure Backup e Site Recovery",
        ],
        learnUrl: `${BASE}/training/paths/az-104-monitor-backup-resources/`,
      },
    ],
  },

  "AZ-204": {
    examCode: "AZ-204",
    certName: "Azure Developer Associate",
    learnUrl: `${BASE}/credentials/certifications/azure-developer/`,
    domains: [
      { id: "az-204-d1", title: "Desenvolver soluções de computação do Azure", weight: "25–30%", objectives: ["Implementar Azure App Service Web Apps", "Implementar Azure Functions", "Implementar soluções em containers: ACI e AKS"], learnUrl: `${BASE}/training/paths/create-azure-app-service-web-apps/` },
      { id: "az-204-d2", title: "Desenvolver para armazenamento do Azure", weight: "15–20%", objectives: ["Desenvolver soluções com Azure Cosmos DB", "Desenvolver soluções com Azure Blob Storage"], learnUrl: `${BASE}/training/paths/develop-solutions-that-use-blob-storage/` },
      { id: "az-204-d3", title: "Implementar segurança do Azure", weight: "20–25%", objectives: ["Implementar autenticação com Microsoft Identity Platform e Microsoft Entra ID", "Implementar soluções de acesso seguro a recursos: Azure Key Vault e Managed Identities"], learnUrl: `${BASE}/training/paths/implement-azure-security/` },
      { id: "az-204-d4", title: "Monitorar, solucionar problemas e otimizar soluções", weight: "15–20%", objectives: ["Implementar caching com Azure Cache for Redis", "Solucionar problemas usando Application Insights e Azure Monitor"], learnUrl: `${BASE}/training/paths/instrument-solutions-support-monitoring-logging/` },
      { id: "az-204-d5", title: "Conectar e consumir serviços do Azure e de terceiros", weight: "15–20%", objectives: ["Implementar Azure API Management", "Desenvolver soluções baseadas em eventos com Azure Event Grid, Event Hubs e Service Bus", "Desenvolver soluções baseadas em mensagens com Azure Queue Storage e Service Bus"], learnUrl: `${BASE}/training/paths/connect-your-services-together/` },
    ],
  },

  "AZ-305": {
    examCode: "AZ-305",
    certName: "Azure Solutions Architect Expert",
    learnUrl: `${BASE}/credentials/certifications/azure-solutions-architect/`,
    domains: [
      { id: "az-305-d1", title: "Design de soluções de identidade, governança e monitoramento", weight: "25–30%", objectives: ["Projetar soluções de identidade e acesso com Microsoft Entra ID", "Projetar soluções de governança com Azure Policy e management groups", "Projetar soluções de monitoramento com Azure Monitor e Microsoft Sentinel"], learnUrl: `${BASE}/training/paths/design-identity-governance-and-monitor-solutions/` },
      { id: "az-305-d2", title: "Design de soluções de armazenamento de dados", weight: "20–25%", objectives: ["Projetar soluções de armazenamento não relacional: Azure Storage, Cosmos DB", "Projetar soluções de armazenamento relacional: Azure SQL, Azure Database for PostgreSQL/MySQL", "Projetar integração de dados: Azure Data Factory, Azure Synapse Analytics"], learnUrl: `${BASE}/training/paths/design-data-storage-solutions/` },
      { id: "az-305-d3", title: "Design de soluções de continuidade de negócios", weight: "15–20%", objectives: ["Projetar soluções de backup com Azure Backup", "Projetar soluções de recuperação de desastres com Azure Site Recovery", "Projetar para alta disponibilidade: Availability Zones, load balancing"], learnUrl: `${BASE}/training/paths/design-business-continuity-solutions/` },
      { id: "az-305-d4", title: "Design de soluções de infraestrutura", weight: "30–35%", objectives: ["Projetar soluções de computação: VMs, App Service, AKS, Azure Functions", "Projetar soluções de rede: VNet, VPN, ExpressRoute, Azure Firewall, Front Door", "Projetar migrações para o Azure: Azure Migrate, migration strategies"], learnUrl: `${BASE}/training/paths/design-infranstructure-solutions/` },
    ],
  },

  "AZ-400": {
    examCode: "AZ-400",
    certName: "Azure DevOps Engineer Expert",
    learnUrl: `${BASE}/credentials/certifications/azure-devops/`,
    domains: [
      { id: "az-400-d1", title: "Configurar processos e comunicações", weight: "10–15%", objectives: ["Configurar rastreamento de atividades e relatórios no Azure DevOps", "Documentar e comunicar arquitetura: wikis, diagramas, integração com Teams/Slack"], learnUrl: `${BASE}/training/paths/az-400-work-git-for-enterprise-devops/` },
      { id: "az-400-d2", title: "Design e implementação de estratégias de versionamento", weight: "20–25%", objectives: ["Design de fluxo de trabalho com Git branching strategies", "Implementar e gerenciar repositórios Git no Azure Repos e GitHub"], learnUrl: `${BASE}/training/paths/az-400-manage-source-control/` },
      { id: "az-400-d3", title: "Design e implementação de pipelines de build e release", weight: "40–45%", objectives: ["Design e implementação de pipelines com Azure Pipelines e GitHub Actions", "Configurar agentes e pools de agentes", "Implementar estratégias de deployment: blue-green, canary, ring"], learnUrl: `${BASE}/training/paths/az-400-implement-ci-with-azure-pipelines-github-actions/` },
      { id: "az-400-d4", title: "Desenvolver um plano de segurança e compliance", weight: "10–15%", objectives: ["Design e implementação de segurança de pipelines: service connections, secrets, RBAC", "Escanear código com ferramentas de SAST/DAST e gerenciar dependências com Dependabot"], learnUrl: `${BASE}/training/paths/az-400-implement-security-validate-code-bases-compliance/` },
      { id: "az-400-d5", title: "Implementar uma estratégia de instrumentação", weight: "10–15%", objectives: ["Configurar monitoramento de aplicações e infraestrutura com Azure Monitor e Application Insights", "Implementar alertas, dashboards e relatórios de saúde"], learnUrl: `${BASE}/training/paths/az-400-develop-instrumentation-strategy/` },
    ],
  },

  // ── Segurança ───────────────────────────────────────────────────────────────
  "SC-900": {
    examCode: "SC-900",
    certName: "Security, Compliance & Identity Fundamentals",
    learnUrl: `${BASE}/credentials/certifications/security-compliance-and-identity-fundamentals/`,
    domains: [
      { id: "sc-900-d1", title: "Conceitos de Segurança, Conformidade e Identidade", weight: "10–15%", objectives: ["Descrever o modelo de responsabilidade compartilhada", "Descrever conceitos de defesa em profundidade e Zero Trust", "Descrever ameaças comuns e tipos de criptografia"], learnUrl: `${BASE}/training/paths/describe-concepts-of-security-compliance-identity/` },
      { id: "sc-900-d2", title: "Capacidades do Microsoft Entra", weight: "25–30%", objectives: ["Descrever serviços e tipos de identidade do Entra ID", "Descrever capacidades de autenticação: MFA, SSPR, sem senha", "Descrever gerenciamento de acesso: Conditional Access, RBAC, Entra Roles", "Descrever proteção e governança de identidade: Identity Protection, PIM, Access Reviews"], learnUrl: `${BASE}/training/paths/describe-capabilities-of-microsoft-identity-access/` },
      { id: "sc-900-d3", title: "Soluções de Segurança da Microsoft", weight: "25–30%", objectives: ["Descrever gerenciamento de segurança básico no Azure: Defender for Cloud, Secure Score", "Descrever capacidades do Microsoft Sentinel", "Descrever proteção contra ameaças com Microsoft 365 Defender: Defender for Endpoint, Office 365, Cloud Apps"], learnUrl: `${BASE}/training/paths/describe-capabilities-of-microsoft-security-solutions/` },
      { id: "sc-900-d4", title: "Soluções de Conformidade da Microsoft", weight: "20–25%", objectives: ["Descrever o portal de conformidade do Microsoft Purview e o Compliance Manager", "Descrever proteção de informações e gerenciamento do ciclo de vida de dados", "Descrever soluções de risco interno, eDiscovery e auditoria"], learnUrl: `${BASE}/training/paths/describe-capabilities-of-microsoft-compliance-solutions/` },
    ],
  },

  "SC-200": {
    examCode: "SC-200",
    certName: "Microsoft Security Operations Analyst",
    learnUrl: `${BASE}/credentials/certifications/security-operations-analyst/`,
    domains: [
      { id: "sc-200-d1", title: "Mitigar ameaças com Microsoft Defender XDR", weight: "25–30%", objectives: ["Mitigar ameaças a endpoints com Microsoft Defender for Endpoint", "Mitigar ameaças de identidade com Defender for Identity e Entra ID Protection", "Mitigar ameaças em emails com Defender for Office 365", "Gerenciar alertas e incidentes no portal Microsoft 365 Defender"], learnUrl: `${BASE}/training/paths/sc-200-mitigate-threats-using-microsoft-365-defender/` },
      { id: "sc-200-d2", title: "Mitigar ameaças com Microsoft Defender for Cloud", weight: "20–25%", objectives: ["Implementar proteção de workloads com Microsoft Defender for Cloud", "Configurar e integrar conectores de dados no Defender for Cloud", "Remediar alertas e recomendações de segurança"], learnUrl: `${BASE}/training/paths/sc-200-mitigate-threats-using-azure-defender/` },
      { id: "sc-200-d3", title: "Mitigar ameaças com Microsoft Sentinel", weight: "50–55%", objectives: ["Design e implementação do workspace do Microsoft Sentinel", "Conectar fontes de dados ao Sentinel usando conectores de dados", "Detectar ameaças com Analytics rules (KQL)", "Automatizar respostas com SOAR: Playbooks (Logic Apps) e Automation Rules", "Realizar threat hunting proativo com queries KQL e Notebooks"], learnUrl: `${BASE}/training/paths/sc-200-utilize-kql-for-azure-sentinel/` },
    ],
  },

  "SC-300": {
    examCode: "SC-300",
    certName: "Microsoft Identity and Access Administrator",
    learnUrl: `${BASE}/credentials/certifications/identity-and-access-administrator/`,
    domains: [
      { id: "sc-300-d1", title: "Implementar soluções de gerenciamento de identidade", weight: "25–30%", objectives: ["Implementar configurações iniciais do Microsoft Entra ID", "Criar, configurar e gerenciar identidades: usuários, grupos, identidades externas"], learnUrl: `${BASE}/training/paths/implement-identity-management-solution/` },
      { id: "sc-300-d2", title: "Implementar soluções de autenticação e gerenciamento de acesso", weight: "25–30%", objectives: ["Planejar e implementar MFA e métodos de autenticação sem senha", "Implementar Conditional Access e Identity Protection"], learnUrl: `${BASE}/training/paths/implement-authentication-access-management-solution/` },
      { id: "sc-300-d3", title: "Implementar gerenciamento de acesso para aplicações", weight: "25–30%", objectives: ["Planejar, implementar e monitorar integração de aplicações no Entra ID", "Configurar e gerenciar permissões de API e consentimento de aplicações"], learnUrl: `${BASE}/training/paths/implement-access-management-for-apps/` },
      { id: "sc-300-d4", title: "Planejar e implementar estratégia de governança de identidade", weight: "20–25%", objectives: ["Planejar e implementar Entitlement Management e Access Reviews", "Planejar e implementar Privileged Identity Management (PIM)"], learnUrl: `${BASE}/training/paths/plan-implement-identity-governance-strategy/` },
    ],
  },

  "SC-100": {
    examCode: "SC-100",
    certName: "Microsoft Cybersecurity Architect Expert",
    learnUrl: `${BASE}/credentials/certifications/cybersecurity-architect-expert/`,
    domains: [
      { id: "sc-100-d1", title: "Design de estratégias de segurança Zero Trust", weight: "30–35%", objectives: ["Criar estratégia e arquitetura de segurança Zero Trust", "Avaliar a postura de segurança com Microsoft Security Benchmark e Secure Score", "Design de soluções de segurança de infraestrutura e dados"], learnUrl: `${BASE}/training/paths/design-solutions-microsoft-cybersecurity-architect/` },
      { id: "sc-100-d2", title: "Design de soluções de segurança para operações", weight: "20–25%", objectives: ["Design de soluções de detecção e resposta com Microsoft Sentinel e Defender XDR", "Design de soluções de SOAR (Security Orchestration, Automation, and Response)"], learnUrl: `${BASE}/training/paths/design-security-solutions-for-applications/` },
      { id: "sc-100-d3", title: "Design de soluções de segurança para aplicações e dados", weight: "20–25%", objectives: ["Especificar prioridades para mitigar ameaças a aplicações", "Design de estratégias de segurança de dados: classificação, proteção, DLP"], learnUrl: `${BASE}/training/paths/design-security-solutions-for-infrastructure/` },
      { id: "sc-100-d4", title: "Design de soluções para identidade e acesso", weight: "20–25%", objectives: ["Design de soluções de identidade em ambientes híbridos e multi-cloud", "Design de estratégia de acesso privilegiado: PAW, PIM, JEA"], learnUrl: `${BASE}/training/paths/design-identity-governance-solutions/` },
    ],
  },

  // ── Dados ───────────────────────────────────────────────────────────────────
  "DP-900": {
    examCode: "DP-900",
    certName: "Azure Data Fundamentals",
    learnUrl: `${BASE}/credentials/certifications/azure-data-fundamentals/`,
    domains: [
      { id: "dp-900-d1", title: "Conceitos Fundamentais de Dados", weight: "25–30%", objectives: ["Identificar tipos de dados: estruturados, semi-estruturados, não estruturados", "Identificar formatos de arquivo de dados: delimitado, JSON, XML, AVRO, ORC, Parquet", "Identificar tipos de armazenamento de dados e workloads: transacionais (OLTP) vs analíticos (OLAP)", "Identificar funções de profissional de dados: Engenheiro, Analista, Cientista, DBA"], learnUrl: `${BASE}/training/paths/azure-data-fundamentals-explore-core-data-concepts/` },
      { id: "dp-900-d2", title: "Dados Relacionais no Azure", weight: "20–25%", objectives: ["Descrever características de dados relacionais: tabelas, views, índices, chaves primárias/estrangeiras", "Descrever instruções SQL: DDL, DML", "Descrever serviços de banco de dados relacional no Azure: Azure SQL, Azure Database for MySQL/PostgreSQL"], learnUrl: `${BASE}/training/paths/azure-data-fundamentals-explore-relational-data/` },
      { id: "dp-900-d3", title: "Dados Não Relacionais no Azure", weight: "15–20%", objectives: ["Descrever capacidades do Azure Blob Storage, Azure Files, Azure Table Storage", "Descrever capacidades do Azure Cosmos DB e seus modelos de consistência e APIs"], learnUrl: `${BASE}/training/paths/azure-data-fundamentals-explore-non-relational-data/` },
      { id: "dp-900-d4", title: "Cargas de Trabalho Analíticas no Azure", weight: "25–30%", objectives: ["Descrever conceitos de analytics e data warehousing", "Descrever capacidades do Azure Synapse Analytics, Azure Databricks e HDInsight", "Descrever capacidades do Azure Data Factory", "Descrever capacidades do Microsoft Fabric e Power BI"], learnUrl: `${BASE}/training/paths/azure-data-fundamentals-explore-data-warehouse-analytics/` },
    ],
  },

  "DP-203": {
    examCode: "DP-203",
    certName: "Azure Data Engineer Associate",
    learnUrl: `${BASE}/credentials/certifications/azure-data-engineer/`,
    domains: [
      { id: "dp-203-d1", title: "Design e implementação de armazenamento de dados", weight: "15–20%", objectives: ["Implementar uma estratégia de particionamento para arquivos e tabelas", "Design e implementação do Azure Data Lake Storage Gen2", "Implementar Azure Stream Analytics para processamento de dados em tempo real"], learnUrl: `${BASE}/training/paths/data-integration-scale-azure-data-factory/` },
      { id: "dp-203-d2", title: "Design e desenvolvimento de processamento de dados", weight: "40–45%", objectives: ["Ingerir e transformar dados com Azure Data Factory e Azure Synapse Pipelines", "Transformar dados com Apache Spark no Azure Synapse Analytics e Azure Databricks", "Implementar soluções de streaming com Azure Event Hubs e Azure Stream Analytics"], learnUrl: `${BASE}/training/paths/realize-integrated-analytical-solutions-with-azure-synapse-analytics/` },
      { id: "dp-203-d3", title: "Design e implementação de segurança e monitoramento de dados", weight: "25–30%", objectives: ["Design de segurança para armazenamentos de dados: controle de acesso, criptografia, mascaramento", "Monitorar pipelines de dados e otimizar performance"], learnUrl: `${BASE}/training/paths/implement-data-management-security-azure-synapse/` },
      { id: "dp-203-d4", title: "Manutenção e otimização de soluções de dados", weight: "15–20%", objectives: ["Implementar tabelas e índices no Azure Synapse Analytics", "Gerenciar workloads e otimizar queries em Azure Synapse Analytics e Azure Databricks"], learnUrl: `${BASE}/training/paths/optimize-data-warehouse-query-performance-in-azure-synapse-analytics/` },
    ],
  },

  "DP-300": {
    examCode: "DP-300",
    certName: "Azure Database Administrator Associate",
    learnUrl: `${BASE}/credentials/certifications/azure-database-administrator/`,
    domains: [
      { id: "dp-300-d1", title: "Planejar e implementar recursos de plataforma de dados", weight: "15–20%", objectives: ["Implementar SQL Server em IaaS: Azure VMs, Azure SQL Managed Instance", "Implementar Azure SQL Database (PaaS)", "Avaliar e migrar bancos de dados com Azure Database Migration Service"], learnUrl: `${BASE}/training/paths/deploy-paas-solutions-with-azure-sql/` },
      { id: "dp-300-d2", title: "Implementar um ambiente seguro", weight: "15–20%", objectives: ["Configurar autenticação e autorização: logins, usuários, permissões, RBAC", "Implementar proteção de dados: TDE, criptografia em trânsito, mascaramento dinâmico de dados"], learnUrl: `${BASE}/training/paths/secure-data-warehouse-azure-synapse-analytics/` },
      { id: "dp-300-d3", title: "Monitorar e otimizar recursos operacionais", weight: "20–25%", objectives: ["Monitorar atividade, performance e utilização de recursos com Azure Monitor e Query Store", "Implementar alertas e notificações para eventos críticos"], learnUrl: `${BASE}/training/paths/monitor-and-optimize-operational-resources-in-sql-server/` },
      { id: "dp-300-d4", title: "Otimizar performance de queries", weight: "20–25%", objectives: ["Revisar e otimizar planos de execução de queries", "Avaliar e implementar índices para melhorar performance"], learnUrl: `${BASE}/training/paths/optimize-query-performance-sql-server/` },
      { id: "dp-300-d5", title: "Automatizar tarefas", weight: "15–20%", objectives: ["Criar e gerenciar jobs no SQL Server Agent", "Configurar alertas e notificações automáticas"], learnUrl: `${BASE}/training/paths/automate-tasks-sql-server/` },
      { id: "dp-300-d6", title: "Planejar e implementar HADR", weight: "15–20%", objectives: ["Planejar soluções de recuperação de desastres (RTO e RPO)", "Configurar Always On Availability Groups e Azure SQL auto-failover groups", "Implementar e testar procedimentos de backup e restauração"], learnUrl: `${BASE}/training/paths/plan-implement-high-availability-disaster-recovery-environment/` },
    ],
  },

  "DP-600": {
    examCode: "DP-600",
    certName: "Fabric Analytics Engineer Associate",
    learnUrl: `${BASE}/credentials/certifications/fabric-analytics-engineer-associate/`,
    domains: [
      { id: "dp-600-d1", title: "Planejar, implementar e gerenciar uma solução para análise de dados", weight: "10–15%", objectives: ["Planejar e implementar uma solução com Microsoft Fabric", "Administrar um workspace e itens do Fabric"], learnUrl: `${BASE}/training/paths/get-started-fabric/` },
      { id: "dp-600-d2", title: "Preparar e servir dados", weight: "40–45%", objectives: ["Criar e gerenciar um Lakehouse no Microsoft Fabric", "Ingerir e transformar dados com dataflows e notebooks", "Implementar CI/CD e recomendações de segurança no Fabric"], learnUrl: `${BASE}/training/paths/implement-medallion-architecture-microsoft-fabric/` },
      { id: "dp-600-d3", title: "Implementar e gerenciar data analytics e AI", weight: "40–45%", objectives: ["Criar modelos semânticos do Power BI e relatórios no Fabric", "Otimizar modelos Direct Lake", "Implementar soluções de Real-Time Intelligence no Fabric"], learnUrl: `${BASE}/training/paths/manage-optimize-power-bi-for-analysts/` },
    ],
  },

  // ── Microsoft 365 ───────────────────────────────────────────────────────────
  "MS-900": {
    examCode: "MS-900",
    certName: "Microsoft 365 Fundamentals",
    learnUrl: `${BASE}/credentials/certifications/microsoft-365-fundamentals/`,
    domains: [
      { id: "ms-900-d1", title: "Serviços e Conceitos de Cloud da Microsoft", weight: "10–15%", objectives: ["Descrever soluções de cloud, on-premises e híbridas", "Descrever modelos de assinatura e licenciamento"], learnUrl: `${BASE}/training/paths/m365-cloud-concepts/` },
      { id: "ms-900-d2", title: "Capacidades de Produtividade e Trabalho em Equipe do Microsoft 365", weight: "30–35%", objectives: ["Descrever as capacidades do Microsoft Teams, Exchange Online e SharePoint Online", "Descrever funcionalidades do Microsoft 365 Apps: Word, Excel, PowerPoint, Outlook", "Descrever capacidades de trabalho em equipe com Viva, Copilot for Microsoft 365"], learnUrl: `${BASE}/training/paths/m365-teams-sharepoint/` },
      { id: "ms-900-d3", title: "Capacidades de Gestão e Proteção de Dados do Microsoft 365", weight: "35–40%", objectives: ["Descrever soluções de identidade e acesso do Microsoft 365", "Descrever capacidades de gerenciamento de ameaças: Microsoft Defender, Secure Score", "Descrever Microsoft Purview: Information Protection, DLP, Compliance Manager"], learnUrl: `${BASE}/training/paths/m365-security-management/` },
      { id: "ms-900-d4", title: "Capacidades de Gestão de Dispositivos do Microsoft 365", weight: "15–20%", objectives: ["Descrever o Microsoft Endpoint Manager: Intune e Configuration Manager", "Descrever opções de deployment de SO com Windows Autopilot"], learnUrl: `${BASE}/training/paths/m365-device-management/` },
    ],
  },

  "MD-102": {
    examCode: "MD-102",
    certName: "Microsoft 365 Endpoint Administrator",
    learnUrl: `${BASE}/credentials/certifications/modern-desktop/`,
    domains: [
      { id: "md-102-d1", title: "Implantar Windows Client", weight: "25–30%", objectives: ["Planejar e implementar deployment de Windows 11 com Windows Autopilot e MDT", "Gerenciar ativação e atualizações do Windows com Windows Update for Business e WSUS"], learnUrl: `${BASE}/training/paths/endpoint-administrator-prepare/` },
      { id: "md-102-d2", title: "Gerenciar identidade e conformidade", weight: "15–20%", objectives: ["Gerenciar identidade local e na nuvem com Microsoft Entra ID e Hybrid Join", "Implementar conformidade de dispositivos com Microsoft Intune"], learnUrl: `${BASE}/training/paths/manage-identity-compliance-microsoft-365/` },
      { id: "md-102-d3", title: "Gerenciar, manter e proteger dispositivos", weight: "40–45%", objectives: ["Gerenciar dispositivos com Microsoft Intune: configuração, aplicativos, políticas", "Gerenciar perfis de dispositivo e Group Policy Objects (GPOs)", "Implementar proteção de endpoint com Microsoft Defender for Endpoint"], learnUrl: `${BASE}/training/paths/manage-endpoint-microsoft-endpoint-manager-2/` },
      { id: "md-102-d4", title: "Gerenciar aplicativos e dados", weight: "10–15%", objectives: ["Implantar e gerenciar aplicativos com Intune: Win32 apps, store apps, Microsoft 365 Apps", "Implementar proteção de dados em aplicativos móveis (MAM)"], learnUrl: `${BASE}/training/paths/manage-applications-microsoft-endpoint-manager/` },
    ],
  },

  "MS-102": {
    examCode: "MS-102",
    certName: "Microsoft 365 Administrator Expert",
    learnUrl: `${BASE}/credentials/certifications/m365-administrator-expert/`,
    domains: [
      { id: "ms-102-d1", title: "Implantar e gerenciar um tenant do Microsoft 365", weight: "25–30%", objectives: ["Criar e gerenciar tenant do Microsoft 365 e domínios", "Gerenciar serviços do Microsoft 365: Exchange Online, SharePoint, Teams", "Monitorar saúde e uso do Microsoft 365"], learnUrl: `${BASE}/training/paths/implement-microsoft-365-tenant/` },
      { id: "ms-102-d2", title: "Implementar e gerenciar identidade e acesso no Microsoft 365", weight: "25–30%", objectives: ["Implementar e gerenciar identidade híbrida com Azure AD Connect", "Implementar e gerenciar gerenciamento de identidade no Microsoft Entra ID", "Gerenciar acesso com Conditional Access, MFA e PIM"], learnUrl: `${BASE}/training/paths/examine-microsoft-365-permission-management/` },
      { id: "ms-102-d3", title: "Gerenciar segurança e conformidade no Microsoft 365", weight: "40–45%", objectives: ["Implementar e gerenciar e-mail security com Exchange Online Protection e Defender for Office 365", "Gerenciar governança de dados e conformidade com Microsoft Purview", "Implementar gerenciamento de risco interno e eDiscovery"], learnUrl: `${BASE}/training/paths/implement-microsoft-365-security-threat-management/` },
    ],
  },

  // ── Power Platform ───────────────────────────────────────────────────────────
  "PL-900": {
    examCode: "PL-900",
    certName: "Microsoft Power Platform Fundamentals",
    learnUrl: `${BASE}/credentials/certifications/power-platform-fundamentals/`,
    domains: [
      { id: "pl-900-d1", title: "Valor de negócio da Microsoft Power Platform", weight: "15–20%", objectives: ["Descrever os componentes da Power Platform: Power BI, Power Apps, Power Automate, Power Virtual Agents, Power Pages", "Descrever casos de uso da Power Platform para resolver desafios de negócios", "Descrever o Microsoft Dataverse"], learnUrl: `${BASE}/training/paths/power-plat-fundamentals/` },
      { id: "pl-900-d2", title: "Capacidades do Power BI", weight: "20–25%", objectives: ["Identificar os blocos de construção do Power BI: dashboards, relatórios, datasets, workspaces", "Descrever como o Power BI conecta a fontes de dados e cria relatórios interativos", "Descrever as capacidades do Power BI Service e como compartilhar conteúdo"], learnUrl: `${BASE}/training/paths/create-use-analytics-reports-power-bi/` },
      { id: "pl-900-d3", title: "Capacidades do Power Apps", weight: "25–30%", objectives: ["Identificar casos de uso para canvas apps, model-driven apps e portais", "Descrever como o Power Apps se conecta a dados via conectores e Dataverse", "Descrever como componentes de IA podem ser incorporados com AI Builder"], learnUrl: `${BASE}/training/paths/create-powerapps/` },
      { id: "pl-900-d4", title: "Capacidades do Power Automate", weight: "25–30%", objectives: ["Identificar os tipos de fluxos do Power Automate: automatizados, instantâneos, agendados, fluxos de processo de negócios", "Descrever os blocos de construção de um fluxo: triggers, actions, condicionais, loops", "Descrever capacidades de RPA (Robotic Process Automation) com fluxos de área de trabalho"], learnUrl: `${BASE}/training/paths/automate-process-power-automate/` },
      { id: "pl-900-d5", title: "Capacidades do Power Virtual Agents e Power Pages", weight: "10–15%", objectives: ["Descrever casos de uso para chatbots com Power Virtual Agents / Copilot Studio", "Identificar os componentes de um bot: topics, entities, actions", "Descrever como criar portais externos com Power Pages"], learnUrl: `${BASE}/training/paths/power-virtual-agents-bots/` },
    ],
  },

  "PL-200": {
    examCode: "PL-200",
    certName: "Microsoft Power Platform Functional Consultant",
    learnUrl: `${BASE}/credentials/certifications/power-platform-functional-consultant/`,
    domains: [
      { id: "pl-200-d1", title: "Configurar o Microsoft Dataverse", weight: "25–30%", objectives: ["Criar e configurar tabelas, colunas, relacionamentos e escolhas", "Configurar segurança do Dataverse: papéis de segurança, business units, equipes", "Implementar soluções e gerenciar ambientes com Power Platform Admin Center"], learnUrl: `${BASE}/training/paths/get-started-cds/` },
      { id: "pl-200-d2", title: "Criar aplicativos com Power Apps", weight: "25–30%", objectives: ["Criar e configurar model-driven apps: formulários, views, gráficos, dashboards", "Criar canvas apps com componentes complexos e fórmulas Power Fx"], learnUrl: `${BASE}/training/paths/create-powerapps/` },
      { id: "pl-200-d3", title: "Criar e gerenciar Power Automate", weight: "20–25%", objectives: ["Criar fluxos automatizados, instantâneos e agendados", "Implementar fluxos de processo de negócios e fluxos de área de trabalho"], learnUrl: `${BASE}/training/paths/automate-process-power-automate/` },
      { id: "pl-200-d4", title: "Implementar chatbots com Power Virtual Agents", weight: "10–15%", objectives: ["Criar e configurar chatbots com Copilot Studio", "Integrar chatbots a outros produtos da Power Platform"], learnUrl: `${BASE}/training/paths/work-power-virtual-agents/` },
      { id: "pl-200-d5", title: "Analisar dados com Power BI", weight: "15–20%", objectives: ["Criar relatórios e dashboards do Power BI incorporados em Power Apps", "Descrever as opções de integração entre Power BI e Power Platform"], learnUrl: `${BASE}/training/paths/create-use-analytics-reports-power-bi/` },
    ],
  },

  "PL-400": {
    examCode: "PL-400",
    certName: "Microsoft Power Platform Developer",
    learnUrl: `${BASE}/credentials/certifications/power-platform-developer/`,
    domains: [
      { id: "pl-400-d1", title: "Criar um design técnico", weight: "10–15%", objectives: ["Validar requisitos técnicos e de negócios", "Documentar a arquitetura técnica da solução"], learnUrl: `${BASE}/training/paths/create-components-power-apps-component-framework/` },
      { id: "pl-400-d2", title: "Configurar o Microsoft Dataverse", weight: "15–20%", objectives: ["Implementar entidades, colunas e relacionamentos personalizados", "Implementar segurança com papéis de segurança e hierarquias"], learnUrl: `${BASE}/training/paths/get-started-cds/` },
      { id: "pl-400-d3", title: "Criar e configurar Power Apps", weight: "25–30%", objectives: ["Criar canvas apps com fórmulas Power Fx avançadas", "Criar componentes com Power Apps Component Framework (PCF)"], learnUrl: `${BASE}/training/paths/use-power-apps-component-framework/` },
      { id: "pl-400-d4", title: "Estender a experiência do usuário", weight: "20–25%", objectives: ["Criar código client-side com JavaScript e TypeScript para customizações de formulário", "Implementar plugins com C# no Dataverse"], learnUrl: `${BASE}/training/paths/extend-power-apps-portals/` },
      { id: "pl-400-d5", title: "Estender a plataforma", weight: "25–30%", objectives: ["Criar conectores personalizados para APIs externas", "Integrar soluções com webhooks, Azure Service Bus e Azure Functions"], learnUrl: `${BASE}/training/paths/extend-dataverse/` },
    ],
  },

  // ── GitHub ───────────────────────────────────────────────────────────────────
  "github-foundations": {
    examCode: "GitHub Foundations",
    certName: "GitHub Foundations",
    learnUrl: "https://learn.microsoft.com/en-us/credentials/certifications/github-foundations/",
    domains: [
      { id: "gh-f-d1", title: "Introdução ao Git e GitHub", weight: "22%", objectives: ["Descrever o controle de versão e sua importância", "Criar e gerenciar repositórios Git locais e remotos", "Configurar o Git e usar comandos básicos: clone, add, commit, push, pull"], learnUrl: "https://learn.microsoft.com/en-us/training/paths/foundations-github-administration/" },
      { id: "gh-f-d2", title: "Trabalhar com repositórios GitHub", weight: "8%", objectives: ["Criar e gerenciar issues, pull requests e revisões de código", "Usar GitHub Projects para gerenciamento de projetos ágeis"], learnUrl: "https://learn.microsoft.com/en-us/training/paths/foundations-github-administration/" },
      { id: "gh-f-d3", title: "Colaboração no GitHub", weight: "30%", objectives: ["Usar branches para desenvolvimento paralelo", "Criar e revisar pull requests", "Usar GitHub Discussions e GitHub Issues para colaboração"], learnUrl: "https://learn.microsoft.com/en-us/training/paths/foundations-github-administration/" },
      { id: "gh-f-d4", title: "GitHub Actions e automação", weight: "18%", objectives: ["Descrever os componentes do GitHub Actions: workflows, jobs, steps", "Criar workflows básicos de CI/CD com GitHub Actions"], learnUrl: "https://learn.microsoft.com/en-us/training/paths/foundations-github-administration/" },
      { id: "gh-f-d5", title: "Segurança no GitHub", weight: "22%", objectives: ["Usar Dependabot para gerenciar dependências vulneráveis", "Usar code scanning e secret scanning para segurança do repositório", "Descrever as funcionalidades do GitHub Advanced Security"], learnUrl: "https://learn.microsoft.com/en-us/training/paths/foundations-github-administration/" },
    ],
  },

  "github-actions": {
    examCode: "GitHub Actions",
    certName: "GitHub Actions",
    learnUrl: "https://learn.microsoft.com/en-us/credentials/certifications/github-actions/",
    domains: [
      { id: "gh-a-d1", title: "Autor e manutenção de Workflows", weight: "40%", objectives: ["Usar eventos de trigger: push, pull_request, schedule, workflow_dispatch", "Usar expressions, contexts e funções em workflows", "Implementar runners self-hosted e GitHub-hosted"], learnUrl: "https://learn.microsoft.com/en-us/training/paths/github-actions/" },
      { id: "gh-a-d2", title: "Consumo de Workflows", weight: "20%", objectives: ["Consumir e referenciar workflows reutilizáveis", "Passar inputs e secrets para workflows chamados"], learnUrl: "https://learn.microsoft.com/en-us/training/paths/github-actions/" },
      { id: "gh-a-d3", title: "Autor e manutenção de Actions", weight: "25%", objectives: ["Criar JavaScript actions e container actions (Docker)", "Publicar actions no GitHub Marketplace"], learnUrl: "https://learn.microsoft.com/en-us/training/paths/github-actions/" },
      { id: "gh-a-d4", title: "Gerenciamento de workflows", weight: "15%", objectives: ["Configurar permissões de workflow e OIDC para autenticação sem secrets", "Gerenciar ambientes, variáveis e secrets de repositório e organização"], learnUrl: "https://learn.microsoft.com/en-us/training/paths/github-actions/" },
    ],
  },

  // ── Microsoft 365 — Teams ────────────────────────────────────────────────────
  "MS-700": {
    examCode: "MS-700",
    certName: "Microsoft Teams Administrator Associate",
    learnUrl: `${BASE}/credentials/certifications/m365-teams-administrator-associate/`,
    domains: [
      {
        id: "ms-700-d1",
        title: "Configurar e gerenciar o ambiente do Teams",
        weight: "40–45%",
        objectives: [
          "Calcular capacidade de largura de banda para voz, vídeo, reuniões e eventos no Teams",
          "Analisar impacto de rede com Network Planner e Teams Network Assessment Tool",
          "Gerenciar políticas de segurança e conformidade: alertas, funções de admin, Defender XDR",
          "Especificar políticas de retenção, rótulos de confidencialidade, DLP e acesso condicional do Entra",
          "Planejar e implementar governança: lifecycle de equipes, expiração e nomenclatura de grupos M365",
          "Configurar colaboração externa: guest access, shared channels, B2B direct connect, MTO",
          "Gerenciar clientes e dispositivos Teams: perfis de configuração, Teams Rooms, VDI",
        ],
        learnUrl: `${BASE}/training/paths/m365-teams-sharepoint/`,
      },
      {
        id: "ms-700-d2",
        title: "Gerenciar equipes, canais, chats e aplicativos",
        weight: "20–25%",
        objectives: [
          "Criar equipes via admin center, Teams client, PowerShell, Graph API, templates e grupos M365",
          "Gerenciar membros, funções, configurações de privacidade e sensibilidade da equipe",
          "Recomendar e gerenciar tipos de canais: padrão, privado e compartilhado",
          "Criar e gerenciar políticas de mensagens e compartilhamento de canais",
          "Gerenciar apps: configurações org-wide, políticas de setup, permissões, Teams app store",
        ],
        learnUrl: `${BASE}/training/paths/m365-teams-sharepoint/`,
      },
      {
        id: "ms-700-d3",
        title: "Gerenciar reuniões e chamadas",
        weight: "15–20%",
        objectives: [
          "Recomendar tipos de reunião: Virtual Appointments, Webinars, Town Halls, reuniões",
          "Configurar reuniões com Copilot for Microsoft 365, templates e políticas de reunião",
          "Configurar e gerenciar Teams Webinars e Town Halls",
          "Provisionar e gerenciar números de telefone para usuários e resource accounts",
          "Gerenciar políticas de chamada, voz, auto-attendants e call queues",
        ],
        learnUrl: `${BASE}/training/paths/manage-meetings-calling-microsoft-teams/`,
      },
      {
        id: "ms-700-d4",
        title: "Monitorar, reportar e solucionar problemas do Teams",
        weight: "15–20%",
        objectives: [
          "Monitorar e reportar qualidade de voz e reuniões com Call Quality Dashboard",
          "Configurar regras de alerta e reportar uso: atividade de equipes, apps, usuários ativos",
          "Monitorar criação/exclusão de equipes e acesso de convidados",
          "Solucionar problemas de áudio, vídeo, cliente Teams e reuniões usando diagnósticos",
          "Solucionar problemas de login, Copilot e experiências de IA no Teams",
        ],
        learnUrl: `${BASE}/training/paths/m365-teams-sharepoint/`,
      },
    ],
  },

  // ── Power Platform ─ PL-600 ──────────────────────────────────────────────────
  "PL-600": {
    examCode: "PL-600",
    certName: "Microsoft Power Platform Solution Architect Expert",
    learnUrl: `${BASE}/credentials/certifications/power-platform-solution-architect-expert/`,
    domains: [
      {
        id: "pl-600-d1",
        title: "Visão de solução e análise de requisitos",
        weight: "45–50%",
        objectives: [
          "Avaliar requisitos de negócio e identificar componentes da solução Power Platform",
          "Identificar e selecionar componentes de apps existentes, Dynamics 365, AppSource e ISVs",
          "Estimar esforços de migração e integração",
          "Coletar processos de negócio atuais e avaliar fatores de risco da organização",
          "Avaliar arquitetura enterprise e identificar fontes de dados necessárias",
          "Refinar e documentar requisitos funcionais e não-funcionais",
          "Realizar análises fit/gap e determinar escopo da solução",
        ],
        learnUrl: `${BASE}/training/paths/solution-architect-data/`,
      },
      {
        id: "pl-600-d2",
        title: "Arquitetura da solução",
        weight: "35–40%",
        objectives: [
          "Projetar topologia da solução, protótipos de UX e estratégia de migração de dados",
          "Projetar modelo de dados: tabelas, relacionamentos, dados de referência e configuração",
          "Projetar integrações: Teams/SharePoint, Dynamics 365, sistemas existentes, RPA e networking",
          "Projetar autenticação e continuidade de negócios",
          "Projetar modelo de segurança: business units, funções, segurança de linha/coluna",
          "Identificar grupos Entra ID e registros de app necessários para a solução",
          "Definir políticas DLP e acesso de usuários externos",
        ],
        learnUrl: `${BASE}/training/paths/solution-architect-data/`,
      },
      {
        id: "pl-600-d3",
        title: "Implementação e go-live da solução",
        weight: "15–20%",
        objectives: [
          "Validar designs detalhados, segurança e conformidade com limites de API",
          "Avaliar performance da solução e impacto em recursos",
          "Resolver conflitos de automação e integração",
          "Identificar e resolver problemas de performance e migração de dados no go-live",
          "Resolver problemas nos planos de deployment e avaliar prontidão para go-live",
        ],
        learnUrl: `${BASE}/training/paths/solution-architect-data/`,
      },
    ],
  },

  // ── GitHub ─ Administration e Advanced Security ──────────────────────────────
  "GITHUB-ADMINISTRATION": {
    examCode: "GitHub Administration",
    certName: "GitHub Administration",
    learnUrl: "https://learn.microsoft.com/en-us/credentials/certifications/github-administration/",
    domains: [
      {
        id: "gh-adm-d1",
        title: "Gerenciar identidades e acessos no GitHub",
        weight: "15–20%",
        objectives: [
          "Configurar autenticação: SAML SSO, provisionamento SCIM, 2FA",
          "Gerenciar usuários, equipes e permissões em organizações e enterprises",
          "Implementar políticas de acesso a repositórios e permissões granulares",
        ],
        learnUrl: "https://learn.microsoft.com/en-us/training/paths/github-administration-products/",
      },
      {
        id: "gh-adm-d2",
        title: "Administrar o ambiente GitHub Enterprise",
        weight: "10–15%",
        objectives: [
          "Configurar GitHub Enterprise Cloud e GitHub Enterprise Server",
          "Gerenciar licenças, configurações de enterprise e políticas de organização",
          "Configurar e gerenciar GitHub Connect entre Cloud e Server",
        ],
        learnUrl: "https://learn.microsoft.com/en-us/training/paths/github-administration-products/",
      },
      {
        id: "gh-adm-d3",
        title: "Implementar desenvolvimento seguro e conformidade",
        weight: "25–30%",
        objectives: [
          "Configurar branch protection rules, required reviews e signed commits",
          "Habilitar e configurar GitHub Advanced Security: code scanning, secret scanning, Dependabot",
          "Implementar políticas de segurança no nível da organização e enterprise",
          "Gerenciar security advisories e vulnerability alerts",
        ],
        learnUrl: "https://learn.microsoft.com/en-us/training/paths/github-admin-2/github-admin-2/",
      },
      {
        id: "gh-adm-d4",
        title: "Gerenciar GitHub Actions",
        weight: "20–25%",
        objectives: [
          "Configurar políticas de GitHub Actions no nível de organização e enterprise",
          "Gerenciar runners self-hosted: segurança, grupos e manutenção",
          "Configurar environments, secrets e variáveis para workflows",
          "Gerenciar permissões de workflows e OIDC authentication",
        ],
        learnUrl: "https://learn.microsoft.com/en-us/training/paths/github-admin-2/github-admin-2/",
      },
      {
        id: "gh-adm-d5",
        title: "Monitorar e otimizar o uso do GitHub",
        weight: "10–15%",
        objectives: [
          "Monitorar uso de Actions, Packages, Codespaces e storage",
          "Configurar audit log streaming e alertas de segurança",
          "Analisar métricas de adoção e relatórios de uso da organização",
        ],
        learnUrl: "https://learn.microsoft.com/en-us/training/paths/github-administration-products/",
      },
    ],
  },

  "GITHUB-ADVANCED-SECURITY": {
    examCode: "GitHub Advanced Security",
    certName: "GitHub Advanced Security",
    learnUrl: "https://learn.microsoft.com/en-us/credentials/certifications/github-advanced-security/",
    domains: [
      {
        id: "gh-sec-d1",
        title: "GitHub Security Suites, Features e Ecosystem",
        weight: "15–20%",
        objectives: [
          "Descrever os componentes do GitHub Advanced Security (GHAS): code scanning, secret scanning, Dependabot",
          "Comparar GitHub Free, Team e Enterprise em relação a funcionalidades de segurança",
          "Descrever o modelo de licenciamento do GHAS",
          "Identificar integrações do GHAS com ferramentas de terceiros e SIEM",
        ],
        learnUrl: "https://learn.microsoft.com/en-us/training/paths/github-advanced-security/",
      },
      {
        id: "gh-sec-d2",
        title: "Configurar e usar Secret Protection",
        weight: "15–20%",
        objectives: [
          "Habilitar e configurar secret scanning em repositórios e organizações",
          "Gerenciar alertas de secret scanning: triagem, resolução e bypass requests",
          "Configurar push protection para bloquear commits com secrets",
          "Criar custom patterns para detectar secrets proprietários",
        ],
        learnUrl: "https://learn.microsoft.com/en-us/training/paths/github-advanced-security/",
      },
      {
        id: "gh-sec-d3",
        title: "Configurar e usar Supply Chain Security",
        weight: "15–20%",
        objectives: [
          "Configurar Dependabot alerts, updates e security updates",
          "Usar Dependency Review para bloquear dependências vulneráveis em PRs",
          "Gerenciar dependency graph e software bill of materials (SBOM)",
          "Configurar políticas de atualização automática de dependências",
        ],
        learnUrl: "https://learn.microsoft.com/en-us/training/paths/github-advanced-security-2/",
      },
      {
        id: "gh-sec-d4",
        title: "Configurar e usar Code Security com CodeQL",
        weight: "10–15%",
        objectives: [
          "Habilitar e configurar code scanning com CodeQL e workflows de Actions",
          "Interpretar e gerenciar alertas de code scanning",
          "Escrever queries CodeQL básicas para detectar vulnerabilidades customizadas",
          "Configurar análise de terceiros via SARIF upload",
        ],
        learnUrl: "https://learn.microsoft.com/en-us/training/paths/github-advanced-security-2/",
      },
      {
        id: "gh-sec-d5",
        title: "Operações de Segurança: melhores práticas e remediação",
        weight: "15–20%",
        objectives: [
          "Priorizar e remediar alertas de segurança com base em severidade e contexto",
          "Implementar security policies e required workflows de segurança",
          "Usar security overview para visibilidade centralizada em toda a organização",
          "Integrar GHAS em pipelines de CI/CD e DevSecOps",
        ],
        learnUrl: "https://learn.microsoft.com/en-us/training/paths/github-advanced-security-2/",
      },
      {
        id: "gh-sec-d6",
        title: "Administração do GitHub Security Suites",
        weight: "10–15%",
        objectives: [
          "Habilitar GHAS em organizações e enterprises com políticas",
          "Gerenciar permissões de segurança: security managers e acesso a alertas",
          "Configurar e monitorar security campaigns para remediação em escala",
        ],
        learnUrl: "https://learn.microsoft.com/en-us/training/paths/github-advanced-security/",
      },
    ],
  },

  // ── IA ─ AI Agent Builder Associate ─────────────────────────────────────────
  "AI-AGENT-BUILDER-ASSOCIATE": {
    examCode: "AI Agent Builder",
    certName: "Azure AI Apps and Agents Developer Associate",
    learnUrl: `${BASE}/credentials/certifications/azure-ai-apps-and-agents-developer-associate/`,
    domains: [
      {
        id: "ai-agent-d1",
        title: "Planejar e projetar soluções de IA com Azure AI Foundry",
        weight: "20–25%",
        objectives: [
          "Selecionar modelos adequados do catálogo Azure AI Foundry para casos de uso específicos",
          "Projetar arquitetura de soluções usando Azure AI Foundry e serviços relacionados",
          "Avaliar requisitos de segurança, conformidade e IA responsável para aplicações de IA",
        ],
        learnUrl: `${BASE}/training/paths/create-custom-copilots-ai-studio/`,
      },
      {
        id: "ai-agent-d2",
        title: "Desenvolver aplicações com Azure AI Foundry",
        weight: "30–35%",
        objectives: [
          "Criar e gerenciar projetos e hubs no Azure AI Foundry",
          "Implementar Prompt Flow para orquestrar fluxos de IA com LLMs e ferramentas",
          "Integrar Azure AI Services (Vision, Language, Speech) em aplicações",
          "Avaliar e monitorar qualidade de respostas de modelos com métricas de avaliação",
        ],
        learnUrl: `${BASE}/training/paths/create-custom-copilots-ai-studio/`,
      },
      {
        id: "ai-agent-d3",
        title: "Implementar agentes de IA",
        weight: "30–35%",
        objectives: [
          "Criar agentes usando Azure AI Agent Service com ferramentas integradas e personalizadas",
          "Implementar agentes multi-step com chamadas de função (function calling)",
          "Integrar ferramentas externas em agentes: Bing Search, Code Interpreter, File Search",
          "Implementar padrões de multi-agent com handoffs entre agentes especializados",
          "Monitorar e depurar agentes em produção",
        ],
        learnUrl: `${BASE}/training/paths/develop-ai-solutions-azure-openai/`,
      },
      {
        id: "ai-agent-d4",
        title: "Implantar e operacionalizar soluções de IA",
        weight: "15–20%",
        objectives: [
          "Implantar modelos como endpoints online no Azure AI Foundry",
          "Implementar RAG (Retrieval-Augmented Generation) com Azure AI Search",
          "Configurar monitoramento, logging e alertas para aplicações de IA em produção",
          "Implementar práticas de IA responsável: content filtering, groundedness, safety",
        ],
        learnUrl: `${BASE}/training/paths/develop-ai-solutions-azure-openai/`,
      },
    ],
  },
};

/**
 * Retorna os domínios curados para um código de exame.
 * Retorna null se a cert não estiver no mapa.
 */
export function getCertDomains(examCode: string): CertStudyData | null {
  const key = examCode.toUpperCase();
  return certStudyData[key] ?? null;
}
