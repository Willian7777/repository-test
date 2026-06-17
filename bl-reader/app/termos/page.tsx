import type { Metadata } from "next";

export const metadata: Metadata = { title: "Termos de Uso" };

export default function TermosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black zaika-gradient-text mb-2">Termos de Uso</h1>
      <p className="text-xs mb-8" style={{ color: "var(--color-muted)" }}>Última atualização: junho de 2026</p>

      {[
        {
          titulo: "1. Aceitação",
          texto: "Ao acessar ou usar a plataforma ZAIKA, você concorda com estes Termos. Se não concordar, não utilize o serviço.",
        },
        {
          titulo: "2. Serviço",
          texto: "A ZAIKA oferece traduções não-oficiais de histórias em quadrinhos BL (Boys' Love) para o português. O conteúdo é disponibilizado após pagamento único por obra.",
        },
        {
          titulo: "3. Conta de Usuário",
          texto: "O cadastro é realizado via Google OAuth. Você é responsável pela segurança da sua conta. Contas suspeitas de uso fraudulento serão suspensas.",
        },
        {
          titulo: "4. Pagamentos e Reembolso",
          texto: "Os pagamentos são processados pelo Mercado Pago. Por ser conteúdo digital de entrega imediata, não há direito de arrependimento após o acesso ao conteúdo, conforme art. 49 do CDC. Em caso de falha técnica comprovada, analisamos reembolso individualmente.",
        },
        {
          titulo: "5. Propriedade Intelectual",
          texto: "As traduções são de autoria da ZAIKA. Os originais pertencem a seus respectivos criadores. É proibido redistribuir, copiar, vender ou compartilhar o conteúdo adquirido.",
        },
        {
          titulo: "6. Conteúdo",
          texto: "As obras disponíveis contêm conteúdo voltado para público adulto (18+). Ao criar uma conta e adquirir obras, você confirma ter pelo menos 18 anos.",
        },
        {
          titulo: "7. Limitação de Responsabilidade",
          texto: "A ZAIKA não se responsabiliza por indisponibilidades temporárias do serviço, problemas de conexão do usuário ou conteúdo de terceiros (Mercado Pago, Google).",
        },
        {
          titulo: "8. Alterações",
          texto: "Estes termos podem ser atualizados. Mudanças significativas serão comunicadas por e-mail. O uso continuado após notificação implica aceitação.",
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
