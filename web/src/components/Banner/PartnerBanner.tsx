import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Box, Heading, VStack } from '@chakra-ui/react';

const partners: any = {
  'penguin': 'Pudgy Penguins',
  'deadfellaz': 'Deadfellaz',
  'coolcats': 'Cool Cats',
  'anata': 'Anata NFT',
  'milady': 'Milady Maker',
  'cryptocoven': 'Crypto Coven',
  'chainrunners': 'Chain Runners',
}

// Render all partnership projects for landing page
const PartnerBanner = () => {
  const [selectedPartner, setSelectedPartner] = useState('penguin');
  const [partnerImg, setPartnerImg] = useState('');
  useEffect(() => {
    setPartnerImg(`/media/partners/${selectedPartner}.png`);
  }, [selectedPartner]);

  const renderPartner = Object.keys(partners).map((k) => {
    return (
      <Heading
        key={k}
        mt='0px !important'
        lineHeight={['44px', '55px', null, '108px']}
        opacity={[
          1,
          1,
          1,
          selectedPartner === k ? 1 : 0.28
        ]}
        color={[
          '#E6F29B',
          null,
          null,
          selectedPartner === k ? '#E6F29B' : 'white'
        ]}
        fontSize={['40px', '40px', '65px', '120px']}
        fontWeight='700'
        textTransform='uppercase'
        _hover={{
          cursor: 'pointer',
          color: '#E6F29B',
          opacity: 1
        }}
        onClick={() => setSelectedPartner(k)}
      >
        {partners[k]}
      </Heading>
    )
  })

  return (
    <>
      { partnerImg &&
        <Box
          display={['none', 'none', 'none', 'initial']}
          pos='absolute'
          transform='rotate(9.05deg)'
          right='80px'
          bottom='300px'
          zIndex={99}
        >
          <Image
            src={partnerImg}
            width='300px'
            height='300px'
            alt='partner'
          />
        </Box>
      }
      <VStack
        display='flex'
        pt='10px'
        pb='150px'
        textAlign='center'
        flexDir='column'
      >
        { renderPartner }
      </VStack>
    </>
  );
};

export default PartnerBanner;
