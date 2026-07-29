import PodiumCard from "./PodiumCard";

export default function Podium({ entries, track }) {
  const first = entries[0];
  const second = entries[1];
  const third = entries[2];

  return (
    <section className="mb-12">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:items-end">
        {/* 2nd */}
        <PodiumCard player={second} rank={2} track={track} />
        {/* 1st */}
        <PodiumCard player={first} rank={1} featured track={track} />
        {/* 3rd */}
        <PodiumCard player={third} rank={3} track={track} />{" "}
      </div>
    </section>
  );
}
