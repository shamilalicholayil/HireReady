export default function InterviewQuestion({ question }) {
  return (
    <div className="glass rounded-3xl p-5 sm:p-8">
      <p className="text-xs uppercase tracking-widest text-cyan-400 mb-4">
        Question
      </p>

      <h2 className="text-xl font-semibold leading-relaxed sm:text-2xl">
        {question}
      </h2>
    </div>
  );
}
