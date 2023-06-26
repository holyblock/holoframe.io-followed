import { useProgress, Html } from '@react-three/drei';
import { Progress } from '@chakra-ui/react';

const Loader = () => {
  const { progress } = useProgress();
  // return <Progress value={progress} />
  return <Html center>{progress} % loaded</Html>;
};

export default Loader;
