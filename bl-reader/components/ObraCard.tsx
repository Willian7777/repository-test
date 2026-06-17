import Link from "next/link";
import Image from "next/image";

interface ObraCardProps {
  id: string;
  titulo: string;
  autorOriginal: string;
  sinopse: string;
  capaUrl: string;
  preco: number;
  generos: string; // JSON string
  comprado?: boolean;
}

export default function ObraCard({
  id,
  titulo,
  autorOriginal,
  sinopse,
  capaUrl,
  preco,
  generos,
  comprado = false,
}: ObraCardProps) {
  let generosArray: string[] = [];
  try { generosArray = JSON.parse(generos); } catch { generosArray = []; }

  return (
    <Link href={`/obras/${id}`} className="card-zaika block overflow-hidden group">
      {/* Capa */}
      <div className="relative aspect-[2/3] overflow-hidden bg-pink-50">
        <Image
          src={capaUrl || "/placeholder-capa.jpg"}
          alt={`Capa de ${titulo}`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {comprado && (
          <div className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "var(--color-secondary)" }}>
            ✓ Comprado
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />
        <p className="absolute bottom-2 left-2 text-white text-xs font-semibold">
          {autorOriginal}
        </p>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-bold text-sm leading-tight mb-1 line-clamp-2" style={{ color: "var(--foreground)" }}>
          {titulo}
        </h3>

        <p className="text-xs line-clamp-2 mb-2" style={{ color: "var(--color-muted)" }}>
          {sinopse}
        </p>

        {/* Gêneros */}
        {generosArray.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {generosArray.slice(0, 3).map((g) => (
              <span key={g} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--color-primary-light)", color: "var(--color-primary)" }}>
                {g}
              </span>
            ))}
          </div>
        )}

        {/* Preço */}
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm" style={{ color: "var(--color-primary)" }}>
            {preco === 0 ? "Grátis" : `R$ ${preco.toFixed(2)}`}
          </span>
          <span className="text-xs btn-primary py-1 px-2">Ver obra</span>
        </div>
      </div>
    </Link>
  );
}
