"use client";

import { useState, useEffect, useCallback } from "react";
import CertCard from "@/components/CertCard";
import CertFilters from "@/components/CertFilters";
import { addCert, getMyCerts, getCertOverallScore, isCertPassed } from "@/lib/progress";
import type { CertMetadata } from "@/types/certification";

export default function CatalogPage() {
  const [certs, setCerts] = useState<CertMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [myCerts, setMyCerts] = useState<string[]>([]);

  const [search, setSearch] = useState("");
  const [product, setProduct] = useState("");
  const [level, setLevel] = useState("");

  const fetchCerts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (product) params.set("product", product);
      if (level) params.set("level", level);

      const res = await fetch(`/api/catalog?${params.toString()}`);
      if (!res.ok) throw new Error("Erro ao carregar certificações");
      const data: CertMetadata[] = await res.json();
      setCerts(data);
    } catch {
      setError("Não foi possível carregar o catálogo. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  }, [search, product, level]);

  useEffect(() => {
    setMyCerts(getMyCerts());
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchCerts, 300);
    return () => clearTimeout(timer);
  }, [fetchCerts]);

  function handleAdd(certId: string) {
    addCert(certId);
    setMyCerts(getMyCerts());
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Catálogo de Certificações</h1>
        <p className="text-gray-500">Mais de 90 certificações Microsoft. Adicione as que quer estudar.</p>
      </div>

      {/* Filtros */}
      <div className="mb-6">
        <CertFilters
          search={search}
          product={product}
          level={level}
          onSearchChange={setSearch}
          onProductChange={setProduct}
          onLevelChange={setLevel}
          onClear={() => { setSearch(""); setProduct(""); setLevel(""); }}
        />
      </div>

      {/* Estado */}
      {loading && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3 animate-pulse">🔍</div>
          <p>Carregando certificações...</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-red-700 text-sm">{error}</div>
      )}

      {!loading && !error && certs.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🔎</div>
          <p>Nenhuma certificação encontrada com esses filtros.</p>
        </div>
      )}

      {!loading && !error && certs.length > 0 && (
        <>
          <p className="text-sm text-gray-500 mb-4">{certs.length} resultado{certs.length !== 1 ? "s" : ""}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {certs.map((cert, idx) => (
              <CertCard
                key={`${cert.id}-${idx}`}
                cert={cert}
                isAdded={myCerts.includes(cert.id)}
                isPassed={isCertPassed(cert.id)}
                score={getCertOverallScore(cert.id)}
                onAdd={handleAdd}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
