/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  jsconfigPaths: true,
  webpack: (config, options) => {
    config.externals.push({
      fs: 'require("fs")',
    });
    return config;
  },
  env: {
    MORALIS_APP_ID: process.env.MORALIS_APP_ID,
    MORALIS_SERVER_URL: process.env.MORALIS_SERVER_URL,
    ALTER_API_KEY: process.env.ALTER_API_KEY,
    INFURA_RPC_KEY: process.env.INFURA_RPC_KEY,
    ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
    AUTH_TOKEN_KEY: process.env.AUTH_TOKEN_KEY,
    HOLO_FACTORY_CONTRACT_ADDR_ETHEREUM:
      process.env.HOLO_FACTORY_CONTRACT_ADDR_ETHEREUM,
    HOLO_FACTORY_CONTRACT_ADDR_GOERLI:
      process.env.HOLO_FACTORY_CONTRACT_ADDR_GOERLI,
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
    AWS_S3_ACCESS_KEY: process.env.AWS_S3_ACCESS_KEY,
    AWS_S3_SECRET_ACCESS_KEY: process.env.AWS_S3_SECRET_ACCESS_KEY,
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
    MIXPANEL_TOKEN: process.env.MIXPANEL_TOKEN,
  },
};

module.exports = nextConfig;
