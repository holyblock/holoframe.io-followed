import { extendTheme } from "@chakra-ui/react"

export const colors = {
  brand: {
    primary: '#DCED71',
    secondary: '#171717',
    tertiary: '#18181B',
  },
  switch: {
    500: '#DCED71',
    200: '#DCED71',
  },
};

const theme = extendTheme({
  fonts: {
    heading: 'PPMonumentExtended',
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
          color: 'black',
          fontWeight: 'semibold',
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
            bg: colors.brand.primary,
            color: 'black',
            boxShadow: 'none',
          },
        },
      },
    },
    Switch: {
      baseStyle: {
        thumb: {
          bg: colors.brand.tertiary,
        },
        track: {
          _checked: {
            bg: colors.brand.primary,
          },
        },
      },
    },
  },
  colors: colors,
  styles: {
    global: {
      body: {
        backgroundColor: colors.brand.secondary,
        color: 'white',
      },
    },
  }
});

export { theme };