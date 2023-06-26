import { Server, WebSocket } from 'ws';

export const socketMap: { [nonce: string]: WebSocket } = {};

const wsServer = new Server({ noServer: true });

export default wsServer;
