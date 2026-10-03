export interface ScheduleItem {
  time: string;
  title: string;
  description: string;
  align: 'left' | 'right';
  delay: string;
}

export const scheduleItems: ScheduleItem[] = [
  {
    time: '6:00 PM',
    title: 'Gates Open',
    description: 'Welcome to Raas~Rang! Arrive early, grab your passes, and soak in the festive ambiance.',
    align: 'left',
    delay: '0.1s',
  },
  {
    time: '6:30 PM',
    title: 'Opening Ceremony',
    description: 'Grand inauguration with lamp lighting, welcome address, and cultural invocations.',
    align: 'right',
    delay: '0.15s',
  },
  {
    time: '7:00 PM',
    title: 'Maha Aarti',
    description: 'A divine collective Maha Aarti to invoke blessings of Goddess Durga before the celebrations.',
    align: 'left',
    delay: '0.2s',
  },
  {
    time: '7:30 PM',
    title: 'Garba Session I',
    description: 'The dance floor opens! Join the first electrifying session of traditional Garba with live dhol.',
    align: 'right',
    delay: '0.25s',
  },
  {
    time: '8:30 PM',
    title: 'Cultural Performances',
    description: 'Live stage performances showcasing regional talent, folk music, and traditional art forms.',
    align: 'left',
    delay: '0.3s',
  },
  {
    time: '9:00 PM',
    title: 'Dandiya Raas',
    description: 'Pick up your sticks! The high-energy Dandiya Raas session takes the celebration to new heights.',
    align: 'right',
    delay: '0.35s',
  },
  {
    time: '10:30 PM',
    title: 'Finale Celebration',
    description: "A grand finale with awards, DJ set, and a spectacular closing that you'll remember forever.",
    align: 'left',
    delay: '0.4s',
  },
];
