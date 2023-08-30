const { createGlobPatternsForDependencies } = require('@nx/angular/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, 'src/**/!(*.stories|*.spec).{ts,html}'),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    colors: {
      'yellow-primary': '#fef179',
      'yellow-secondary': '#f1c93c',
      dark: '#191919',
      white: '#f0f3f8',
    },
    extend: {},
  },
  plugins: [],
};
