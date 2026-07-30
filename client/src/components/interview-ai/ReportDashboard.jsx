import {
  Trophy,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";

function ScoreCard({ title, value, icon: Icon }) {
  return (
    <div
      className="
      glass
      rounded-3xl
      p-5
      "
    >
      <div className="flex items-center gap-3 text-slate-400">
        <Icon size={18} />

        <span className="text-sm">{title}</span>
      </div>

      <p className="text-3xl font-bold mt-4">{value ?? 0}%</p>

      <div className="h-2 bg-white/10 rounded-full mt-4 overflow-hidden">
        <div
          className="h-full gradient-primary rounded-full"
          style={{
            width: `${value ?? 0}%`,
          }}
        />
      </div>
    </div>
  );
}

export default function ReportDashboard({ report, onNewSession }) {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="glass rounded-3xl p-8 text-center">
        <Trophy className="mx-auto text-yellow-400" size={40} />
        <h1 className="text-4xl font-bold mt-4">Interview Complete</h1>
        <p className="text-slate-400 mt-2">Your AI performance analysis</p>
        <div className="text-6xl font-bold text-gradient mt-6">
          {report.finalScore}
        </div>
        <p className="text-sm text-slate-400">Overall Score</p>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <ScoreCard
          title="Technical Skills"
          value={report.technicalScore}
          icon={Target}
        />
        <ScoreCard
          title="Communication"
          value={report.communicationScore}
          icon={TrendingUp}
        />
        <ScoreCard
          title="Problem Solving"
          value={report.problemSolvingScore}
          icon={Lightbulb}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="text-emerald-400" />
            <h2 className="font-semibold">Strengths</h2>
          </div>
          <ul className="space-y-3 text-sm text-slate-300">
            {report.strengths?.map((item, index) => (
              <li key={index} className="flex gap-2">
                <span>✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="glass rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-yellow-400" />
            <h2 className="font-semibold">Improve</h2>
          </div>
          <ul className="space-y-3 text-sm text-slate-300">
            {report.weaknesses?.map((item, index) => (
              <li key={index} className="flex gap-2">
                <span>•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="glass rounded-3xl p-6">
        <h2 className="font-semibold mb-4">Improvement Roadmap</h2>
        <ul className="space-y-3 text-sm">
          {report.improvementSuggestions?.map((item, index) => (
            <li key={index} className="flex gap-2">
              <TrendingUp size={16} />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onNewSession}
        className="w-full h-14 rounded-2xl gradient-primary font-semibold hover:scale-[1.02] transition"
      >
        Start New Interview →
      </button>
    </div>
  );
}
