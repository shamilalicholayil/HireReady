import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getSocket } from "./useSocket";

export const useWebRTC = (roomId, slotId) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !roomId) return;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pcRef.current = pc;

    pc.ontrack = (e) => {
      if (
        remoteVideoRef.current &&
        remoteVideoRef.current.srcObject !== e.streams[0]
      ) {
        remoteVideoRef.current.srcObject = e.streams[0];
        remoteVideoRef.current
          .play()
          .catch((err) => console.warn("Autoplay blocked:", err.message));
      }
    };

    pc.onicecandidate = (e) => {
      if (e.candidate)
        socket.emit("webrtc:ice-candidate", { roomId, candidate: e.candidate });
    };

    let cleanup = () => {};

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        socket.emit("interview:join", { roomId, slotId });
        socket.on("interview:error", (err) => toast.error(err.message));

        socket.on("interview:peer-joined", async () => {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("webrtc:offer", { roomId, offer });
        });

        socket.on("webrtc:offer", async ({ offer }) => {
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("webrtc:answer", { roomId, answer });
        });

        socket.on("webrtc:answer", async ({ answer }) => {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        });

        socket.on("webrtc:ice-candidate", async ({ candidate }) => {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        });

        setJoined(true);

        cleanup = () => {
          socket.emit("interview:leave", { roomId });
          socket.off("interview:error");
          socket.off("interview:peer-joined");
          socket.off("webrtc:offer");
          socket.off("webrtc:answer");
          socket.off("webrtc:ice-candidate");
        };
      });

    return () => {
      cleanup();
      pc.close();
    };
  }, [roomId, slotId]);

  return { localVideoRef, remoteVideoRef, joined };
};
