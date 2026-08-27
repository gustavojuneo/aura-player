import { useDeferredValue, useEffect, useRef, useState } from "react";

const pageSize = 40;

export function useInfiniteCatalog<T>(
  items: T[],
  filter: (item: T, query: string, category: string) => boolean,
  sort: (first: T, second: T) => number,
  query: string,
  category: string,
  shouldPaginate = true,
) {
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase());
  const [page, setPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const resetKey = `${category}|${deferredQuery}|${items.length}|${items[0] ? JSON.stringify(items[0]) : ""}`;
  const filteredItems = items
    .filter((item) => filter(item, deferredQuery, category))
    .sort(sort);
  const visibleItems = shouldPaginate
    ? filteredItems.slice(0, page * pageSize)
    : filteredItems;

  useEffect(() => {
    if (!resetKey) return;
    setPage(1);
  }, [resetKey]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (
      !shouldPaginate ||
      !sentinel ||
      visibleItems.length >= filteredItems.length
    )
      return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setPage((current) => current + 1);
      },
      { rootMargin: "640px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredItems.length, shouldPaginate, visibleItems.length]);

  return {
    deferredQuery,
    filteredCount: filteredItems.length,
    hasMore: visibleItems.length < filteredItems.length,
    sentinelRef,
    visibleItems,
  };
}
