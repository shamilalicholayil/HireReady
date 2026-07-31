import { useSelector } from "react-redux";
import { Medal } from "lucide-react";

export default function LeaderboardRow({ entry, rank }) {
  const { user } = useSelector((state) => state.auth);

  const isMe = entry.user?._id === user?._id;

  return (
    <div
      className={`
        grid
        grid-cols-1
        gap-4
        md:grid-cols-[80px_1fr_120px_120px]
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

      <div className="flex items-center gap-3">
        {entry.user.avatar ? (
          <img
            src={entry.user.avatar}
            alt={entry.user.name}
            className="h-10 w-10 rounded-full object-cover sm:h-11 sm:w-11"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white sm:h-11 sm:w-11">
            {entry.user.name?.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">
            {entry.user.name}

            {isMe && <span className="ml-2 text-primary">(You)</span>}
          </p>

          <p className="truncate text-sm text-muted-foreground">
            Frontend Interview
          </p>
        </div>
      </div>

      {/* Sessions */}

      <div className="font-medium md:text-left">{entry.sessionCount}</div>

      {/* Score */}

      <div className="md:text-right">
        <span className="text-lg font-bold text-primary">
          {entry.totalScore}
        </span>
      </div>
    </div>
  );
}
