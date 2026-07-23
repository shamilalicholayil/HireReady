import { useState, useEffect, useRef, useCallback } from "react";

export default function useInfiniteReveal(totalItems, batchSize = 12) {
  const [visibleCount, setVisibleCount] = useState(batchSize);
  const sentinelRef = useRef(null);

  useEffect(() => {
    setVisibleCount(batchSize);
  }, [totalItems, batchSize]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((c) => Math.min(c + batchSize, totalItems));
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [totalItems, batchSize]);

  const reset = useCallback(() => setVisibleCount(batchSize), [batchSize]);

  return { visibleCount, sentinelRef, reset };
}
