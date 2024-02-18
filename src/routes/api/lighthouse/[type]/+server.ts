import { error } from '@sveltejs/kit';
import type { RequestHandler } from '../$types';
import { exec as execCb } from 'child_process';
import { LIGHTHOUSE_PATH, LIGHTHOUSE_MAC } from '$env/static/private';

const exec = (cmd: string) => new Promise<{ stdout: string, stderr: string }>((resolve, reject) => execCb(cmd, (err, stdout, stderr) => err ? reject({ stdout, stderr }) : resolve({ stdout, stderr })));

export const POST: RequestHandler = async ({ params }) =>
{
    const { type } = params;
    const cmdBase = `python ${LIGHTHOUSE_PATH} ${type}`;
    const macs = LIGHTHOUSE_MAC.split(',');
    const cmds = macs.map(mac => exec(`${cmdBase} ${mac}`));

    await Promise.allSettled(cmds)
        .catch(() => { error(500, `Failed to exec commands.`); });

    return new Response();
};