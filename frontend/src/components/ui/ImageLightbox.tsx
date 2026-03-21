import React, { useEffect } from 'react';

interface ImageLightboxProps {
  src: string;
  alt: string;
  onClose: () => void;
}

// Fullscreen photo overlay — displays a single image centered on a dark backdrop.
// Close triggers: click backdrop OR press Escape key.
// The image itself does NOT close the lightbox (stopPropagation prevents that).
export const ImageLightbox: React.FC<ImageLightboxProps> = ({ src, alt, onClose }) => {
  // Register Escape key listener when the lightbox is open,
  // remove it when the component unmounts (lightbox closes).
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    // Backdrop — clicking anywhere on the dark overlay closes the lightbox.
    // role="button" and aria-label make this accessible to screen readers.
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="button"
      aria-label="Close photo"
    >
      {/* The image itself — stopPropagation prevents clicks on the image from
          bubbling up to the backdrop and closing the lightbox unintentionally. */}
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-full object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};
