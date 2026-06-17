"use client";

import { notFound } from "next/navigation";
import { use, useEffect, useState } from "react";
import { getTrailById } from "@/data/trails";
import TrailRoadmap from "@/components/TrailRoadmap";
import { addMultipleCerts, getTrailProgressStatus } from "@/lib/progress";
import type { TrailStepStatus } from "@/types/trail";

export default function TrailDetailPage({ params }: { params: Promise<{ trailId: string }> }) {
  const { trailId } = use(params);
  const trail = getTrailById(trailId);

  const [stepStatuses, setStepStatuses] = useState<Record<string, TrailStepStatus>>({});
  const [followed, setFollowed] = useState(false);

  useEffect(() => {
    if (!trail) return;
    const certIds = trail.steps.map((s) => s.certId);
    const { done, inProgress } = getTrailProgressStatus(certIds);
    const statuses: Record<string, TrailStepStatus> = {};
    for (const s of trail.steps) {
      if (done.includes(s.certId)) statuses[s.certId] = "done";
      else if (inProgress.includes(s.certId)) statuses[s.certId] = "current";
      else statuses[s.certId] = "locked";
    }
    setStepStatuses(statuses);
  }, [trail]);

  if (!trail) notFound();

  function handleFollowTrail() {
    const certIds = trail!.steps.map((s) => s.certId);
    addMultipleCerts(certIds);
    const newStatuses: Record<string, TrailStepStatus> = {};
    for (const s of trail!.steps) {
      newStatuses[s.certId] = stepStatuses[s.certId] === "done" ? "done" : "current";
    }
    setStepStatuses(newStatuses);
    setFollowed(true);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {followed && (
        <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-sm font-medium">
          ✓ Trilha adicionada ao seu plano de estudos! Acesse <a href="/my-certs" className="underline">Meus estudos</a> para começar.
        </div>
      )}
      <TrailRoadmap trail={trail} stepStatuses={stepStatuses} onFollowTrail={handleFollowTrail} />
    </div>
  );
}
