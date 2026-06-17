import { trails } from "@/data/trails";
import TrailCard from "@/components/TrailCard";

export default function TrailsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Trilhas de Carreira</h1>
        <p className="text-gray-500">
          Siga uma trilha para saber exatamente qual certificação fazer primeiro, qual vem depois e como chegar ao nível expert.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {trails.map((trail) => (
          <TrailCard key={trail.id} trail={trail} />
        ))}
      </div>

      <div className="mt-10 p-5 rounded-xl bg-blue-50 border border-blue-200 text-sm text-blue-800">
        <strong>Como funcionam as trilhas?</strong> Cada trilha indica a ordem recomendada de certificações para um segmento de carreira. Você estuda no seu ritmo — questões no estilo da prova e labs práticos para cada cert.
      </div>
    </div>
  );
}
