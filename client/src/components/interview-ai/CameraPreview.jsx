import { useEffect, useRef, useState } from "react";
import { CameraOff } from "lucide-react";

export default function CameraPreview({ variant = "full" }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setEnabled(true);
      } catch (error) {
        console.error("Camera permission error:", error);
      }
    }
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  if (variant === "compact") {
    return (
      <div className="relative shrink-0 w-24 h-16 sm:w-32 sm:h-20 rounded-xl overflow-hidden bg-black ring-1 ring-white/10">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
        />
        <div className="absolute bottom-1 left-1 flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 backdrop-blur">
          {enabled ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-300">Live</span>
            </>
          ) : (
            <CameraOff size={10} className="text-red-400" />
          )}
        </div>
      </div>
    );
  }

  // "full" variant — kept exactly as-is for other uses (e.g. PeerRoom)
  return (
    <div className="glass overflow-hidden rounded-3xl">
      <div className="flex justify-between items-center px-4 py-3 border-b border-white/10">
        <div className="flex gap-2 items-center text-sm">
          {enabled ? <CameraOff size={16} className="hidden" /> : null}
          Camera
        </div>
        {enabled && <span className="text-xs text-emerald-400">● Live</span>}
      </div>
      <div className="aspect-video min-h-[180px] bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
        />
      </div>
    </div>
  );
}
