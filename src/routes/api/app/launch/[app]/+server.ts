import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exec as execCb } from 'child_process';

const exec = (cmd: string) => new Promise<{ stdout: string, stderr: string }>((resolve, reject) => execCb(cmd, (err, stdout, stderr) => err ? reject({ stdout, stderr }) : resolve({ stdout, stderr })));

export const POST: RequestHandler = async ({ params }) =>
{
    const { app } = params;

    await exec(`start ${app}.exe`).catch(() => { error(500, `Failed to launch ${app}.exe`); });

    return new Response();
};
