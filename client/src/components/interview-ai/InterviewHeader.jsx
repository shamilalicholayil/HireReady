export default function InterviewHeader({
  track,
  difficulty,
  questionNumber,
  totalQuestions,
}) {
  return (
    <div className="flex justify-between items-center glass rounded-3xl p-6">
      <div>
        <h1 className="text-2xl font-bold">AI Interview</h1>

        <div className="flex gap-3 mt-2 text-sm text-slate-400">
          <span>{track}</span>

          <span>•</span>

          <span>{difficulty}</span>
        </div>
      </div>

      <div className="flex items-center gap-6">
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
