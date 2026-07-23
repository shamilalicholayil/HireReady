import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff } from "lucide-react";

export default function CameraPreview() {
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

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setEnabled(true);
      } catch (error) {
        console.error("Camera permission error:", error);
      }
    }

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  return (
    <div className="glass rounded-3xl overflow-hidden">
      <div className="flex justify-between items-center px-4 py-3 border-b border-white/10">
        <div className="flex gap-2 items-center text-sm">
          {enabled ? <Camera size={16} /> : <CameraOff size={16} />}
          Camera
        </div>
        {enabled && <span className="text-xs text-emerald-400">● Live</span>}
      </div>

      <div className="aspect-video bg-black">
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
