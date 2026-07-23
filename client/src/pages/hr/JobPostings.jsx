import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  fetchMyJobPostings,
  createJob,
  toggleJobStatus,
} from "../../api/jobApi";
import { Button } from "@/components/ui/button";
import Card from "../../components/common/Card";

const initialForm = {
  title: "",
  description: "",
  company: "",
  location: "",
  track: "frontend",
  salaryRange: { min: "", max: "" },
};

const JobPostings = () => {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadJobs = async () => {
    try {
      const { data } = await fetchMyJobPostings();
      setJobs(data.data.jobs);
    } catch (err) {
      toast.error("Failed to load job postings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSalaryChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      salaryRange: { ...prev.salaryRange, [name]: value },
    }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        salaryRange: {
          min: Number(form.salaryRange.min) || undefined,
          max: Number(form.salaryRange.max) || undefined,
        },
      };
      await createJob(payload);
      toast.success("Job posted.");
      setForm(initialForm);
      setShowForm(false);
      loadJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to post job.");
    }
  };

  const handleToggle = async (jobId) => {
    try {
      await toggleJobStatus(jobId);
      loadJobs();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update job status.",
      );
    }
  };

  if (loading)
    return <div className="p-6 text-[var(--text-secondary)]">Loading...</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[var(--text-primary)] text-xl font-semibold">
          Job Postings
        </h2>
        <Button onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "+ New Job"}
        </Button>
      </div>

      {showForm && (
        <Card title="Create Job Posting">
          <div className="space-y-3">
            <input
              name="title"
              placeholder="Title"
              value={form.title}
              onChange={handleChange}
              className="w-full p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)]"
            />
            <input
              name="company"
              placeholder="Company"
              value={form.company}
              onChange={handleChange}
              className="w-full p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)]"
            />
            <input
              name="location"
              placeholder="Location"
              value={form.location}
              onChange={handleChange}
              className="w-full p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)]"
            />
            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="w-full p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)]"
            />
            <select
              name="track"
              value={form.track}
              onChange={handleChange}
              className="w-full p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)]"
            >
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="dsa">DSA</option>
              <option value="fullstack">Fullstack</option>
            </select>
            <div className="flex gap-2">
              <input
                name="min"
                type="number"
                placeholder="Min salary"
                value={form.salaryRange.min}
                onChange={handleSalaryChange}
                className="w-1/2 p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)]"
              />
              <input
                name="max"
                type="number"
                placeholder="Max salary"
                value={form.salaryRange.max}
                onChange={handleSalaryChange}
                className="w-1/2 p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)]"
              />
            </div>
            <Button onClick={handleSubmit}>Post Job</Button>
          </div>
        </Card>
      )}

      {jobs.map((job) => (
        <Card
          key={job._id}
          title={job.title}
          description={`${job.company} — ${job.location}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase text-[var(--text-secondary)]">
              {job.isActive ? "Active" : "Inactive"}
            </span>
            <Button variant="outline" onClick={() => handleToggle(job._id)}>
              {job.isActive ? "Deactivate" : "Activate"}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default JobPostings;
