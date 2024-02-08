import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exec as execCb } from 'child_process';
import { promisify } from 'util';
import activeWindow from 'active-win';
import { VD_EXE } from '$env/static/private';

const exec = promisify(execCb);

export const POST: RequestHandler = async () =>
{
    try
    {
        const awInfo = await activeWindow();
        if (!awInfo)
            return error(500, 'Active window not found' );
        const id = awInfo.id;
        if (!id)
            return error(500, 'Active window id not found' );
        await exec(`.\\bin\\${VD_EXE} /UnPinWindowHandle:${id}`);
    }
    finally
    {
        return new Response();
    }
};