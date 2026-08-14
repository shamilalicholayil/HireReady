import { Code2, Database, Brain, Layers } from "lucide-react";
import {
  TRACK_STACK_MAP,
  TRACKS_REQUIRING_STACK,
} from "../../constants/trackStack";

const tracks = [
  { id: "frontend", label: "Frontend", icon: Code2, desc: "React, JS, CSS" },
  { id: "backend", label: "Backend", icon: Database, desc: "Node, APIs, DB" },
  { id: "dsa", label: "DSA", icon: Brain, desc: "Algorithms" },
  {
    id: "fullstack",
    label: "Full Stack",
    icon: Layers,
    desc: "Frontend + Backend",
  },
];

export default function InterviewStart({
  track,
  setTrack,
  stack,
  setStack,
  difficulty,
  setDifficulty,
  handleStart,
  error,
}) {
  const requiresStack = TRACKS_REQUIRING_STACK.includes(track);
  const stackOptions = TRACK_STACK_MAP[track] || [];
  const canStart = requiresStack ? Boolean(stack) : true;

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 sm:p-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient sm:text-4xl">
          AI Interview
        </h1>
        <p className="text-slate-400 mt-2">
          Practice real interviews with AI evaluation
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {tracks.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setTrack(item.id)}
              className={`glass rounded-3xl p-5 text-left transition hover:-translate-y-1 ${track === item.id ? "border-indigo-400 bg-indigo-500/10" : ""}`}
            >
              <Icon size={24} />
              <h3 className="font-semibold mt-4">{item.label}</h3>
              <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
            </button>
          );
        })}
      </div>

      {requiresStack && (
        <div>
          <h3 className="mb-3">Stack</h3>
          <div className="flex flex-wrap gap-3">
            {stackOptions.map((item) => (
              <button
                key={item}
                onClick={() => setStack(item)}
                className={`px-5 py-2 rounded-full border transition ${stack === item ? "bg-indigo-500 text-white" : "border-white/10"}`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-3">Difficulty</h3>
        <div className="flex flex-wrap gap-3">
          {["beginner", "intermediate", "advanced"].map((level) => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              className={`px-5 py-2 rounded-full border transition ${difficulty === level ? "bg-indigo-500 text-white" : "border-white/10"}`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-red-400">{error}</p>}

      <button
        onClick={handleStart}
        disabled={!canStart}
        className="w-full h-14 rounded-2xl gradient-primary font-semibold text-lg hover:scale-[1.02] transition disabled:opacity-50"
      >
        Start Interview →
      </button>
    </div>
  );
}
