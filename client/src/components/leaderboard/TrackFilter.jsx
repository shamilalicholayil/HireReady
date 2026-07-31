const TRACKS = ["frontend", "backend", "dsa", "fullstack"];

export default function TrackFilter({ track, setTrack }) {
  return (
    <select
      value={track}
      onChange={(e) => setTrack(e.target.value)}
      className="
        w-full
        sm:w-48
        rounded-xl
        border
        border-border
        bg-card
        px-4
        py-3
        text-sm
        capitalize
        shadow-sm
        transition
        hover:border-primary
        focus:outline-none
      "
    >
      {TRACKS.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>
  );
}
