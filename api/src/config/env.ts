import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 8001,
  tokenProofAppId: process.env.TOKENPROOF_APP_ID,
  tokenProofApiKey: process.env.TOKENPROOF_API_KEY,
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
  googleProjectId: process.env.GOOGLE_PROJECT_ID,
  googleClientEmail: process.env.GOOGLE_CLIENT_EMAIL,
  googlePrivateKey: process.env.GOOGLE_PRIVATE_KEY
};
