import AWS from 'aws-sdk';
import { PutObjectRequest } from 'aws-sdk/clients/s3';
import { s3Bucket, s3AccessKey, s3SecretAccessKey } from '../../settings';

AWS.config.update({
  'credentials': {
    'accessKeyId': s3AccessKey!,
    'secretAccessKey': s3SecretAccessKey!,
  },
})

const s3 = new AWS.S3();

export async function uploadFileToS3(
  s3ObjKey: string,
  body: any,
  contentType: string
): Promise<string> {
  const params: PutObjectRequest = {
    Bucket: s3Bucket!,
    Key: s3ObjKey,
    Body: body,
    ContentEncoding: 'base64',
    ContentType: contentType, // e.g. image/png
    ACL: 'public-read',
    Metadata: {
      Date: `${Date.now()}`,
    }
  }
  try {
    await s3.upload(params).promise();
  } catch (err) {
    console.log('Error uploading S3', err);
    return err as string;
  }

  const s3URL = `https://${s3Bucket}.s3.amazonaws.com/${s3ObjKey}`;
  return s3URL;
}
