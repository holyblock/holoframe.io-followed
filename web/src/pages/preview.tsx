import { useEffect } from 'react';
import { useRouter } from 'next/router';

const Preview = () => {
  const router = useRouter();
  useEffect(() => {
    router.push('/studio');
  })
  return (
    < div/>
  );
};

export default Preview;