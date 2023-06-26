import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { Box, Fade } from "@chakra-ui/react";

import { faceKey } from "../../../../settings";
import { get3dModelUrl } from "../../../utils/assetHelper";

const StudioComponent = dynamic(
  () => import("../../../components/HologramStudio"),
  { ssr: false }
) as any;

// Character studio page for artists to view their models with face-tracking
const PartnerStudio = () => {
  const router = useRouter();
  const symbol = router.query.symbol as string | undefined;
  const id = router.query.id as string | undefined;

  if (!symbol || !id) return <></>;

  return (
    <Fade in={true}>
      <StudioComponent
        apiKey={faceKey!}
        nftMetadataList={[
          {
            name: "Pudgy Penguins",
            description: "Welcome!",
            type: "3d",
            format: "glb",
            image:
              "https://i.seadn.io/gcs/files/cdc10b4b1d41fb477899269dd39e2a55.png",
            model_url: get3dModelUrl(id, symbol, "v1", "glb"),
          },
        ]}
        trackingMode="face"
        selectDisplayMode="grid"
        disableBannerKey="rollingtech21"
        darkmodeEnabled
        size="xl"
        defaultModelSize={0.5}
        defaultBackgroundURL='https://hologramxyz.s3.amazonaws.com/backgrounds/background1.png'
      />
    </Fade>
  );
};

export default PartnerStudio;
