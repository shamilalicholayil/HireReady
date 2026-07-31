export default function InterviewHeader({
  track,
  difficulty,
  questionNumber,
  totalQuestions,
}) {
  return (
    <div className="glass flex flex-col gap-5 rounded-3xl p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div>
        <h1 className="text-2xl font-bold">AI Interview</h1>

        <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-400">
          <span>{track}</span>

          <span>•</span>

          <span>{difficulty}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="text-sm">
          Question
          <strong>
            {" "}
            {questionNumber}/{totalQuestions}
          </strong>
        </div>

        <div className="glass rounded-full px-4 py-2 text-sm">AI Session</div>
      </div>
    </div>
  );
}
