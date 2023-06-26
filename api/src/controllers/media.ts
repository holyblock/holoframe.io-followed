import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { BUCKET_NAME } from '../config/s3';

import db from '../lib/db';
import { ffmpegQueue, getFFmpeg } from '../lib/ffmpeg';
import s3 from '../lib/s3';

const collection = db.collection('Posts');

// TODO: Post Model
const savePost = async (post: any) => {
  try {
    const doc = await collection.add(post);
    return doc.id;
  } catch (err) {
    console.log(err);
  }
  return null;
};

const uploadGif = async (req: Request, res: Response) => {
  try {
    const videoData = req.file?.buffer;
    const userAddress = req.body.userAddress ?? '';
    const metadata = JSON.parse(req.body.metadata ?? '{}');
    if (!videoData) return res.end();

    const ffmpeg = await getFFmpeg();

    const inputFileName = uuidv4();
    const output = uuidv4();
    const outputFileName = `${output}.gif`;
    const thumbnailFileName = `${output}.png`;
    let outputData: Uint8Array | null = null;
    let thumbnailData: Uint8Array | null = null;

    await ffmpegQueue.add(async () => {
      ffmpeg.FS('writeFile', inputFileName, videoData);

      await ffmpeg.run('-i', inputFileName, '-vsync', '0', outputFileName);
      await ffmpeg.run('-i', inputFileName, '-ss', '00:00:01.000', '-vframes', '1', thumbnailFileName);

      outputData = ffmpeg.FS('readFile', outputFileName);
      thumbnailData = ffmpeg.FS('readFile', thumbnailFileName);
      ffmpeg.FS('unlink', inputFileName);
      ffmpeg.FS('unlink', outputFileName);
      ffmpeg.FS('unlink', thumbnailFileName);
    });

    if (!outputData || !thumbnailData) return res.sendStatus(500);

    await s3
      .upload({
        Bucket: BUCKET_NAME,
        Key: `post/${thumbnailFileName}`,
        Body: thumbnailData,
        ACL: 'public-read',
        ContentType: 'image/png'
      })
      .promise();

    await s3
      .upload({
        Bucket: BUCKET_NAME,
        Key: `post/${outputFileName}`,
        Body: outputData,
        ACL: 'public-read',
        ContentType: 'image/gif'
      })
      .promise();

    await savePost({
      userAddress,
      uuid: outputFileName.split('.')[0],
      format: 'gif',
      uploadedAt: Date.now(),
      metadata
    });

    res.writeHead(200, {
      'Access-Control-Expose-Headers': 'Content-Disposition',
      'Content-Type': 'image/gif',
      'Content-Disposition': `attachment;filename=${outputFileName}`,
      'Content-Length': (outputData as Uint8Array).length
    });

    return res.end(Buffer.from(outputData, 'binary'));
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const convertGifToVideo = async (req: Request, res: Response) => {
  try {
    const videoData = req.file?.buffer;
    if (!videoData) return res.end();

    const ffmpeg = await getFFmpeg();

    const inputFileName = uuidv4();
    const output = uuidv4();
    const outputFileName = `${output}.mp4`;
    const thumbnailFileName = `${output}.png`;
    let outputData: Uint8Array | null = null;
    let thumbnailData: Uint8Array | null = null;

    await ffmpegQueue.add(async () => {
      ffmpeg.FS('writeFile', inputFileName, videoData);

      await ffmpeg.run('-i', inputFileName, '-vsync', '0', '-filter:v', 'scale=1280:-1', outputFileName);
      await ffmpeg.run('-i', inputFileName, '-ss', '00:00:01.000', '-vframes', '1', thumbnailFileName);

      outputData = ffmpeg.FS('readFile', outputFileName);
      thumbnailData = ffmpeg.FS('readFile', thumbnailFileName);
      ffmpeg.FS('unlink', inputFileName);
      ffmpeg.FS('unlink', outputFileName);
      ffmpeg.FS('unlink', thumbnailFileName);
    });

    if (!outputData || !thumbnailData) return res.sendStatus(500);

    res.writeHead(200, {
      'Access-Control-Expose-Headers': 'Content-Disposition',
      'Content-Type': 'video/mp4',
      'Content-Disposition': `attachment;filename=${outputFileName}`,
      'Content-Length': (outputData as Uint8Array).length
    });

    return res.end(Buffer.from(outputData, 'binary'));
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

const uploadImage = async (req: Request, res: Response) => {
  const imageData = req.file?.buffer;
  const userAddress = req.body.userAddress ?? '';
  const metadata = JSON.parse(req.body.metadata ?? '{}');
  const imageFileName = `${uuidv4()}.png`;

  await s3
    .upload({
      Bucket: BUCKET_NAME,
      Key: `post/${imageFileName}`,
      Body: imageData,
      ACL: 'public-read',
      ContentType: 'image/png'
    })
    .promise();

  await savePost({
    userAddress,
    uuid: imageFileName.split('.')[0],
    format: 'png',
    uploadedAt: Date.now(),
    metadata
  });

  res.writeHead(200, {
    'Access-Control-Expose-Headers': 'Content-Disposition',
    'Content-Type': 'image/png',
    'Content-Disposition': `attachment;filename=${imageFileName}`,
    'Content-Length': (imageData as Uint8Array).length
  });

  return res.end(imageData);
};

const upload = async (req: Request, res: Response) => {
  try {
    const videoData = req.file?.buffer;
    const userAddress = req.body.userAddress ?? '';
    const metadata = JSON.parse(req.body.metadata ?? '{}');
    if (!videoData) return res.end();

    const ffmpeg = await getFFmpeg();

    const inputFileName = uuidv4();
    const output = uuidv4();
    const outputFileName = `${output}.mp4`;
    const thumbnailFileName = `${output}.png`;
    let outputData: Uint8Array | null = null;
    let thumbnailData: Uint8Array | null = null;

    await ffmpegQueue.add(async () => {
      ffmpeg.FS('writeFile', inputFileName, videoData);

      await ffmpeg.run('-i', inputFileName, '-vsync', '0', outputFileName);
      await ffmpeg.run('-i', inputFileName, '-ss', '00:00:01.000', '-vframes', '1', thumbnailFileName);

      outputData = ffmpeg.FS('readFile', outputFileName);
      thumbnailData = ffmpeg.FS('readFile', thumbnailFileName);
      ffmpeg.FS('unlink', inputFileName);
      ffmpeg.FS('unlink', outputFileName);
      ffmpeg.FS('unlink', thumbnailFileName);
    });

    if (!outputData || !thumbnailData) return res.sendStatus(500);

    await s3
      .upload({
        Bucket: BUCKET_NAME,
        Key: `post/${thumbnailFileName}`,
        Body: thumbnailData,
        ACL: 'public-read',
        ContentType: 'image/png'
      })
      .promise();

    await s3
      .upload({
        Bucket: BUCKET_NAME,
        Key: `post/${outputFileName}`,
        Body: outputData,
        ACL: 'public-read',
        ContentType: 'video/mp4'
      })
      .promise();

    await savePost({
      userAddress,
      uuid: outputFileName.split('.')[0],
      format: 'mp4',
      uploadedAt: Date.now(),
      metadata
    });

    res.writeHead(200, {
      'Access-Control-Expose-Headers': 'Content-Disposition',
      'Content-Type': 'video/mp4',
      'Content-Disposition': `attachment;filename=${outputFileName}`,
      'Content-Length': (outputData as Uint8Array).length
    });

    return res.end(Buffer.from(outputData, 'binary'));
  } catch (error) {
    console.error(error);
    return res.sendStatus(500);
  }
};

export { upload, uploadImage, uploadGif, convertGifToVideo };
