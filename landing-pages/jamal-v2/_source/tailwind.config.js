/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1A0B10',
        surface: '#2A1620',
        line: '#422835',
        cream: '#F3ECE5',
        muted: '#A98A90',
        accent: 'var(--accent)',
        wine: 'var(--wine)',
      },
      fontFamily: {
        display: ['"Bodoni Moda"', 'Didot', '"Bodoni 72"', '"Bodoni MT"', 'Georgia', 'serif'],
        body: ['Manrope', 'system-ui', 'sans-serif'],
        // The wordmark echoes the JAMAL logo (Didone serif).
        serif: ['"Bodoni Moda"', 'Didot', '"Bodoni 72"', '"Bodoni MT"', 'Georgia', 'serif'],
        // Arabic: Thmanyah (same family as thmanyah.com), used in the AR locale.
        arabic: ['"Thmanyah Sans"', 'system-ui', 'sans-serif'],
        'arabic-display': ['"Thmanyah Serif Display"', '"Thmanyah Sans"', 'serif'],
      },
    },
  },
  plugins: [],
};
