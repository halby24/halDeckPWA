import fs from "fs";
import https from "https";
import { WebSocketServer } from "ws";
import { Server } from "node-osc";

const options = {
    key: fs.readFileSync(process.env.KEY_PATH as string),
    cert: fs.readFileSync(process.env.CERT_PATH as string),
};

const httpsServer = https.createServer(options, (req, res) =>
{
    res.writeHead(200)
    res.end('hello world\n')
});

const oscServerPort = Number(process.env.OSC_SERVER_PORT);
const oscServer = new Server(oscServerPort, '0.0.0.0', () =>
{
    console.log(`OSC Server is listening on port ${oscServerPort}`);
});

const wss = new WebSocketServer({ server: httpsServer });
console.log('WebSocket Server is listening on port 24001');

// oscServer.on('bundle', function (bundle) {
//     bundle.elements.forEach((element) => {
//       console.log(`Message: ${element}`);
//     });
// });

wss.on('connection', (ws) =>
{
    console.log('WebSocket connection established');

    oscServer.on('bundle', function (bundle)
    {
        bundle.elements.forEach((element) =>
        {
            const [msg, arg] = element as unknown as [string, number];
            ws.send(JSON.stringify({ msg, arg }));
        });
    });
});

wss.on('close', () =>
{
    console.log('WebSocket connection closed');
});

httpsServer.listen(process.env.PUBLIC_WSS_PORT as string);