import { useEffect, useState } from 'react';
import { getAssetUrl, IMAGE_PLACEHOLDERS } from '../api/files.js';

const SafeImage = ({
  src,
  fallback = IMAGE_PLACEHOLDERS.avatar,
  alt = '',
  onError,
  ...props
}) => {
  const resolvedFallback = fallback || IMAGE_PLACEHOLDERS.avatar;
  const [currentSrc, setCurrentSrc] = useState(() =>
    getAssetUrl(src, resolvedFallback),
  );

  useEffect(() => {
    setCurrentSrc(getAssetUrl(src, resolvedFallback));
  }, [src, resolvedFallback]);

  const handleError = (event) => {
    if (currentSrc !== resolvedFallback) {
      setCurrentSrc(resolvedFallback);
    }
    onError?.(event);
  };

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      onError={handleError}
    />
  );
};

export default SafeImage;
