import { Flex } from "@chakra-ui/react";
import Head from "next/head";
import AppNavigationBar from "../../components/NavigationBar/AppNavigationBar";
import AppFooter from "../../components/NavigationFooter/AppFooter";

const Post = ({ title, description, image, video, player, format }) => {
  return (
    <Flex justifyContent="center">
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:site_name" content="Hologram" />
        <meta property="og:url" content={video} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:video:url" content={video} />
        <meta property="og:video:secure_url" content={video} />
        <meta property="og:image content={image}" />
        <meta name="twitter:card" content={format === "mp4" ? "player" : "summary_large_image"} />
        <meta name="twitter:site" content="@hologramlabs" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
        <meta name="twitter:player" content={player} />
        <meta name="twitter:player:width" content="1280" />
        <meta name="twitter:player:height" content="720" />
      </Head>
      <AppNavigationBar />
      <Flex
        h="100vh"
        w="100vw"
        alignItems={[null, "center"]}
        justifyContent="center"
        maxW="container.lg"
      >
        {format === "mp4" && (
          <video
            controls
            autoPlay
          >
            <source src={video} />
          </video>
        )}
        {format === "gif" && (
          <img src={video} alt="hologram" />
        )}
        {format === "png" && (
          <img src={image} alt="hologram" />
        )}
      </Flex>
      <AppFooter />
    </Flex>
  );
};

export async function getServerSideProps(context) {
  const { id } = context.params;
  const { format } = context.query;

  return {
    props: {
      title: "Become your digital self",
      description:
        "Bring your brand or community to life. Create unforgettable moments with others on any social, gaming, or conferencing platform.",
      video: `https://hologramxyz.s3.amazonaws.com/post/${id}.${format}`,
      image: `https://hologramxyz.s3.amazonaws.com/post/${id}.png`,
      player: `https://hologramxyz.s3.amazonaws.com/post/${id}.${format}`,
      format,
    },
  };
}

export default Post;
