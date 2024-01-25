import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exec as execCb } from 'child_process';
import ffi from 'ffi-napi';
import ref from 'ref-napi';

const exec = (cmd: string) => new Promise<{ stdout: string, stderr: string }>((resolve) => execCb(cmd, (err, stdout, stderr) => resolve({ stdout, stderr })));


export const POST: RequestHandler = async ({ params }) =>
{
    const { app } = params;

    let count = 0;
    {
        const { stdout } = await exec('bin\\VirtualDesktop11-23H2.exe /Count');
        count = parseInt(stdout.replace(/[^0-9]/g, ''));
    }
    if (count === 0)
        return error(500, 'Virtual desktop not found');

    for (let i = 0; i < count; i++)
    {
        const { stdout } = await exec(`bin\\VirtualDesktop11-23H2.exe /ListWindowsOnDesktop:${i}`);
        const winHandleIds = stdout.split('\r\n')
            .filter((str) => /^\d+$/.test(str))
            .map((str) => parseInt(str));

        for (const winHandleId of winHandleIds)
        {
            const exeName = getExecutableNameFromHandle(winHandleId);
            console.log(exeName);
            if (exeName === app)
            {
                await exec(`bin\\VirtualDesktop11-23H2.exe /Switch:${i}`);
                return new Response();
            }
        }
    }
    await exec(app);

    return new Response();
};

function getExecutableNameFromHandle(handle: number): string | null
{
    // 関数のシグネチャを定義
    const lib = ffi.Library('lib\\get_exe_path.dll', {
        'get_exe_path': ['int', ['uint64', 'pointer']],
        'free_path': ['void', ['pointer']],
    });

    // HWND（または任意のuintptr_t値）を表す値
    const hwndValue = handle;
    const hwndBuffer = ref.alloc(ref.types.uint64, hwndValue);
    console.log(hwndValue);

    // 文字列のポインタを準備（例えば、結果を受け取るためのポインタ）
    const pathPtrPtr = ref.alloc('char **');

    // 関数を呼び出す
    if (!lib.get_exe_path(hwndBuffer.deref(), pathPtrPtr))
    {
        console.log('Failed to call get_exe_path');
        return null;
    }

    // 結果の文字列を取得（ここでは、戻り値がポインタの場合を想定）
    const path = ref.readCString(ref.readPointer(pathPtrPtr), 0);
    console.log('Executable Path:', path);

    // メモリの解放
    lib.free_path(pathPtrPtr.readPointer());

    return path;
}