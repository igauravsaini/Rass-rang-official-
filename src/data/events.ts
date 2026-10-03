export interface EventHighlight {
  id: string;
  icon: string;
  title: string;
  description: string;
  delay: string;
}

export const eventHighlights: EventHighlight[] = [
  {
    id: 'event-garba',
    icon: '💃',
    title: 'Garba Night',
    description: 'Immerse in the rhythmic circle dance celebrating Goddess Durga with live dhol and traditional music.',
    delay: '0.05s',
  },
  {
    id: 'event-dandiya',
    icon: '🥢',
    title: 'Dandiya Raas',
    description: 'Experience the electrifying Dandiya Raas with colourful sticks, vibrant moves, and festive energy.',
    delay: '0.1s',
  },
  {
    id: 'event-cultural',
    icon: '🎭',
    title: 'Live Cultural Shows',
    description: 'Witness mesmerising live performances showcasing regional talent and traditional art forms.',
    delay: '0.15s',
  },
  {
    id: 'event-music',
    icon: '🎵',
    title: 'DJ & Folk Music',
    description: 'From soulful folk melodies to high-energy DJ sets — music that moves your body and spirit.',
    delay: '0.2s',
  },
  {
    id: 'event-food',
    icon: '🍛',
    title: 'Food Festival',
    description: 'Savour authentic regional delicacies, street food favourites, and festive treats from curated vendors.',
    delay: '0.25s',
  },
  {
    id: 'event-fashion',
    icon: '👗',
    title: 'Traditional Fashion',
    description: 'Celebrate heritage fashion — chaniya cholis, kurtas, and ethnic wear that define Navratri elegance.',
    delay: '0.3s',
  },
  {
    id: 'event-family',
    icon: '👨‍👩‍👧‍👦',
    title: 'Family Zone',
    description: "Dedicated spaces for families with kids' activities, comfortable seating, and a safe festive environment.",
    delay: '0.35s',
  },
  {
    id: 'event-photo',
    icon: '📸',
    title: 'Photo Booth',
    description: 'Capture memories at themed photo stations with traditional props and stunning backdrops.',
    delay: '0.4s',
  },
  {
    id: 'event-awards',
    icon: '🏆',
    title: 'Awards & Competitions',
    description: 'Compete in best-dressed, best dancer, and group performance categories for exciting prizes.',
    delay: '0.45s',
  },
];
