export default function Card({
  title,
  description,
  action,
  children,
  className = "",
}) {
  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6 ${className}`}
    >
      {(title || action) && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            {title && (
              <h2 className="truncate text-base font-semibold text-[var(--text-primary)] sm:text-lg">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 break-words text-sm text-[var(--text-secondary)]">
                {description}
              </p>
            )}
          </div>
          {action && <div className="w-full sm:w-auto">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
