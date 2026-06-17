import type { Metadata } from "next";

export const metadata: Metadata = { title: "Política de Privacidade" };

export default function PrivacidadePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black zaika-gradient-text mb-2">Política de Privacidade</h1>
      <p className="text-xs mb-8" style={{ color: "var(--color-muted)" }}>Última atualização: junho de 2026 · Em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018)</p>

      {[
        {
          titulo: "1. Responsável pelo Tratamento",
          texto: "A plataforma ZAIKA é a controladora dos dados pessoais coletados neste site. Para exercer seus direitos ou tirar dúvidas, entre em contato pelo e-mail: privacidade@zaika.app.br",
        },
        {
          titulo: "2. Dados Coletados",
          texto: "Coletamos apenas os dados necessários para a prestação do serviço: (a) dados de identificação fornecidos pelo Google OAuth (nome, e-mail, foto de perfil); (b) dados de navegação essenciais (cookies de sessão); (c) histórico de compras e acesso ao conteúdo; (d) registros de consentimento com hash do IP (não identificável diretamente).",
        },
        {
          titulo: "3. Finalidade e Base Legal",
          texto: "Seus dados são tratados para: (a) criar e gerenciar sua conta — base legal: execução de contrato (art. 7, V da LGPD); (b) processar pagamentos — base legal: execução de contrato; (c) cumprir obrigações fiscais — base legal: obrigação legal (art. 7, II); (d) cookies analíticos — base legal: consentimento (art. 7, I), que pode ser revogado a qualquer momento.",
        },
        {
          titulo: "4. Retenção de Dados",
          texto: "Dados da conta são retidos enquanto ela estiver ativa. Após a exclusão, os dados pessoais são anonimizados imediatamente. Registros de compra são mantidos por 5 anos de forma anonimizada, conforme exigência do Código Tributário Nacional.",
        },
        {
          titulo: "5. Compartilhamento",
          texto: "Seus dados são compartilhados somente com: (a) Mercado Pago S.A. — para processamento de pagamentos, sob sua própria política de privacidade; (b) Google LLC — para autenticação OAuth; (c) Microsoft Azure — para funcionalidades de OCR e tradução automática (somente dados inseridos voluntariamente pelo administrador). Não vendemos seus dados.",
        },
        {
          titulo: "6. Seus Direitos (LGPD art. 18)",
          texto: "Você tem direito a: confirmação do tratamento, acesso aos dados, correção, anonimização/bloqueio/eliminação, portabilidade, informação sobre compartilhamento, revogação do consentimento e oposição ao tratamento. Esses direitos podem ser exercidos em: zaika.app.br/conta",
        },
        {
          titulo: "7. Cookies",
          texto: "Utilizamos cookies essenciais (necessários para login e navegação segura — base legal: contrato) e cookies analíticos opcionais (coletados somente com seu consentimento explícito). Você pode revogar o consentimento para cookies analíticos a qualquer momento nas configurações da sua conta.",
        },
        {
          titulo: "8. Segurança",
          texto: "Adotamos medidas técnicas e organizacionais para proteger seus dados: HTTPS obrigatório, senhas não armazenadas (OAuth), dados de cartão nunca processados por nós (apenas pelo Mercado Pago), headers de segurança e validação de integridade em todas as transações.",
        },
      ].map(({ titulo, texto }) => (
        <div key={titulo} className="mb-6">
          <h2 className="font-bold mb-2" style={{ color: "var(--foreground)" }}>{titulo}</h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--color-muted)" }}>{texto}</p>
        </div>
      ))}
    </div>
  );
}
