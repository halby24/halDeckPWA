import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exec as execCb } from 'child_process';
import { promisify } from 'util';
const exec = promisify(execCb);
import { Win32ffi } from 'win32-ffi';
import { VD_EXE } from '$env/static/private';

const { GetAsyncKeyState, GetForegroundWindow } = new Win32ffi().winFns();

export const POST: RequestHandler = async ({ params }) =>
{
    const { name } = params;

    try
    {
        await exec(`.\\bin\\${VD_EXE} /Switch:${name}`);
    }
    finally
    {
        return new Response();
    }
};

function isNowDragging(): boolean
{
    return GetAsyncKeyState(0x01) !== 0;
}

function moveWindow()
{
    const hWnd = GetForegroundWindow();
    
}