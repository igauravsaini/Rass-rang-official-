import React, { useState } from 'react';
import { SectionHeading } from '../layout/SectionHeading';
import { Lightbox } from './Lightbox';
import { galleryFilters, galleryItems, GalleryCategory } from '../../data/gallery';

export const Gallery: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<GalleryCategory>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredItems = galleryItems.filter(
    (item) => activeCategory === 'all' || item.category === activeCategory
  );

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const handleCloseLightbox = () => {
    setLightboxIndex(null);
  };

  const handlePrev = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + filteredItems.length) % filteredItems.length);
  };

  const handleNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % filteredItems.length);
  };

  const currentLightboxItem = lightboxIndex !== null ? filteredItems[lightboxIndex] : null;

  return (
    <section id="gallery" className="section gallery-section">
      <div className="section-container">
        <SectionHeading
          eyebrow="Visual Journey"
          title="Gallery"
          subtitle="A glimpse into the world of Raas~Rang"
        />

        <div className="gallery-filters">
          {galleryFilters.map((filter) => (
            <button
              key={filter.category}
              type="button"
              className={`gallery-filter ${activeCategory === filter.category ? 'active' : ''}`.trim()}
              onClick={() => setActiveCategory(filter.category)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="gallery-masonry">
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              className="gallery-item"
              data-category={item.category}
              onClick={() => handleOpenLightbox(index)}
            >
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                decoding="async"
                width={600}
                height={400}
              />
              <div className="gallery-overlay">
                <span className="gallery-label">{item.label}</span>
                <button
                  type="button"
                  className="gallery-expand"
                  aria-label={`View full size ${item.label}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenLightbox(index);
                  }}
                >
                  🔍
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Lightbox
        isOpen={lightboxIndex !== null}
        item={currentLightboxItem}
        onClose={handleCloseLightbox}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </section>
  );
};
