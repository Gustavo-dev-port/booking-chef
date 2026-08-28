import { useEffect, useState } from 'react';
import { getRecipePhotoUrl } from '../features/recipes/photos';

/** Resolve `photo_path` (bucket privado) numa signed URL exibível num <Image>. */
export function useRecipePhotoUrl(path: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!path) {
      setUrl(null);
      return;
    }
    getRecipePhotoUrl(path).then((signedUrl) => {
      if (!cancelled) setUrl(signedUrl);
    });
    return () => {
      cancelled = true;
    };
  }, [path]);

  return url;
}
