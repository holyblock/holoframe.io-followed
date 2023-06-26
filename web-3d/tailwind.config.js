const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  mode: 'jit',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ], // remove unused styles in production
  darkMode: 'media', // or 'media' or 'class'
  theme: {
    extend: {
      backgroundImage: {
        'metamask-glow-bar':
          'conic-gradient(from 168.45deg at 50% 50%, #08A8ED 0deg, #ED7608 0deg, #ED9108 36deg, #F9BA71 72deg, #EDC808 108deg, #FFC452 144deg, #EDD608 180deg, #EDC808 216deg, #FFD02B 252deg, #EDDA96 288deg, #ECD47F 324deg, #ED7608 360deg)',
        'walletconnect-glow-bar':
          'conic-gradient(from 168.45deg at 50% 50%, #08A8ED 0deg, #08EDED 36deg, #71C8F9 72deg, #08A8ED 108deg, #43F7F7 144deg, #08C4ED 180deg, #08DFED 216deg, #F2FDFC 252deg, #96D8ED 288deg, #7FB8EC 324deg, #088DED 360deg)',
        'tokenproof-glow-bar':
          'conic-gradient(from 168.45deg at 50% 50%, #3ACFC9 0deg, #08EDED 36deg, #71F9F9 72deg, #DCED71 108deg, #A6E391 144deg, #08D2ED 180deg, #7FDBA8 216deg, #F9FFD0 252deg, #77DAAD 288deg, #DCED71 324deg, #9AE486 360deg);',
        'loading-glow-bar':
          'conic-gradient(from 168.45deg at 50% 50%, #3ACFC9 0deg, #08EDED 36deg, #71F9F9 72deg, #DCED71 108deg, #A6E391 144deg, #08D2ED 180deg, #7FDBA8 216deg, #F9FFD0 252deg, #77DAAD 288deg, #DCED71 324deg, #9AE486 360deg);',
      },
      colors: {
        'dark-turquoise': 'rgb(0, 198, 198)',
        'light-turquoise': 'rgb(123, 238, 217)',
        marine: 'rgb(0, 42, 91)',
        'hg-lime': '#DCED71',
        'light-cyan': 'rgb(157, 255, 255)',
        'denim-blue': 'rgb(123, 192, 238)',
        'astronaut-blue': 'rgb(0, 58, 91)',
        'sherpa-blue': '#064053',
        aqua: '#0FEAB5',
        'robin-egg-blue': '#9DF3FF',
        malachite: '#00E144',
        'deep-teal': '#00565B',
        'hg-gold': '#ffc700',
        'almost-black': 'rgb(0, 10, 12)',
        firefly: 'rgb(8, 44, 47)',
        supernova: '#FFC700',
      },
      boxShadow: {
        'loading-glow': '0px 0px 8px 2px rgba(100, 255, 236, 0.23)',
      },
      fontFamily: {
        sans: ['PPMonumentExtended', ...fontFamily.sans],
        serif: ['PPMonumentExtended', ...fontFamily.serif],
        tachyon: ['Tachyon'],
      },
      fontSize: {
        xs: '0.57rem',
        sm: '0.70rem',
        base: '0.85rem',
        xl: '1.2rem',
        '2xl': '1.563rem',
        '3xl': '1.953rem',
        '4xl': '2.441rem',
        '5xl': '3.052rem',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
