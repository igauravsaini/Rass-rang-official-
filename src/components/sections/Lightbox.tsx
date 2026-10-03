import React, { useEffect } from 'react';
import { GalleryItem } from '../../data/gallery';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';

export interface LightboxProps {
  isOpen: boolean;
  item: GalleryItem | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export const Lightbox: React.FC<LightboxProps> = ({ isOpen, item, onClose, onPrev, onNext }) => {
  useLockBodyScroll(isOpen);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        onPrev();
      } else if (e.key === 'ArrowRight') {
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onPrev, onNext]);

  if (!isOpen || !item) return null;

  return (
    <div
      className="lightbox active"
      id="lightbox"
      role="dialog"
      aria-label="Image lightbox"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <button
        type="button"
        className="lightbox-close"
        aria-label="Close lightbox"
        onClick={onClose}
      >
        &times;
      </button>

      <button
        type="button"
        className="lightbox-prev"
        aria-label="Previous image"
        onClick={onPrev}
      >
        &#10094;
      </button>

      <button
        type="button"
        className="lightbox-next"
        aria-label="Next image"
        onClick={onNext}
      >
        &#10095;
      </button>

      <img
        src={item.src}
        alt={item.alt}
        className="lightbox-img"
        id="lightbox-img"
        decoding="async"
      />

      <div className="lightbox-caption" id="lightbox-caption">
        {item.label}
      </div>
    </div>
  );
};
