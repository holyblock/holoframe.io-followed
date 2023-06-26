import { Request, Response } from 'express';

const healthCheck = (req: Request, res: Response) => {
  res.send('Hologram API Server');
};

export { healthCheck };
