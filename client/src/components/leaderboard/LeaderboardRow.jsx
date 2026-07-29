import { useSelector } from "react-redux";
import { Medal } from "lucide-react";

export default function LeaderboardRow({ entry, rank }) {
  const { user } = useSelector((state) => state.auth);

  const isMe = entry.user?._id === user?._id;

  return (
    <div
      className={`
        grid
        grid-cols-[80px_1fr_120px_120px]
        items-center
        border-b
        border-border
        px-6
        py-4
        transition
        hover:bg-background/40
        ${isMe ? "bg-primary/10 border-primary/30" : ""}
      `}
    >
      {/* Rank */}

      <div className="flex items-center gap-2">
        {rank <= 10 && <Medal size={16} className="text-primary" />}

        <span className="font-semibold">#{rank}</span>
      </div>

      {/* User */}

      <div className="flex items-center gap-4">
        <img
          src={entry.user.avatar || "/default-avatar.png"}
          alt={entry.user.name}
          className="h-11 w-11 rounded-full object-cover"
        />

        <div>
          <p className="font-medium">
            {entry.user.name}

            {isMe && <span className="ml-2 text-primary">(You)</span>}
          </p>

          <p className="text-sm text-muted-foreground">Frontend Interview</p>
        </div>
      </div>

      {/* Sessions */}

      <div className="font-medium">{entry.sessionCount}</div>

      {/* Score */}

      <div className="text-right">
        <span className="text-lg font-bold text-primary">
          {entry.totalScore}
        </span>
      </div>
    </div>
  );
}
