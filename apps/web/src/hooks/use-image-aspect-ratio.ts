import { useEffect, useState } from "react";

export const defaultHeroAspectRatio = 16 / 9;

export function useImageAspectRatio(imageUrl?: string) {
  const [aspectRatio, setAspectRatio] = useState(defaultHeroAspectRatio);

  useEffect(() => {
    if (!imageUrl) {
      setAspectRatio(defaultHeroAspectRatio);
      return;
    }

    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (!cancelled && image.naturalWidth && image.naturalHeight) {
        setAspectRatio(image.naturalWidth / image.naturalHeight);
      }
    };
    image.src = imageUrl;

    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  return aspectRatio;
}
