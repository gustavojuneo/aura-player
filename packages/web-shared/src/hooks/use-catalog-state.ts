import { useEffect, useState } from "react";

export function useCatalogState() {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 320);
    return () => window.clearTimeout(timer);
  }, []);

  const retry = () => {
    setIsLoading(true);
    window.setTimeout(() => setIsLoading(false), 320);
  };
  return { isLoading, retry };
}
