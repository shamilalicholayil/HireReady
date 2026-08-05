import { useState } from "react";
import { toast } from "sonner";
import { closeJob } from "../../api/jobApi";
import { Button } from "@/components/ui/button";
import Card from "../common/Card";

const CloseAndScheduleForm = ({ jobId, onClosed }) => {
  const [closing, setClosing] = useState(false);

  const handleClose = async () => {
    setClosing(true);
    try {
      await closeJob(jobId);
      toast.success(
        "Job closed. Rejected applicants notified — schedule shortlisted candidates one by one below.",
      );
      onClosed();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to close job.");
    } finally {
      setClosing(false);
    }
  };

  return (
    <Card title="Close Applications">
      <p className="mb-3 text-sm text-[var(--text-secondary)]">
        This deactivates the job and emails rejected applicants immediately.
        Shortlisted candidates are scheduled individually afterward. This cannot
        be undone.
      </p>
      <Button
        variant="destructive"
        onClick={handleClose}
        disabled={closing}
        className="w-full sm:w-auto"
      >
        {closing ? "Closing..." : "Close Job & Notify Rejected"}
      </Button>
    </Card>
  );
};

export default CloseAndScheduleForm;
