import React from 'react';
import { 
  Flex,
  Tag
} from '@chakra-ui/react';
import { colors } from '../utils/theme';

const ExpressionSelect = (props) => {
  const {
    expressions,
    selectedExps,
    setSelectedExps
  } = props;

  const onSelectExps = (expName) => {
    if (selectedExps.includes(expName)) {
      setSelectedExps(selectedExps.filter(exp => exp !== expName));
    } else {
      setSelectedExps(selectedExps.concat(expName));
    }
  }

  const renderExpressions = expressions?.map((expName) => {
    const isSelected = selectedExps.includes(expName);
    return (
      <Tag
        key={expName}
        m={1}
        onClick={() => onSelectExps(expName)}
        bgColor={isSelected ? colors.brand.primary : 'transparent'}
        color={isSelected ? 'black' : 'white'}
        px={2}
        py={1}
        outline='1px solid white'
        _hover={{ 
          cursor: 'pointer',
          bgColor: colors.brand.primary,
          color: 'black'
        }}
      >
        {expName}
      </Tag>
    )
  })

  return (
    <Flex flexDir='row' alignItems='left' flexWrap='wrap'>
      { selectedExps && renderExpressions }
    </Flex>
  );
};

export default ExpressionSelect;