import { WebSocket } from "vite";
import { Server } from "node-osc";

const oscServer = new Server(9001, '127.0.0.1');
console.log('OSC Server is listening on port 9001');

const wss = new WebSocket.Server({ port: 24001 });
console.log('WebSocket Server is listening on port 24001');

wss.on('connection', (ws) =>
{
    console.log('WebSocket connection established');

    // oscServer.on('message', (msg) =>
    // {
    //     console.log(`Received OSC message: ${msg}`);
    //     ws.send(JSON.stringify(msg)); // OSCメッセージをクライアントに送信
    // });
});