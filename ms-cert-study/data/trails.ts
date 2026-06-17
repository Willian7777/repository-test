import type { Trail } from "@/types/trail";

export const trails: Trail[] = [
  {
    id: "ai",
    name: "Inteligência Artificial",
    description:
      "Do básico de IA até engenharia de soluções com Azure AI e modelos generativos.",
    icon: "🤖",
    color: "bg-violet-600",
    textColor: "text-violet-600",
    borderColor: "border-violet-600",
    steps: [
      {
        certId: "ai-900",
        examCode: "AI-900",
        certName: "Azure AI Fundamentals",
        level: "Beginner",
        description:
          "Conceitos fundamentais de IA: ML, visão computacional, NLP e IA generativa no Azure.",
        isRecommended: true,
      },
      {
        certId: "ai-102",
        examCode: "AI-102",
        certName: "Azure AI Engineer Associate",
        level: "Intermediate",
        description:
          "Projetar e implementar soluções de IA usando Azure Cognitive Services e Azure OpenAI.",
      },
      {
        certId: "ai-agent-builder-associate",
        examCode: "AI Agent Builder",
        certName: "Azure AI Apps and Agents Developer Associate",
        level: "Intermediate",
        description:
          "Criar aplicações e agentes de IA com Azure AI Foundry e serviços de agentes.",
      },
    ],
  },
  {
    id: "azure-admin",
    name: "Azure Admin & Infraestrutura",
    description:
      "Fundamentos de cloud até arquitetura de soluções Azure em larga escala.",
    icon: "☁️",
    color: "bg-sky-600",
    textColor: "text-sky-600",
    borderColor: "border-sky-600",
    steps: [
      {
        certId: "az-900",
        examCode: "AZ-900",
        certName: "Azure Fundamentals",
        level: "Beginner",
        description:
          "Conceitos de cloud computing, serviços Azure e modelos de preço e suporte.",
        isRecommended: true,
      },
      {
        certId: "az-104",
        examCode: "AZ-104",
        certName: "Azure Administrator Associate",
        level: "Intermediate",
        description:
          "Gerenciar identidades, storage, redes, VMs e monitoramento no Azure.",
      },
      {
        certId: "az-305",
        examCode: "AZ-305",
        certName: "Azure Solutions Architect Expert",
        level: "Advanced",
        description:
          "Projetar soluções cloud completas incluindo infraestrutura, dados e continuidade.",
      },
    ],
  },
  {
    id: "security",
    name: "Segurança & Compliance",
    description:
      "De fundamentos de segurança até arquitetura de cybersecurity no ecossistema Microsoft.",
    icon: "🛡️",
    color: "bg-red-600",
    textColor: "text-red-600",
    borderColor: "border-red-600",
    steps: [
      {
        certId: "sc-900",
        examCode: "SC-900",
        certName: "Security, Compliance & Identity Fundamentals",
        level: "Beginner",
        description:
          "Conceitos de segurança, conformidade, identidade e serviços Microsoft relacionados.",
        isRecommended: true,
      },
      {
        certId: "sc-200",
        examCode: "SC-200",
        certName: "Microsoft Security Operations Analyst",
        level: "Intermediate",
        description:
          "Mitigar ameaças usando Microsoft Sentinel, Defender XDR e serviços Azure.",
      },
      {
        certId: "sc-300",
        examCode: "SC-300",
        certName: "Microsoft Identity and Access Administrator",
        level: "Intermediate",
        description:
          "Gerenciar identidades e acessos com Microsoft Entra ID.",
      },
      {
        certId: "sc-100",
        examCode: "SC-100",
        certName: "Microsoft Cybersecurity Architect Expert",
        level: "Advanced",
        description:
          "Projetar estratégias de segurança corporativa e arquiteturas de Zero Trust.",
      },
    ],
  },
  {
    id: "data",
    name: "Dados & Analytics",
    description:
      "De fundamentos de dados até engenharia e administração de dados no Azure.",
    icon: "📊",
    color: "bg-emerald-600",
    textColor: "text-emerald-600",
    borderColor: "border-emerald-600",
    steps: [
      {
        certId: "dp-900",
        examCode: "DP-900",
        certName: "Azure Data Fundamentals",
        level: "Beginner",
        description:
          "Conceitos fundamentais de dados relacionais, não-relacionais e analytics.",
        isRecommended: true,
      },
      {
        certId: "dp-203",
        examCode: "DP-203",
        certName: "Azure Data Engineer Associate",
        level: "Intermediate",
        description:
          "Projetar e implementar pipelines de dados com Azure Data Factory, Databricks e Synapse.",
      },
      {
        certId: "dp-300",
        examCode: "DP-300",
        certName: "Azure Database Administrator Associate",
        level: "Intermediate",
        description:
          "Administrar bancos de dados SQL e NoSQL no Azure e on-premises.",
      },
      {
        certId: "dp-600",
        examCode: "DP-600",
        certName: "Fabric Analytics Engineer Associate",
        level: "Intermediate",
        description:
          "Implementar soluções analíticas com Microsoft Fabric (Lakehouse, Data Warehouse, Pipelines).",
      },
    ],
  },
  {
    id: "dev",
    name: "Desenvolvimento & DevOps",
    description:
      "De cloud básico até desenvolvimento de aplicações e pipelines DevOps no Azure.",
    icon: "💻",
    color: "bg-orange-600",
    textColor: "text-orange-600",
    borderColor: "border-orange-600",
    steps: [
      {
        certId: "az-900",
        examCode: "AZ-900",
        certName: "Azure Fundamentals",
        level: "Beginner",
        description:
          "Conceitos de cloud computing, serviços Azure e modelos de preço e suporte.",
        isRecommended: true,
      },
      {
        certId: "az-204",
        examCode: "AZ-204",
        certName: "Azure Developer Associate",
        level: "Intermediate",
        description:
          "Desenvolver soluções com Azure Functions, App Service, Storage e APIs.",
      },
      {
        certId: "az-400",
        examCode: "AZ-400",
        certName: "Azure DevOps Engineer Expert",
        level: "Advanced",
        description:
          "Implementar processos DevOps: CI/CD, IaC, monitoramento e segurança de pipelines.",
      },
    ],
  },
  {
    id: "m365",
    name: "Microsoft 365",
    description:
      "Do básico de produtividade até administração avançada do ambiente Microsoft 365.",
    icon: "📧",
    color: "bg-blue-600",
    textColor: "text-blue-600",
    borderColor: "border-blue-600",
    steps: [
      {
        certId: "ms-900",
        examCode: "MS-900",
        certName: "Microsoft 365 Fundamentals",
        level: "Beginner",
        description:
          "Fundamentos de produtividade, colaboração e segurança no Microsoft 365.",
        isRecommended: true,
      },
      {
        certId: "md-102",
        examCode: "MD-102",
        certName: "Microsoft 365 Endpoint Administrator",
        level: "Intermediate",
        description:
          "Gerenciar dispositivos Windows com Intune, Autopilot e política de grupo.",
      },
      {
        certId: "ms-700",
        examCode: "MS-700",
        certName: "Microsoft Teams Administrator Associate",
        level: "Intermediate",
        description:
          "Planejar, implementar e gerenciar Microsoft Teams para colaboração corporativa.",
      },
      {
        certId: "ms-102",
        examCode: "MS-102",
        certName: "Microsoft 365 Administrator Expert",
        level: "Advanced",
        description:
          "Administrar tenant M365, políticas de segurança, conformidade e identidade híbrida.",
      },
    ],
  },
  {
    id: "power-platform",
    name: "Power Platform",
    description:
      "De fundamentos de low-code até desenvolvimento avançado com Power Platform.",
    icon: "⚡",
    color: "bg-yellow-500",
    textColor: "text-yellow-600",
    borderColor: "border-yellow-500",
    steps: [
      {
        certId: "pl-900",
        examCode: "PL-900",
        certName: "Microsoft Power Platform Fundamentals",
        level: "Beginner",
        description:
          "Conceitos de Power BI, Power Apps, Power Automate e Power Virtual Agents.",
        isRecommended: true,
      },
      {
        certId: "pl-200",
        examCode: "PL-200",
        certName: "Microsoft Power Platform Functional Consultant",
        level: "Intermediate",
        description:
          "Configurar e personalizar aplicações com Power Apps e Dataverse para o negócio.",
      },
      {
        certId: "pl-400",
        examCode: "PL-400",
        certName: "Microsoft Power Platform Developer",
        level: "Intermediate",
        description:
          "Desenvolver soluções com Power Apps, conectores personalizados e automações complexas.",
      },
      {
        certId: "pl-600",
        examCode: "PL-600",
        certName: "Microsoft Power Platform Solution Architect Expert",
        level: "Advanced",
        description:
          "Arquitetar soluções empresariais completas com Power Platform e Dynamics 365.",
      },
    ],
  },
  {
    id: "github",
    name: "GitHub",
    description:
      "De fundamentos de Git e GitHub até segurança avançada e administração de plataforma.",
    icon: "🐙",
    color: "bg-gray-800",
    textColor: "text-gray-800",
    borderColor: "border-gray-800",
    steps: [
      {
        certId: "github-foundations",
        examCode: "GitHub Foundations",
        certName: "GitHub Foundations",
        level: "Beginner",
        description:
          "Git, repositórios, colaboração, GitHub Actions básico e segurança fundamental.",
        isRecommended: true,
      },
      {
        certId: "github-actions",
        examCode: "GitHub Actions",
        certName: "GitHub Actions",
        level: "Intermediate",
        description:
          "Automatizar workflows de CI/CD, testes e deployments com GitHub Actions.",
      },
      {
        certId: "github-administration",
        examCode: "GitHub Administration",
        certName: "GitHub Administration",
        level: "Intermediate",
        description:
          "Administrar organizações, permissões, políticas e segurança no GitHub.",
      },
      {
        certId: "github-advanced-security",
        examCode: "GitHub Advanced Security",
        certName: "GitHub Advanced Security",
        level: "Intermediate",
        description:
          "Identificar e corrigir vulnerabilidades com code scanning, secret scanning e Dependabot.",
      },
    ],
  },
];

export const getTrailById = (id: string): Trail | undefined =>
  trails.find((t) => t.id === id);
