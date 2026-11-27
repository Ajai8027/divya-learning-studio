export const NAV_LINKS = [
  { label: 'Benefits', href: '#benefits' },
  { label: 'Programs', href: '#programs' },
  { label: 'FAQ', href: '#faq' },
];

export const BENEFITS = [
  {
    id: 'guidance',
    title: 'Guided instruction',
    description: 'Learn with a structured weekly roadmap.',
  },
  {
    id: 'practice',
    title: 'Useful practice',
    description: 'Apply concepts through practical projects.',
  },
  {
    id: 'feedback',
    title: 'Supportive feedback',
    description: 'Track progress with constructive reviews.',
  },
];

export const PROGRAMS = [
  {
    id: 'foundations',
    title: 'Digital Foundations',
    description: 'A practical introduction to useful digital tools.',
  },
  {
    id: 'career',
    title: 'Career Skills Lab',
    description: 'Communicate, collaborate and build confidence.',
  },
  {
    id: 'portfolio',
    title: 'Project Portfolio',
    description: 'Turn guided projects into shareable work.',
  },
];

export const PROGRAM_OPTIONS = PROGRAMS.map(({ title }) => title);

export const FAQ_ITEMS = [
  {
    id: 'sessions',
    question: 'How do sessions work?',
    answer: 'Guided sessions with clear milestones.',
  },
  {
    id: 'schedule',
    question: 'Can I learn alongside work or college?',
    answer: 'Yes. Program schedules are designed to be flexible.',
  },
];
