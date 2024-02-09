import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as ffi from 'ffi-napi';
import { exec as execCb } from 'child_process';
const exec = (cmd: string) => new Promise<{ stdout: string, stderr: string }>((resolve, reject) => execCb(cmd, (err, stdout, stderr) => err ? reject({ stdout, stderr }) : resolve({ stdout, stderr })));

const dll = 'bin/cpplib.dll';
const lib = ffi.Library(dll, {
    'set_volume': ['int', ['float']]
});

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

    lib.set_volume(volume);

    return new Response();
};