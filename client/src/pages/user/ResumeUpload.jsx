import { useState } from "react";
import { uploadResume } from "../../api/profileApi";
import Card from "../../components/common/Card";

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("resume", file);
    setLoading(true);
    try {
      const res = await uploadResume(formData);
      setResult(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 p-6">
      <h1 className="text-[var(--text-primary)] text-2xl font-semibold">
        Resume Upload
      </h1>

      <Card title="Upload PDF">
        <div className="flex flex-col gap-4">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="text-[var(--text-secondary)]"
          />
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="bg-[var(--primary)] text-white rounded-lg px-6 py-2 text-sm font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            {loading ? "Uploading..." : "Upload Resume"}
          </button>
          {error && <p className="text-[var(--error)] text-sm">{error}</p>}
        </div>
      </Card>

      {result && (
        <Card title="Parsed Results">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-[var(--text-secondary)] text-sm mb-1">
                Suggested Track
              </p>
              <span className="bg-[var(--primary)] text-white text-sm px-3 py-1 rounded-full">
                {result.suggestedTrack}
              </span>
            </div>
            <div>
              <p className="text-[var(--text-secondary)] text-sm mb-2">
                Skills Found
              </p>
              <div className="flex flex-wrap gap-2">
                {result.foundSkills.map((skill) => (
                  <span
                    key={skill}
                    className="bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text-primary)] text-xs px-3 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
