import axios from 'axios';
import { Request, Response } from 'express';

import { socketMap } from '../lib/socket';

const tokenProof = async (req: Request, res: Response) => {
  const appId = process.env.TOKENPROOF_APP_ID;
  const apiKey = process.env.TOKENPROOF_API_KEY;
  const { nonce } = req.body;
  try {
    const { data } = await axios.post(
      `https://auth.tokenproof.xyz/v1/simple/${appId}`,
      {
        nonce,
        webhook: 'https://api.hologram.xyz/auth/tokenproof/callback'
      },
      {
        headers: {
          'X-API-Key': apiKey ?? ''
        }
      }
    );
    return res.json(data);
  } catch (err) {
    console.log(err);
    return res.sendStatus(400);
  }
};

const tokenProofCallback = (req: Request, res: Response) => {
  const { nonce } = req.body;
  const socket = socketMap[nonce];
  if (socket) {
    socket.send(
      JSON.stringify({
        type: 'auth',
        data: req.body
      })
    );
  }
  return res.sendStatus(200);
};

export { tokenProof, tokenProofCallback };
