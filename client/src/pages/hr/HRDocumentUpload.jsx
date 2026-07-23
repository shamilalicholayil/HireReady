import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { uploadHRDocument } from "../../api/profileApi";
import { updateUser } from "../../features/auth/authSlice";

export default function HRDocumentUpload() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("document", file);

    setStatus("loading");
    setError("");
    try {
      const res = await uploadHRDocument(formData);
      dispatch(updateUser({ hrDocuments: res.data.hrDocuments }));
      navigate("/hr-verification-pending");
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed.");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[var(--primary)] font-[Space_Grotesk]">
            One Last Step
          </h1>
          <p className="text-xs tracking-wide text-[var(--text-secondary)] mt-1">
            HR VERIFICATION
          </p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 shadow-xl">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-1">
            Upload verification document
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Upload a business registration certificate or company ID (PDF only)
            so our team can verify your company before approving access.
          </p>

          <form onSubmit={handleUpload} className="space-y-4">
            <label
              htmlFor="hr-doc"
              className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[var(--border)] rounded-xl px-4 py-8 cursor-pointer hover:border-[var(--primary)] transition"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--text-secondary)"
                strokeWidth="1.5"
              >
                <path
                  d="M12 16V4M12 4l-4 4M12 4l4 4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-sm text-[var(--text-secondary)]">
                {file ? file.name : "Click to select a PDF"}
              </span>
              <input
                id="hr-doc"
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
              />
            </label>

            {error && (
              <p className="text-sm text-[var(--error)] bg-[var(--error)]/10 border border-[var(--error)]/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!file || status === "loading"}
              className="w-full bg-[var(--primary)] text-white text-sm font-medium rounded-lg py-2.5 hover:opacity-90 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "loading" ? "Uploading..." : "Submit for Review"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
