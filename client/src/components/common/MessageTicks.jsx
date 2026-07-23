export default function MessageTicks({ status }) {
  const color = status === "read" ? "var(--accent)" : "rgba(255,255,255,0.6)";

  if (status === "sent") {
    return (
      <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
        <path
          d="M1 5L4.5 8.5L13 1"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg width="18" height="10" viewBox="0 0 18 10" fill="none">
      <path
        d="M1 5L4.5 8.5L13 1"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 5L8.5 8.5L17 1"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
