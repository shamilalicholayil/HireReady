import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { fetchSlotById } from "../../api/slotApi";
import { useWebRTC } from "../../hooks/useWebRTC";

const InterviewRoom = () => {
  const { id } = useParams();
  const [slot, setSlot] = useState(null);

  useEffect(() => {
    fetchSlotById(id)
      .then(({ data }) => setSlot(data.data.slot))
      .catch(() => toast.error("Could not load this interview."));
  }, [id]);

  const { localVideoRef, remoteVideoRef, joined } = useWebRTC(slot?.roomId, id);

  if (!slot)
    return (
      <div className="p-6 text-[var(--text-secondary)]">Loading room...</div>
    );

  return (
    <div className="p-6 grid grid-cols-2 gap-4 h-[80vh]">
      <div className="bg-[var(--surface)] rounded-2xl overflow-hidden">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
      <div className="bg-[var(--surface)] rounded-2xl overflow-hidden">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      </div>
      {!joined && (
        <p className="col-span-2 text-center text-[var(--text-secondary)]">
          Connecting...
        </p>
      )}
    </div>
  );
};

export default InterviewRoom;
