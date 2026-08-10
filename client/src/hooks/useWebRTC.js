import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { getSocket } from "./useSocket";

export const useWebRTC = (roomId, slotId) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const screenVideoRef = useRef(null);
  const remoteScreenVideoRef = useRef(null);

  const pcRef = useRef(null);
  const cameraStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const screenSenderRef = useRef(null);
  const socketRef = useRef(null);
  const negotiatedOnceRef = useRef(false);
  const remoteCameraStreamIdRef = useRef(null);

  const politeRef = useRef(true);
  const makingOfferRef = useRef(false);
  const ignoreOfferRef = useRef(false);

  const [joined, setJoined] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [status, setStatus] = useState("connecting");
  const [pendingRequests, setPendingRequests] = useState([]);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteIsSharing, setRemoteIsSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [remoteHandRaised, setRemoteHandRaised] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !roomId) return;
    socketRef.current = socket;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pcRef.current = pc;

    pc.ontrack = (e) => {
      const incomingStream = e.streams[0];
      if (!incomingStream) return;

      if (!remoteCameraStreamIdRef.current) {
        remoteCameraStreamIdRef.current = incomingStream.id;
      }
      const isCameraStream =
        incomingStream.id === remoteCameraStreamIdRef.current;
      const targetRef = isCameraStream ? remoteVideoRef : remoteScreenVideoRef;

      if (targetRef.current && targetRef.current.srcObject !== incomingStream) {
        targetRef.current.srcObject = incomingStream;
        targetRef.current
          .play()
          .catch((err) => console.warn("Autoplay blocked:", err.message));
      }
    };

    pc.onicecandidate = (e) => {
      if (e.candidate)
        socket.emit("webrtc:ice-candidate", { roomId, candidate: e.candidate });
    };

    // Fires whenever a track is added/removed after the connection is live (e.g. screen share toggle).
    // Only acts after the initial handshake — that one is driven explicitly by 'peer-joined' below.
    pc.onnegotiationneeded = async () => {
      if (!negotiatedOnceRef.current) return;
      try {
        makingOfferRef.current = true;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("webrtc:offer", { roomId, offer: pc.localDescription });
      } catch (err) {
        console.warn("Renegotiation failed:", err.message);
      } finally {
        makingOfferRef.current = false;
      }
    };

    const createOfferAndSend = async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("webrtc:offer", { roomId, offer: pc.localDescription });
    };

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        cameraStreamRef.current = stream;
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        socket.emit("interview:join", { roomId, slotId });
      })
      .catch(() => toast.error("Camera/mic access is required to join."));

    socket.on("interview:error", (err) => {
      toast.error(err.message);
      setStatus("denied");
    });
    socket.on("interview:waiting", () => setStatus("waiting"));
    socket.on("interview:admitted", ({ isHost: hostFlag }) => {
      setIsHost(hostFlag);
      politeRef.current = !hostFlag;
      setStatus("admitted");
      setJoined(true);
    });
    socket.on("interview:denied", () => {
      setStatus("denied");
      toast.error("The host denied your request to join.");
    });
    socket.on("interview:join-request", ({ userId, name }) => {
      setPendingRequests((prev) =>
        prev.some((r) => r.userId === userId)
          ? prev
          : [...prev, { userId, name, email }],
      );
    });
    socket.on("interview:peer-joined", async () => {
      await createOfferAndSend();
      negotiatedOnceRef.current = true;
    });

    // Handles BOTH the initial answer AND any renegotiation offer, including glare
    socket.on("webrtc:offer", async ({ offer }) => {
      const offerCollision =
        makingOfferRef.current || pc.signalingState !== "stable";

      ignoreOfferRef.current = !politeRef.current && offerCollision;
      if (ignoreOfferRef.current) return;

      if (offerCollision) {
        await pc.setLocalDescription({ type: "rollback" });
      }
      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("webrtc:answer", { roomId, answer: pc.localDescription });
      negotiatedOnceRef.current = true;
    });

    socket.on("webrtc:answer", async ({ answer }) => {
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("webrtc:ice-candidate", async ({ candidate }) => {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        if (!ignoreOfferRef.current)
          console.warn("ICE candidate error:", err.message);
      }
    });

    socket.on("webrtc:hand-raise", ({ raised }) => setRemoteHandRaised(raised));
    socket.on("webrtc:screen-share", ({ sharing }) => {
      setRemoteIsSharing(sharing);
      if (!sharing && remoteScreenVideoRef.current) {
        remoteScreenVideoRef.current.srcObject = null;
      }
    });
    socket.on("interview:peer-left", () => {
      toast("The other participant left the interview.");
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      if (remoteScreenVideoRef.current)
        remoteScreenVideoRef.current.srcObject = null;
      remoteCameraStreamIdRef.current = null;
      setRemoteIsSharing(false);
    });
    socket.on("interview:ended", () => {
      setStatus("ended");
      toast("The interview has ended.");
    });

    return () => {
      socket.emit("interview:leave", { roomId });
      [
        "interview:error",
        "interview:waiting",
        "interview:admitted",
        "interview:denied",
        "interview:join-request",
        "interview:peer-joined",
        "webrtc:offer",
        "webrtc:answer",
        "webrtc:ice-candidate",
        "webrtc:hand-raise",
        "webrtc:screen-share",
        "interview:peer-left",
        "interview:ended",
      ].forEach((evt) => socket.off(evt));
      cameraStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      pc.close();
    };
  }, [roomId, slotId]);

  const admit = useCallback(
    (userId) => {
      socketRef.current?.emit("interview:admit", { roomId, userId });
      setPendingRequests((prev) => prev.filter((r) => r.userId !== userId));
    },
    [roomId],
  );

  const deny = useCallback(
    (userId) => {
      socketRef.current?.emit("interview:deny", { roomId, userId });
      setPendingRequests((prev) => prev.filter((r) => r.userId !== userId));
    },
    [roomId],
  );

  const toggleMic = useCallback(() => {
    const track = cameraStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMicOn(track.enabled);
  }, []);

  const toggleCamera = useCallback(() => {
    const track = cameraStreamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setCameraOn(track.enabled);
  }, []);

  const toggleScreenShare = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc) return;

    if (isScreenSharing) {
      if (screenSenderRef.current) {
        pc.removeTrack(screenSenderRef.current);
        screenSenderRef.current = null;
      }
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      setIsScreenSharing(false);
      socketRef.current?.emit("webrtc:screen-share", {
        roomId,
        sharing: false,
      });
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      screenStreamRef.current = screenStream;
      const screenTrack = screenStream.getVideoTracks()[0];
      screenSenderRef.current = pc.addTrack(screenTrack, screenStream);

      if (screenVideoRef.current)
        screenVideoRef.current.srcObject = screenStream;
      screenTrack.onended = () => toggleScreenShare();
      setIsScreenSharing(true);
      socketRef.current?.emit("webrtc:screen-share", { roomId, sharing: true });
    } catch {
      // user cancelled the picker — no-op
    }
  }, [isScreenSharing, roomId]);

  const toggleHandRaise = useCallback(() => {
    const next = !handRaised;
    setHandRaised(next);
    socketRef.current?.emit("webrtc:hand-raise", { roomId, raised: next });
  }, [roomId, handRaised]);

  const endInterview = useCallback(() => {
    socketRef.current?.emit("interview:end", { roomId });
  }, [roomId]);

  const leave = useCallback(() => {
    socketRef.current?.emit("interview:leave", { roomId });
  }, [roomId]);

  return {
    localVideoRef,
    remoteVideoRef,
    screenVideoRef,
    remoteScreenVideoRef,
    joined,
    isHost,
    status,
    pendingRequests,
    micOn,
    cameraOn,
    isScreenSharing,
    remoteIsSharing,
    handRaised,
    remoteHandRaised,
    admit,
    deny,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    toggleHandRaise,
    endInterview,
    leave,
  };
};
