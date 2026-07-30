import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Hand,
  ScreenShare,
  ScreenShareOff,
  PhoneOff,
  Check,
  X,
  Users,
} from "lucide-react";
import { fetchSlotById } from "../../api/slotApi";
import { useWebRTC } from "../../hooks/useWebRTC";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const InterviewRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [slot, setSlot] = useState(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showRequestsPanel, setShowRequestsPanel] = useState(false);

  useEffect(() => {
    fetchSlotById(id)
      .then(({ data }) => setSlot(data.data.slot))
      .catch(() => toast.error("Could not load this interview."));
  }, [id]);

  const {
    localVideoRef,
    remoteVideoRef,
    screenVideoRef,
    remoteScreenVideoRef,
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
  } = useWebRTC(slot?.roomId, id);

  const exitPath = isHost ? "/hr/interviews" : "/my-interviews";

  useEffect(() => {
    if (isHost && pendingRequests.length > 0) setShowRequestsPanel(true);
  }, [isHost, pendingRequests.length]);

  useEffect(() => {
    if (status === "ended" || status === "denied") {
      const t = setTimeout(() => navigate(exitPath), 2000);
      return () => clearTimeout(t);
    }
  }, [status, navigate, exitPath]);

  if (!slot)
    return (
      <div className="p-6 text-[var(--text-secondary)]">Loading room...</div>
    );

  const confirmExit = () => {
    setShowExitConfirm(false);
    if (isHost) endInterview();
    else leave();
    navigate(exitPath);
  };

  const isPresenting = isScreenSharing || remoteIsSharing;

  return (
    <div className="relative h-[85vh] bg-[var(--bg)] rounded-2xl overflow-hidden">
      {isHost && (
        <div className="absolute top-4 left-4 z-20">
          <button
            onClick={() => setShowRequestsPanel((p) => !p)}
            className="relative p-2.5 rounded-full bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--bg)]"
            aria-label="Waiting room"
          >
            <Users size={18} />
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] leading-none rounded-full w-4 h-4 flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Main stage */}
      <div className="absolute inset-0 bg-black">
        {isScreenSharing && (
          <video
            ref={screenVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-contain"
          />
        )}
        {!isScreenSharing && remoteIsSharing && (
          <video
            ref={remoteScreenVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-contain"
          />
        )}

        {/* Remote camera — ALWAYS mounted here. Only its classes change.
      Never conditionally render a second <video ref={remoteVideoRef}> anywhere else. */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={
            isPresenting
              ? "absolute bottom-24 right-4 w-32 h-20 md:w-40 md:h-24 object-cover rounded-xl border border-[var(--border)] shadow-lg z-10 transition-all duration-300"
              : "w-full h-full object-cover transition-all duration-300"
          }
        />

        {remoteHandRaised && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[var(--surface)] px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm">
            <Hand size={16} className="text-yellow-400" /> Hand raised
          </div>
        )}
        {isPresenting && (
          <div className="absolute top-4 right-4 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
            {isScreenSharing ? "You're presenting" : "Presenting"}
          </div>
        )}
      </div>

      {/* Camera tile stack — only YOUR camera lives here now */}
      <div className="absolute bottom-24 right-4 flex flex-col gap-2">
        <div
          className={`bg-[var(--surface)] rounded-xl overflow-hidden border border-[var(--border)] shadow-lg relative ${
            isPresenting
              ? "w-32 h-20 md:w-40 md:h-24"
              : "w-40 h-28 md:w-56 md:h-36"
          }`}
        >
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
          {!cameraOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-[var(--surface)] text-[var(--text-secondary)] text-xs">
              Camera off
            </div>
          )}
        </div>
      </div>

      {status === "waiting" && (
        <div className="absolute inset-0 bg-[var(--bg)]/95 flex flex-col items-center justify-center gap-3 text-center px-6 z-30">
          <div className="animate-pulse text-lg font-medium">
            Waiting for the host to let you in...
          </div>
          <p className="text-[var(--text-secondary)] text-sm">
            You'll connect automatically once admitted.
          </p>
        </div>
      )}
      {status === "denied" && (
        <div className="absolute inset-0 bg-[var(--bg)]/95 flex items-center justify-center text-center px-6 z-30">
          <p>The host denied your request to join. Redirecting...</p>
        </div>
      )}
      {status === "ended" && (
        <div className="absolute inset-0 bg-[var(--bg)]/95 flex items-center justify-center text-center px-6 z-30">
          <p>The interview has ended. Redirecting...</p>
        </div>
      )}

      <div
        className={`absolute top-0 right-0 h-full w-72 bg-[var(--surface)] border-l border-[var(--border)] shadow-2xl z-20 transition-transform duration-300 ${
          showRequestsPanel ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border)]">
          <h3 className="font-medium">Waiting to join</h3>
          <button
            onClick={() => setShowRequestsPanel(false)}
            className="p-1 rounded-full hover:bg-[var(--bg)]"
            aria-label="Close panel"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto">
          {pendingRequests.length === 0 ? (
            <p className="text-sm text-[var(--text-secondary)] px-4 py-6 text-center">
              No one is waiting.
            </p>
          ) : (
            pendingRequests.map((r) => (
              <div
                key={r.userId}
                className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]"
              >
                <span className="text-sm truncate">{r.name}</span>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => admit(r.userId)}
                    className="p-1.5 rounded-full bg-green-500/15 text-green-500 hover:bg-green-500/25"
                    aria-label="Admit"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => deny(r.userId)}
                    className="p-1.5 rounded-full bg-red-500/15 text-red-500 hover:bg-red-500/25"
                    aria-label="Deny"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-[var(--surface)] px-4 py-3 rounded-full border border-[var(--border)] shadow-lg z-10">
        <button
          onClick={toggleMic}
          className={`p-3 rounded-full ${micOn ? "bg-[var(--bg)]" : "bg-red-500 text-white"}`}
          aria-label="Toggle microphone"
        >
          {micOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        <button
          onClick={toggleCamera}
          className={`p-3 rounded-full ${cameraOn ? "bg-[var(--bg)]" : "bg-red-500 text-white"}`}
          aria-label="Toggle camera"
        >
          {cameraOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>
        <button
          onClick={toggleHandRaise}
          className={`p-3 rounded-full ${handRaised ? "bg-yellow-400 text-black" : "bg-[var(--bg)]"}`}
          aria-label="Raise hand"
        >
          <Hand size={20} />
        </button>
        <button
          onClick={toggleScreenShare}
          className={`p-3 rounded-full ${isScreenSharing ? "bg-[var(--primary)] text-white" : "bg-[var(--bg)]"}`}
          aria-label="Share screen"
        >
          {isScreenSharing ? (
            <ScreenShareOff size={20} />
          ) : (
            <ScreenShare size={20} />
          )}
        </button>
        <button
          onClick={() => setShowExitConfirm(true)}
          className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700"
          aria-label={isHost ? "End interview" : "Leave interview"}
        >
          <PhoneOff size={20} />
        </button>
      </div>

      <ConfirmDialog
        open={showExitConfirm}
        onOpenChange={setShowExitConfirm}
        title={isHost ? "End interview?" : "Leave interview?"}
        description={
          isHost
            ? "This will end the interview for both participants."
            : "You can rejoin if the host is still in the room."
        }
        confirmLabel={isHost ? "End for everyone" : "Leave"}
        onConfirm={confirmExit}
      />
    </div>
  );
};

export default InterviewRoom;
