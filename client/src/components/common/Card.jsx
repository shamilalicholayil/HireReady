export default function Card({
  title,
  description,
  action,
  children,
  className = "",
}) {
  return (
    <div
      className={`bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 ${className}`}
    >
      {(title || action) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && (
              <h2 className="text-[var(--text-primary)] text-base font-semibold">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-[var(--text-secondary)] text-sm mt-1">
                {description}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
