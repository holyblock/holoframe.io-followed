// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next';
import { uploadFileToS3 } from '../../../utils/s3Client';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '8mb' // Set desired value here
    }
  }
}

// Upload image file to s3
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const account: string = req.body.account;
  const cid: string = req.body.cid;
  const filename: string = req.body.filename;
  const result: string = req.body.result;
  const contentType: string = req.body.contentType;

  const buf = Buffer.from(result.replace(/^data:image\/\w+;base64,/, ''), 'base64');

  if (req.method === 'POST') {
    const s3Key = `creator/${account}/collections/${cid}/images/${filename}`;
    const s3URL = await uploadFileToS3(s3Key, buf, contentType);
    res.status(200).send({ status: 'Success', imageURL: s3URL });
  };
}