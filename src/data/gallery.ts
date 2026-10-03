export type GalleryCategory = 'all' | 'garba' | 'dandiya' | 'stage' | 'food' | 'fashion';

export interface GalleryFilterOption {
  label: string;
  category: GalleryCategory;
}

export interface GalleryItem {
  id: string;
  category: GalleryCategory;
  src: string;
  alt: string;
  label: string;
}

export const galleryFilters: GalleryFilterOption[] = [
  { label: 'All', category: 'all' },
  { label: 'Garba', category: 'garba' },
  { label: 'Dandiya', category: 'dandiya' },
  { label: 'Stage', category: 'stage' },
  { label: 'Food', category: 'food' },
  { label: 'Fashion', category: 'fashion' },
];

export const galleryItems: GalleryItem[] = [
  {
    id: 'gallery-1',
    category: 'garba',
    src: 'assets/images/gallery-garba.jpg',
    alt: 'Garba Dance Celebration',
    label: 'Garba Night',
  },
  {
    id: 'gallery-2',
    category: 'dandiya',
    src: 'assets/images/gallery-dandiya.jpg',
    alt: 'Dandiya Raas',
    label: 'Dandiya Raas',
  },
  {
    id: 'gallery-3',
    category: 'stage',
    src: 'assets/images/gallery-stage.jpg',
    alt: 'Main Stage Performance',
    label: 'Grand Stage',
  },
  {
    id: 'gallery-4',
    category: 'food',
    src: 'assets/images/gallery-food.jpg',
    alt: 'Food Festival',
    label: 'Food Festival',
  },
  {
    id: 'gallery-5',
    category: 'fashion',
    src: 'assets/images/gallery-fashion.jpg',
    alt: 'Traditional Festive Fashion',
    label: 'Festive Fashion',
  },
  {
    id: 'gallery-6',
    category: 'garba',
    src: 'assets/images/hero-bg.jpg',
    alt: 'Ramgarh Taal Night View',
    label: 'Ramgarh Taal',
  },
];
