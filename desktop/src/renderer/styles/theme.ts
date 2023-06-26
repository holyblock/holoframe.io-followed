import { extendTheme, createMultiStyleConfigHelpers } from '@chakra-ui/react';
import { tabsAnatomy } from '@chakra-ui/anatomy';

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(tabsAnatomy.keys);

// define the base component styles
const baseStyle = definePartsStyle({
  // define the part you're going to style
  tab: {
    fontFamily: 'Clash Grotesk',
    textTransform: 'uppercase',
    letterSpacing: '3px',
    fontWeight: '600px',
    fontSize: '14px',
  },
  tablist: {
    fontSize: '14px',
  },
});
// export the component theme
const tabsTheme = defineMultiStyleConfig({ baseStyle });

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
  progress: {
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
            color: 'black',
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
    Progress: {
      baseStyle: {
        track: {
          bg: '#FFFFFF20',
        },
        filledTrack: {
          bg: colors.brand.primary,
        },
      },
    },
    Tabs: tabsTheme,
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
    Heading: {},
    Text: {
      baseStyle: {
        fontFamily: 'TWK Lausanne',
        color: 'white',
        lineHeight: '25px',
      },
    },
  },
  colors,
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
