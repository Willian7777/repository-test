"use client";
import { useEffect, useRef, useState } from "react";

interface Props {
  onCaptura: (file: File) => void;
  onCancelar: () => void;
}

// Usa câmera nativa do Capacitor se estiver no app iOS/Android
async function capturarNativa(): Promise<File | null> {
  try {
    const [{ Camera, CameraResultType, CameraSource }, { Capacitor }] = await Promise.all([
      import("@capacitor/camera"),
      import("@capacitor/core"),
    ]);
    if (!Capacitor.isNativePlatform()) return null;

    const photo = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });
    if (!photo.dataUrl) return null;

    const res  = await fetch(photo.dataUrl);
    const blob = await res.blob();
    return new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" });
  } catch {
    return null;
  }
}

export default function CameraCapture({ onCaptura, onCancelar }: Props) {
  const videoRef    = useRef<HTMLVideoElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);
  const [erro, setErro]           = useState("");
  const [pronto, setPronto]       = useState(false);
  const [capturada, setCapturada] = useState<string | null>(null);
  const [nativo, setNativo]       = useState(false);

  useEffect(() => {
    // Tenta câmera nativa primeiro (iOS/Android)
    capturarNativa().then((file) => {
      if (file) {
        setNativo(true);
        onCaptura(file);
        return;
      }
      // Fallback: câmera do browser (PWA / desktop)
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment", width: { ideal: 1920 } } })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => setPronto(true);
          }
        })
        .catch(() => setErro("Câmera não disponível. Verifique as permissões do navegador."));
    });

    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function capturar() {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    setCapturada(canvas.toDataURL("image/jpeg", 0.9));
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }

  function confirmar() {
    if (!capturada || !canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      if (blob) onCaptura(new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" }));
    }, "image/jpeg", 0.9);
  }

  function recapturar() {
    setCapturada(null); setPronto(false);
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setPronto(true);
        }
      });
  }

  // Se câmera nativa já capturou, não exibe nada (já voltou para o pai)
  if (nativo) return null;

  if (erro) return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
      <p className="text-sm text-red-600 font-medium">{erro}</p>
      <button onClick={onCancelar} className="mt-4 text-sm text-slate-500 underline">
        Usar upload de arquivo
      </button>
    </div>
  );

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-black">
      {capturada ? (
        <img src={capturada} alt="Foto capturada" className="w-full" />
      ) : (
        <video ref={videoRef} autoPlay playsInline muted className="w-full" />
      )}
      <canvas ref={canvasRef} className="hidden" />
      <div className="p-4 flex gap-3 justify-center bg-slate-900">
        {capturada ? (
          <>
            <button onClick={recapturar} className="px-5 py-2.5 bg-slate-600 text-white text-sm font-semibold rounded-full hover:bg-slate-500 transition-all">
              🔄 Repetir
            </button>
            <button onClick={confirmar} className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-500 transition-all">
              ✅ Usar essa foto
            </button>
          </>
        ) : (
          <>
            <button onClick={onCancelar} className="px-5 py-2.5 bg-slate-700 text-slate-300 text-sm font-semibold rounded-full hover:bg-slate-600 transition-all">
              Cancelar
            </button>
            <button disabled={!pronto} onClick={capturar} className="px-8 py-2.5 bg-white text-slate-900 text-sm font-bold rounded-full hover:bg-slate-100 disabled:opacity-40 transition-all">
              📸 Capturar
            </button>
          </>
        )}
      </div>
    </div>
  );
}

interface Props {
  onCaptura: (file: File) => void;
  onCancelar: () => void;
}

export default function CameraCapture({ onCaptura, onCancelar }: Props) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [erro, setErro]         = useState("");
  const [pronto, setPronto]     = useState(false);
  const [capturada, setCapturada] = useState<string | null>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment", width: { ideal: 1920 } } })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setPronto(true);
        }
      })
      .catch(() => setErro("Câmera não disponível. Verifique as permissões do navegador."));

    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  function capturar() {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCapturada(dataUrl);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }

  function confirmar() {
    if (!capturada || !canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" });
        onCaptura(file);
      }
    }, "image/jpeg", 0.9);
  }

  function recapturar() {
    setCapturada(null);
    setPronto(false);
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setPronto(true);
        }
      });
  }

  if (erro) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <p className="text-sm text-red-600">{erro}</p>
        <button onClick={onCancelar} className="mt-4 text-sm text-slate-500 underline">
          Usar upload de arquivo
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 bg-black">
      {capturada ? (
        <img src={capturada} alt="Foto capturada" className="w-full" />
      ) : (
        <video ref={videoRef} autoPlay playsInline muted className="w-full" />
      )}
      <canvas ref={canvasRef} className="hidden" />

      <div className="p-4 flex gap-3 justify-center bg-slate-900">
        {capturada ? (
          <>
            <button
              onClick={recapturar}
              className="px-5 py-2 bg-slate-600 text-white text-sm font-medium rounded-full hover:bg-slate-500"
            >
              🔄 Repetir
            </button>
            <button
              onClick={confirmar}
              className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-full hover:bg-blue-500"
            >
              ✅ Usar essa foto
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onCancelar}
              className="px-5 py-2 bg-slate-700 text-slate-300 text-sm font-medium rounded-full hover:bg-slate-600"
            >
              Cancelar
            </button>
            <button
              disabled={!pronto}
              onClick={capturar}
              className="px-8 py-2 bg-white text-slate-900 text-sm font-semibold rounded-full hover:bg-slate-100 disabled:opacity-40"
            >
              📸 Capturar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
