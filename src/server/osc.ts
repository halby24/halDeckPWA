import fs from "fs";
import https from "https";
import { WebSocketServer } from "ws";
import { Server } from "node-osc";

const options = {
    key: fs.readFileSync("./certs/halby-desktop.local-key.pem"),
    cert: fs.readFileSync("./certs/halby-desktop.local.pem"),
};

const httpsServer = https.createServer(options, (req, res) =>
{
    res.writeHead(200)
    res.end('hello world\n')
});

const oscServer = new Server(9001, '0.0.0.0', () =>
{
    console.log('OSC Server is listening on port 9001');
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

httpsServer.listen(24001);