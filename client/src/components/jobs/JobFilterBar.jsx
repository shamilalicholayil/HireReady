import { useState, useEffect } from "react";

const TRACK_OPTIONS = [
  { value: "", label: "All Tracks" },
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
  { value: "dsa", label: "DSA" },
  { value: "fullstack", label: "Full-stack" },
];

const JobFilterBar = ({ onFilterChange, extraFilter }) => {
  const [search, setSearch] = useState("");
  const [track, setTrack] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ search, track });
    }, 400);
    return () => clearTimeout(timer);
  }, [search, track]);

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <input
        placeholder="Search by title..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 min-w-[160px] p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)]"
      />
      <select
        value={track}
        onChange={(e) => setTrack(e.target.value)}
        className="p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] text-[var(--text-primary)]"
      >
        {TRACK_OPTIONS.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      {extraFilter}
    </div>
  );
};

export default JobFilterBar;
