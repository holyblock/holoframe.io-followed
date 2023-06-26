import React, { useState } from 'react';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  Tag,
  Text
} from '@chakra-ui/react';
import AvatarPlacement from '../Customize/AvatarPlacement';
import { useStyle } from '../../contexts/StyleContext';
import { AvatarModel } from '../../types';
import { colors } from '../../styles/theme';

interface AvatarCustomizeProps {
  avatarModel: AvatarModel | null
  expressions?: Map<string, Array<object>>
  selectedExps: string[]
  setSelectedExps: (selectedExps: string[]) => void
}

const AvatarCustomize = (props: AvatarCustomizeProps) => {
  const {
    avatarModel,
    expressions,
    selectedExps,
    setSelectedExps
  } = props;
  const [mode, setMode] = useState('placement'); // placement, expressions
  const [currExps, setCurrExps] = useState(expressions ?? new Map());
  const { darkEnabled } = useStyle();

  const onSelectExps = (expName: string) => {
    if (selectedExps.includes(expName)) {
      setSelectedExps(selectedExps.filter(exp => exp !== expName));
    } else {
      setSelectedExps(selectedExps.concat(expName));
    }
  };

  const renderExpressions = Array.from(currExps.keys()).map((expName: string) => {
    const isSelected = selectedExps.includes(expName);
    return (
      <Tag
        key={expName}
        m={1}
        onClick={() => onSelectExps(expName)}
        bgColor={isSelected ? colors.brand.primary : 'transparent'}
        color={isSelected 
          ? darkEnabled ? 'black' : 'white'
          : darkEnabled ? 'white' : 'black'
        }
        outline={`1px solid ${darkEnabled ? 'white' : 'black'}`}
        _hover={{ 
          cursor: 'pointer',
          bgColor: colors.brand.primary,
          color: 'white'
        }}
      >
        {expName}
      </Tag>
    )
  });

  return (
    <Flex flexDir='column' alignItems='center' flexWrap='wrap'>
      { expressions && (
        <Breadcrumb 
          fontSize='sm'
          fontWeight='bold'
          mb='20px'
          separator=''
          spacing={4}
        >
          <BreadcrumbItem
            textDecoration={mode === 'placement' ? 'underline' : 'none'}
            color={mode === 'placement' 
              ? colors.brand.primary 
              : darkEnabled ? 'white' : 'black'
            }
            _hover={{
              textDecoration: 'none',
              color: colors.brand.primary
            }}
            textUnderlineOffset='6px'
          >
            <BreadcrumbLink 
              onClick={() => setMode('placement')}
            >
              Placement
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem
            textDecoration={mode === 'expressions' ? 'underline' : 'none'}
            color={mode === 'expressions' 
              ? colors.brand.primary
              : darkEnabled ? 'white' : 'black'}
            _hover={{
              textDecoration: 'none',
              color: colors.brand.primary
            }}
            textUnderlineOffset='6px'
          >
            <BreadcrumbLink
              onClick={() => setMode('expressions')}
            >
              Expressions
            </BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      )}
      { mode === 'placement' && (
        <AvatarPlacement avatarModel={avatarModel} />
      )}
      { mode === 'expressions' && (
        <Flex flexDir='row' justifyContent='center' flexWrap='wrap'>
          {renderExpressions}
        </Flex> 
      )}
    </Flex>
  );
};

export default AvatarCustomize;