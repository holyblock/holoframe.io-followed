import { 
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Container,
  Divider,
  Heading,
} from "@chakra-ui/react";

const faqData = [
  {
    question: "Wen mint?",
    answer: "The mint will start on 11/14/2022 at 1pm PST."
  },
  {
    question: "Wen reveal?",
    answer: "Random reveal will happen at 1pm PST, November 16, 2022. Each minted jersey will be randomly assigned to a team."
  },
  {
    question: "What can I do with my jerseys?",
    answer: "All Hologram World Cup Jersey NFTs are wearables you can use across all of your 3D hologram characters on AR/VR, video calls, games, and metaverse worlds. The jerseys of the winning teams will have a chance to be allowlisted for the Hologram Season Pass."
  },
  {
    question: "How many can I mint?",
    answer: "For home jerseys, each wallet can mint or claim (if whitelisted) at most 1. For away jerseys, each wallet can mint at most 10."
  },
  {
    question: "What’s the difference between Home & Away Jerseys?",
    answer: "Both Jerseys are digital wearables that you can wear on your 3D Holograms. Home jerseys are free-mints but aren’t elligible for the prize pool. while away jerseys are paid-mints (0.04 ETH) that enter you into the prize pool."
  },
  {
    question: "How can owners be allowlisted for Hologram Season Pass?",
    answer: "Within 12 hours of each match, we will randomly select 10% of the winning team jersey holder addresses. For the top 8 teams, we will randomly select 25% of holder addresses within 12 hours of match results. For the championship team, we will select all the addresses. Additionally, whenever a jersey number scores a goal, we select its holder address. The same address can be selected multiple times."
  },
  {
    question: "What is Hologram?",
    answer: "Hologram is a self-expression primitive for the open metaverse, enabling you to become your favorite PFP characters, flex your wearables, and create unforgettable moments on any video or gaming platform with a few clicks. "
  },
];

const FAQs = () => {
  const renderFAQs = faqData.map((faq) => {
    return (
      <AccordionItem
        key={faq.question}
        border="none"
        borderBottom="1px solid #8E8E8E"
        py="20px"
        w='100%'
      >
        <AccordionButton
          paddingInlineStart={0}
          paddingInlineEnd={0}
          _focus={{ boxShadow: "none" }}
          w='100%'
          display="flex"
          justifyContent="space-between"
        >
          <Heading fontSize='xl' fontFamily="Gustavo">
            {faq.question}
          </Heading>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel paddingInlineStart={0} paddingInlineEnd={0}>
          {faq.answer}
        </AccordionPanel>
      </AccordionItem>
    )
  });

  return (
    <Container
      display='flex'
      alignItems="center"
      justifyContent="center"
      flexDir="column"
      pb={["400px", null, "150px"]}
      maxW='container.lg'
    >
      <Divider mb="70px"/>
      <Heading
        as="h2"
        fontSize={["36px", "48px", "64px", "72px"]}
        mb="70px"
        textAlign="center"
      >
        Have Questions?
      </Heading>
      <Accordion w='100%' allowMultiple>
        {renderFAQs}
      </Accordion>
    </Container>
  );
};

export default FAQs;