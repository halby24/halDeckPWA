import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exec as execCb } from 'child_process';

const execAllSuccess = (cmd: string) => new Promise<{ stdout: string, stderr: string }>((resolve) => execCb(cmd, (err, stdout, stderr) => resolve({ stdout, stderr })));
const exec = (cmd: string) => new Promise<{ stdout: string, stderr: string }>((resolve, reject) => execCb(cmd, (err, stdout, stderr) => err ? reject({ stdout, stderr }) : resolve({ stdout, stderr })));

export const POST: RequestHandler = async ({ params }) =>
{
    const { app } = params;

    let count = 0;
    {
        const { stdout } = await execAllSuccess('bin\\VirtualDesktop11-23H2.exe /Count');
        count = parseInt(stdout.replace(/[^0-9]/g, ''));
    }
    if (count === 0)
        return error(500, 'Virtual desktop not found');

    const handles = (await Promise.allSettled(Array.from(Array(count).keys())
        .map((i) => execAllSuccess(`bin\\VirtualDesktop11-23H2.exe /ListWindowsOnDesktop:${i}`))))
        .filter((res) => res.status === 'fulfilled')
        .map((res) => (res as PromiseFulfilledResult<{ stdout: string, stderr: string }>).value) // 成功したやつだけ取り出す
        .map(({ stdout }, index) => stdout.split('\r\n')
            .filter((str) => /^\d+$/.test(str))
            .map((str) => parseInt(str))
            .map((handle) => ({ index, handle }))) // ハンドルとデスクトップ番号を紐付ける
        .flatMap((arr) => arr); // 二次元配列を一次元配列にする

    const exes = (await Promise.allSettled(handles.map(async ({ index, handle }) =>
    {
        const exeName = await getExecutableNameFromHandle(handle); // ハンドルから実行ファイル名を取得する
        return { index, exeName };
    }))).filter((res) => res.status === 'fulfilled')
        .map((res) => (res as PromiseFulfilledResult<{ index: number, exeName: string | null }>).value) // 成功したやつだけ取り出す

    for (const { index, exeName } of exes)
    {
        console.log('exeName: ' + exeName);
        if (exeName === `${app}.exe`)
        {
            await execAllSuccess(`bin\\VirtualDesktop11-23H2.exe /Switch:${index}`);
            return new Response();
        }
    }

    await exec(`start ${app}.exe`).catch(() => { error(500, `Failed to launch ${app}.exe`); });

    return new Response();
};

async function getExecutableNameFromHandle(handle: number): Promise<string | null>
{
    const { stdout } = await exec(`bin\\get_exe_path.exe ${handle}`)
        .catch(({ stdout, stderr }) => { console.error(stderr); return { stdout }; });
    const exePath = stdout.replace(/[\r\n]/g, '');
    if (exePath === '')
        return null;
    const exeName = exePath.split('\\').pop();
    if (exeName === undefined)
        return null;
    return exeName;
}