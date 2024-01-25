import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exec as execCb } from 'child_process';
// import { promisify } from 'util';
// import activeWindow from 'active-win';
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
            const exeName = await getExecutableNameFromHandle(winHandleId);
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

// Windows API関数の定義
const user32 = ffi.Library('user32', {
    'GetWindowThreadProcessId': ['uint32', ['pointer', 'pointer']],
});

const kernel32 = ffi.Library('kernel32', {
    'OpenProcess': ['pointer', ['uint32', 'int', 'uint32']],
    'QueryFullProcessImageNameA': ['int', ['pointer', 'uint32', 'pointer', 'pointer']],
    'CloseHandle': ['int', ['pointer']],
});

// プロセスアクセス権
const PROCESS_QUERY_INFORMATION: number = 0x0400;
const PROCESS_VM_READ: number = 0x0010;

// 実行ファイル名を取得する関数
function getExecutableNameFromHandle(windowHandle: number): Promise<string>
{
    return new Promise((resolve, reject) =>
    {
        const hwnd = ref.alloc('pointer', ref.NULL);
        hwnd.writeInt32LE(windowHandle, 0);

        const pid = ref.alloc('uint32');
        user32.GetWindowThreadProcessId(hwnd, pid);

        const processHandle = kernel32.OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, false, pid.deref());

        if (!processHandle.isNull())
        {
            const bufferSize: number = 1024;
            const buffer: Buffer = Buffer.alloc(bufferSize);
            const bufferSizeRef = ref.alloc('uint32', bufferSize);

            if (kernel32.QueryFullProcessImageNameA(processHandle, 0, buffer, bufferSizeRef))
            {
                const exeName: string = buffer.toString('utf-8').replace(/\0+$/, '');
                kernel32.CloseHandle(processHandle);
                resolve(exeName);
            } else
            {
                kernel32.CloseHandle(processHandle);
                reject(new Error('Failed to retrieve process name.'));
            }
        } else
        {
            reject(new Error('Failed to open process.'));
        }
    });
}