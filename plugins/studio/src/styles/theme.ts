import { color, extendTheme } from "@chakra-ui/react"

// 2. Extend the theme to include custom colors, fonts, etc
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
}

const theme = extendTheme({
  initialColorMode: 'light',
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
          color: 'black',
        },
        outline: {
          color: 'white',
          padding: '17px 23px',
          letterSpacing: '3px',
          fontSize: '12px',
          fontWeight: '600px',
          _hover: {
            color: '#DCED71',
            borderColor: colors.brand.primary,
            backgroundColor: 'initial'
          }
        },
        solid: {
          color: 'black',
          padding: '17px 23px',
          letterSpacing: '3px',
          fontSize: '12px',
          fontWeight: '600px',
          _hover: {
            backgroundColor: colors.brand.primary,
            color: 'black',
            opacity: 0.9
          }
        }
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
            boxShadow: 'none'
          }
        }
      },
    },
    Tag: {
      baseStyle: {
        borderRadius: '80px',
        fontFamily: 'Clash Grotesk',
        fontSize: '12px',
        fontWeight: '600px',
        textTransform: 'uppercase',
        padding: '13px 20px'
      }
    },
    Text: {
      baseStyle: {
        fontFamily: 'TWK Lausanne',
        color: 'white',
        lineHeight: '25px',
      }
    }
  },
  colors: colors,
  styles: {
    global: {
      body: {
      }
    }
  }
});

export { theme };