import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exec as execCb } from 'child_process';
import { VD_EXE } from '$env/static/private';
import * as ffi from 'ffi-napi';
import * as ref from 'ref-napi';

const dll = 'bin/cpplib.dll';
const lib = ffi.Library(dll, {
    'get_exe_path': ['int', ['uint64', 'pointer', 'size_t']],
});

const execAllSuccess = (cmd: string) => new Promise<{ stdout: string, stderr: string }>((resolve) => execCb(cmd, (err, stdout, stderr) => resolve({ stdout, stderr })));
const exec = (cmd: string) => new Promise<{ stdout: string, stderr: string }>((resolve, reject) => execCb(cmd, (err, stdout, stderr) => err ? reject({ stdout, stderr }) : resolve({ stdout, stderr })));

export const POST: RequestHandler = async ({ params }) =>
{
    const { app } = params;

    let count = 0;
    {
        const { stdout } = await execAllSuccess(`bin\\${VD_EXE} /Count`);
        count = parseInt(stdout.replace(/[^0-9]/g, ''));
    }
    if (count === 0)
        return error(500, 'Virtual desktop not found');

    const handles = (await Promise.allSettled(Array.from(Array(count).keys())
        .map((i) => execAllSuccess(`bin\\${VD_EXE} /ListWindowsOnDesktop:${i}`))))
        .filter((res) => res.status === 'fulfilled')
        .map((res) => (res as PromiseFulfilledResult<{ stdout: string, stderr: string }>).value) // 成功したやつだけ取り出す
        .map(({ stdout }, index) => stdout.split('\r\n')
            .filter((str) => /^\d+$/.test(str))
            .map((str) => parseInt(str))
            .map((handle) => ({ index, handle }))) // ハンドルとデスクトップ番号を紐付ける
        .flatMap((arr) => arr); // 二次元配列を一次元配列にする

    const exes = (await Promise.allSettled(handles.map(async ({ index, handle }) =>
    {
        const exeName = getExecutableNameFromHandle(handle); // ハンドルから実行ファイル名を取得する
        return { index, exeName };
    }))).filter((res) => res.status === 'fulfilled')
        .map((res) => (res as PromiseFulfilledResult<{ index: number, exeName: string | null }>).value) // 成功したやつだけ取り出す

    for (const { index, exeName } of exes)
    {
        console.log('exeName: ' + exeName);
        if (exeName === `${app}.exe`)
        {
            await execAllSuccess(`bin\\${VD_EXE} /Switch:${index}`);
            return new Response();
        }
    }

    await exec(`start ${app}.exe`).catch(() => { error(500, `Failed to launch ${app}.exe`); });

    return new Response();
};

function getExecutableNameFromHandle(handle: number): string | null
{
    const size = 1024;
    const buffer = Buffer.alloc(size);
    const result = lib.get_exe_path(handle, buffer, size);
    if (result === 0)
        return null;
    let exePath = ref.readCString(buffer, 0);
    exePath = exePath.replace(/[\r\n]/g, '');
    if (exePath === '')
        return null;
    const exeName = exePath.split('\\').pop();
    if (exeName === undefined)
        return null;
    return exeName;
}