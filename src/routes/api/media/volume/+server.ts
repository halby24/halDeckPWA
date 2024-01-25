import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Client } from 'node-osc';
import { OS, OSC_CLIENT_PORT } from '$env/static/private';

export const POST: RequestHandler = async ({ request }) =>
{
    const reqBody = await request.json();
    if (!reqBody)
    {
        throw error(400, 'no request body');
    }
    if (!reqBody.volume)
    {
        throw error(400, 'no volume value');
    }
    if (typeof reqBody.volume !== 'number')
    {
        throw error(422, 'volume value is not a number');
    }

    const volume = reqBody.volume as number;
    if (volume < 0 || volume > 1)
    {
        throw error(422, 'volume value is not between 0 and 1');
    }

    const client = new Client('localhost', Number(OSC_CLIENT_PORT));
    await new Promise<void>((resolve, reject) => client.send('/1/mastervolume', volume, err => err ? reject(err) : resolve()))
        .catch(err => { throw error(500, err); });
    client.close();

    return new Response(JSON.stringify({ ok: true, message: 'success!' }),);
};