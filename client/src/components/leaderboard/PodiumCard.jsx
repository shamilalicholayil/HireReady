import { Crown, Medal } from "lucide-react";

const styles = {
  1: {
    border: "border-yellow-400/40",
    badge: "bg-yellow-500 text-black",
    ring: "ring-yellow-400",
    shadow: "shadow-yellow-500/20",
  },

  2: {
    border: "border-slate-400/40",
    badge: "bg-slate-400 text-black",
    ring: "ring-slate-300",
    shadow: "shadow-slate-500/20",
  },

  3: {
    border: "border-amber-700/40",
    badge: "bg-amber-700 text-white",
    ring: "ring-amber-700",
    shadow: "shadow-amber-700/20",
  },
};

export default function PodiumCard({ player, rank, featured = false, track }) {
  if (!player)
    return (
      <div className="h-[340px] rounded-3xl border border-dashed border-border bg-card" />
    );

  const style = styles[rank];

  return (
    <div
      className={`
        relative
        overflow-hidden
        rounded-3xl
        border
        bg-card
        p-4
        sm:p-6
        transition-all
        duration-300
        hover:-translate-y-2
        hover:shadow-xl
        ${style.border}
        ${style.shadow}
        ${featured ? "md:scale-110" : ""}
      `}
    >
      {/* Badge */}

      <div
        className={`
          absolute
          right-5
          top-5
          rounded-full
          px-3
          py-1
          text-xs
          font-bold
          ${style.badge}
        `}
      >
        #{rank}
      </div>

      {/* Crown */}

      {rank === 1 && (
        <div className="mb-5 flex justify-center">
          <div className="rounded-full bg-yellow-500/10 p-3">
            <Crown size={28} className="text-yellow-400" />
          </div>
        </div>
      )}

      {rank !== 1 && (
        <div className="mb-5 flex justify-center">
          <div className="rounded-full bg-muted p-3">
            <Medal size={22} className="text-muted-foreground" />
          </div>
        </div>
      )}

      {/* Avatar */}

      {player.user.avatar ? (
        <img
          src={player.user.avatar}
          alt={player.user.name}
          className={`
            mx-auto
            h-20
            w-20
            sm:h-24
            sm:w-24
            rounded-full
            object-cover
            ring-4
            ${style.ring}
          `}
        />
      ) : (
        <div
          className={`
            mx-auto
            flex
            h-20
            w-20
            sm:h-24
            sm:w-24
            items-center
            justify-center
            rounded-full
            bg-primary
            text-2xl
            font-bold
            text-white
            ring-4
            ${style.ring}
          `}
        >
          {player.user.name?.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Name */}

      <h3 className="mt-5 text-center text-lg sm:text-xl font-semibold">
        {player.user.name}
      </h3>

      {/* Track */}

      <p className="mt-1 text-center text-sm capitalize text-muted-foreground">
        {track} Interview
      </p>

      {/* Divider */}

      <div className="my-6 h-px bg-border" />

      {/* Score */}

      <div className="text-center">
        <div className="text-3xl sm:text-4xl font-bold text-primary">
          {player.totalScore}
        </div>

        <div className="mt-1 text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Points
        </div>
      </div>

      {/* Sessions */}

      <div className="mt-6 flex items-center justify-between rounded-xl bg-background/40 p-3 text-sm sm:text-base">
        <span className="text-muted-foreground">Sessions</span>

        <span className="font-semibold">{player.sessionCount}</span>
      </div>
    </div>
  );
}
