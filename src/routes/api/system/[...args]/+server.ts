import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as ffi from 'ffi-napi';
import { exec as execCb } from 'child_process';
const exec = (cmd: string) => new Promise<{ stdout: string, stderr: string }>((resolve, reject) => execCb(cmd, (err, stdout, stderr) => err ? reject({ stdout, stderr }) : resolve({ stdout, stderr })));

const dll = 'bin/cpplib.dll';
const lib = ffi.Library(dll, {
    'system_sleep': ['void', []],
    'system_shutdown': ['void', []],
    'system_restart': ['void', []],
    'display_off': ['void', []],
    'display_on': ['void', []],
});

export const POST: RequestHandler = async ({ params }) =>
{
    const { args } = params;
    // const argsStr = args.split('/').join(' ');
    // await exec(`nircmd ${argsStr}`)
    //     .catch(({ stderr }) => { error(500, stderr) });

    switch (args)
    {
        case 'power/sleep':
            lib.system_sleep();
            break;
        case 'power/shutdown':
            lib.system_shutdown();
            break;
        case 'power/restart':
            lib.system_restart();
            break;
        case 'display/off':
            lib.display_off();
            break;
        case 'display/on':
            lib.display_on();
            break;
        default:
            throw error(400, 'invalid system action');
    }

    return new Response();
};