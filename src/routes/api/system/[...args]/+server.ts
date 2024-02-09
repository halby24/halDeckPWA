import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as ffi from 'ffi-napi';
import { exec as execCb } from 'child_process';
const exec = (cmd: string) => new Promise<{ stdout: string, stderr: string }>((resolve, reject) => execCb(cmd, (err, stdout, stderr) => err ? reject({ stdout, stderr }) : resolve({ stdout, stderr })));

const dll = 'bin/cpplib.dll';
const lib = ffi.Library(dll, {
    'system_sleep': ['int', []],
    'system_shutdown': ['int', []],
    'system_restart': ['int', []],
    'display_off': ['int', []],
    'display_on': ['int', []],
});

export const POST: RequestHandler = async ({ params }) =>
{
    const { args } = params;

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