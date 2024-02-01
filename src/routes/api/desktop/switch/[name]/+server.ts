import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exec as execCb } from 'child_process';
import { promisify } from 'util';
import { VIRTUALDESKTOP_EXE } from '$env/static/private';

const exec = promisify(execCb);

export const POST: RequestHandler = async ({ params }) =>
{
    const { name } = params;

    try {
        await exec(`.\\bin\\${VIRTUALDESKTOP_EXE} /Switch:${name}`);
    }
    finally {
        return new Response();
    }
};
