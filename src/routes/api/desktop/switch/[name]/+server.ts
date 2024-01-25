import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exec as execCb } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execCb);

export const POST: RequestHandler = async ({ params }) =>
{
    const { name } = params;

    try {
        await exec(`.\\bin\\VirtualDesktop11-23H2.exe /Switch:${name}`);
    }
    finally {
        return new Response();
    }
};
