import NextRoundButton from "./NextRoundButton";
import { Button } from "@/components/ui/button";
import Card from "../common/Card";

const InterviewSlotCard = ({
  slot,
  isHR,
  user,
  hasNextRound,
  onJoin,
  onManualStatus,
  onOutcome,
  onNextRoundScheduled,
}) => {
  const canJoin = () => {
    const owns = isHR
      ? slot.contactEmail === user.email
      : slot.booking?._id === user._id;
    const notEnded =
      slot.interviewStatus !== "completed" &&
      slot.interviewStatus !== "no_show";
    return owns && notEnded;
  };

  return (
    <Card
      title={slot.booking?.name || slot.name || "Applicant"}
      description={`${slot.booking?.email ? slot.booking.email + " — " : ""}${new Date(slot.startTime).toLocaleString()}`}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="w-fit rounded-full bg-[var(--surface)] px-3 py-1 text-xs uppercase tracking-wide text-[var(--text-secondary)]">
            {slot.interviewStatus.replace("_", " ")}
          </span>
          <span className="w-fit rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs uppercase tracking-wide text-[var(--primary)]">
            {slot.round.replace("_", " ")}
          </span>
          {slot.outcome === "rejected" && (
            <span className="w-fit rounded-full bg-red-500/15 px-3 py-1 text-xs uppercase tracking-wide text-red-400">
              Rejected
            </span>
          )}
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          {canJoin() && (
            <Button className="w-full sm:w-auto" onClick={() => onJoin(slot)}>
              {slot.interviewStatus === "in_progress"
                ? "Rejoin"
                : "Join Interview"}
            </Button>
          )}

          {isHR && slot.interviewStatus === "in_progress" && (
            <>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => onManualStatus(slot, "completed")}
              >
                Mark Completed
              </Button>
              <Button
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={() => onManualStatus(slot, "no_show")}
              >
                Mark No-Show
              </Button>
            </>
          )}

          {isHR &&
            slot.interviewStatus === "completed" &&
            slot.outcome === "pending" && (
              <>
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => onOutcome(slot, "shortlisted")}
                >
                  Shortlist
                </Button>
                <Button
                  variant="destructive"
                  className="w-full sm:w-auto"
                  onClick={() => onOutcome(slot, "rejected")}
                >
                  Reject
                </Button>
              </>
            )}

          {isHR &&
            slot.outcome === "shortlisted" &&
            slot.round !== "hr_final" &&
            !hasNextRound(slot) && (
              <NextRoundButton slot={slot} onScheduled={onNextRoundScheduled} />
            )}

          {isHR &&
            slot.outcome === "shortlisted" &&
            slot.round !== "hr_final" &&
            hasNextRound(slot) && (
              <span className="w-fit rounded-full bg-[var(--primary)]/15 px-3 py-1 text-xs text-[var(--primary)]">
                Next round scheduled
              </span>
            )}

          {isHR &&
            slot.outcome === "shortlisted" &&
            slot.round === "hr_final" && (
              <span className="w-fit rounded-full bg-green-500/15 px-3 py-1 text-xs text-green-400">
                Final round passed — candidate approved
              </span>
            )}
        </div>
      </div>
    </Card>
  );
};

export default InterviewSlotCard;
