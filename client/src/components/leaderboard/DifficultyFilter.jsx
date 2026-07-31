import { ChevronDown } from "lucide-react";

const DIFFICULTIES = ["beginner", "intermediate", "advanced"];

export default function DifficultyFilter({ difficulty, setDifficulty }) {
  return (
    <div className="relative w-full sm:w-48">
      <select
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
        className="
          w-full
          appearance-none
          rounded-xl
          border
          border-border
          bg-card
          px-4
          py-3
          pr-10
          text-sm
          capitalize
          shadow-sm
          transition
          hover:border-primary
          focus:border-primary
          focus:outline-none
        "
      >
        {DIFFICULTIES.map((level) => (
          <option key={level} value={level}>
            {level}
          </option>
        ))}
      </select>

      <ChevronDown
        size={18}
        className="
          pointer-events-none
          absolute
          right-4
          top-1/2
          -translate-y-1/2
          text-muted-foreground
        "
      />
    </div>
  );
}
