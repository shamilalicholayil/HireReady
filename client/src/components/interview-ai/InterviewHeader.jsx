import CameraPreview from "./CameraPreview";

export default function InterviewHeader({ track, stack, difficulty }) {
  return (
    <div className="glass flex flex-col gap-5 rounded-3xl p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div>
        <h1 className="text-2xl font-bold">AI Interview</h1>
        <div className="mt-2 flex flex-wrap gap-2 text-sm text-slate-400">
          <span>{track}</span>
          {stack && (
            <>
              <span>•</span>
              <span>{stack}</span>
            </>
          )}
          <span>•</span>
          <span>{difficulty}</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <CameraPreview variant="compact" />
      </div>
    </div>
  );
}
