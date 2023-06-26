import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express } from 'express';

import * as ffmpeg from './lib/ffmpeg';
import wsServer, { socketMap } from './lib/socket';

import routes from './routes';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use(cors());
app.use(routes);

wsServer.on('connection', socket => {
  socket.on('message', message => {
    try {
      const { type, data } = JSON.parse(message.toString());
      if (type === 'ack-nonce') {
        const { nonce } = data;
        socketMap[nonce] = socket;
      }
    } catch (err) {
      console.log(err);
    }
  });
});

const server = app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, client => {
    wsServer.emit('connection', client, request);
  });
});
