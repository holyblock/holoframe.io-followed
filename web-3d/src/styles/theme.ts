import { extendTheme } from '@chakra-ui/react';

export const colors = {
  brand: {
    primary: '#DCED71',
    secondary: '#1E1F24',
    tertiary: '#34414B',
  },
  switch: {
    500: '#DCED71',
    200: '#DCED71',
  },
};

const sizes = {
  container: {
    xs: '340px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
};

const theme = extendTheme({
  fonts: {
    heading: 'Gustavo',
    body: 'TWK Lausanne',
  },
  components: {
    Button: {
      baseStyle: {
        fontFamily: 'Clash Grotesk',
        textTransform: 'uppercase',
        borderRadius: '5px',
      },
      variants: {
        link: {
          color: 'white',
          fontSize: '16px',
          _hover: {
            color: colors.brand.primary,
            textDecoration: 'none',
          },
        },
        outline: {
          color: 'white',
          padding: '17px 23px',
          letterSpacing: '3px',
          fontSize: '12px',
          fontWeight: '600px',
          _hover: {
            color: colors.brand.primary,
            borderColor: colors.brand.primary,
            backgroundColor: 'initial',
          },
        },
        solid: {
          color: 'black',
          padding: '17px 23px',
          letterSpacing: '3px',
          fontSize: '12px',
          fontWeight: '600px',
          _hover: {
            backgroundColor: colors.brand.primary,
            opacity: 0.9,
          },
        },
      },
    },
    MenuButton: {
      variants: {
        outline: {
          color: 'black',
          fontWeight: 'semibold',
          borderRadius: '0px',
          borderColor: 'black',
          borderWidth: '1px',
          padding: '22px',
          _hover: {
            bg: '#5D5FEF',
            color: 'white',
            boxShadow: 'none',
          },
        },
      },
    },
    Tag: {
      baseStyle: {
        borderRadius: '80px',
        fontFamily: 'Clash Grotesk',
        fontSize: '12px',
        fontWeight: '600px',
        textTransform: 'uppercase',
        padding: '13px 20px',
      },
    },
    Heading: {
      baseStyle: {
        color: 'white',
      },
    },
    Text: {
      baseStyle: {
        fontFamily: 'TWK Lausanne',
        color: 'white',
        lineHeight: '25px',
      },
    },
  },
  colors: colors,
  sizes: sizes,
  styles: {
    global: {
      body: {
        backgroundColor: colors.brand.secondary,
        color: 'white',
        borderRadius: '20px',
      },
    },
  },
});

export { theme };
