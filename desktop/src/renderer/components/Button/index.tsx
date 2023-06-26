import { Button } from '@chakra-ui/react';

const DEFAULT_COLOR = 'transparent';

interface CustomButtonProps {
  icon?: any;
  text?: string | React.ReactNode;
  size?: string;
  height?: string | number;
  variant?: string;
  color?: string;
  secondaryColor?: string;
  textColor?: string;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
}

const CustomButton = (props: CustomButtonProps) => {
  const {
    icon,
    text,
    size,
    height,
    variant,
    color,
    secondaryColor,
    textColor,
    onClick,
    selected,
    disabled,
  } = props;
  const primaryColor = color || DEFAULT_COLOR;

  return (
    <Button
      backgroundColor={primaryColor}
      colorScheme={primaryColor}
      color={textColor}
      bg={selected && secondaryColor}
      borderColor={selected && secondaryColor}
      isActive={selected}
      _active={{
        style: {
          bg: secondaryColor,
        },
      }}
      size={size}
      width="100%"
      height={height}
      variant={variant || 'solid'}
      onClick={onClick}
      leftIcon={icon}
      disabled={disabled}
    >
      {text}
    </Button>
  );
};

export default CustomButton;
