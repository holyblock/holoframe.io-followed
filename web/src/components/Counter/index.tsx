import { useState } from 'react';
import { Flex, Button, Text } from '@chakra-ui/react';
import { colors } from '../../styles/theme';

interface CounterProps {
  onChange: (value: number) => void;
  defaultValue: number;
  max?: number;
}

const Counter = (props: CounterProps) => {
  const { onChange, defaultValue, max } = props;
  const [value, setValue] = useState(defaultValue);

  const handleMinus = () => {
    onChange(Math.max(value - 1, 1));
    setValue((val) => Math.max(val - 1, 1));
  };

  const handlePlus = () => {
    let newValue = value + 1;
    if (max) {
      newValue = Math.min(newValue, max);
    }
    onChange(newValue);
    setValue((val) => val + 1);
  };

  return (
    <Flex alignItems="center">
      <Button
        disabled={value <= 1 ?? false}
        variant="ghost"
        _hover={{
          bgColor: "initial",
          color: colors.brand.primary,
        }}
        fontSize={30}
        onClick={handleMinus}
      >
        -
      </Button>
      <Text
        fontSize={30}
        fontWeight={700}
        fontFamily="Gustavo"
        textAlign="center"
        w="50px"
      >
        {value}
      </Text>
      <Button
        disabled={max ? value >= max : false}
        variant="ghost"
        _hover={{
          bgColor: "initial",
          color: colors.brand.primary,
        }}
        fontSize={30}
        marginTop="3px"
        onClick={handlePlus}
      >
        +
      </Button>
    </Flex>
  );
};

export default Counter;