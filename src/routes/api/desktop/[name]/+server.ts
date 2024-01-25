import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getVirtualDesktops } from '$lib/get-virtual-desktops';
import robot from 'robotjs';

export const POST: RequestHandler = async ({ params }) =>
{
    const { name } = params;

    const desktops = await getVirtualDesktops();
    if (!desktops) return error(500, 'Cannot get virtual desktops');

    console.log(desktops);
    const currentIndex = desktops.desktops.findIndex(d => d.id === desktops.current);
    const targetIndex = desktops.desktops.findIndex(d => d.name === name);
    if (currentIndex < 0) return error(500, 'Cannot get current desktop');
    if (targetIndex < 0) return error(500, 'Cannot get target desktop');

    const diff = targetIndex - currentIndex;
    const diffAbs = Math.abs(diff);
    const diffSign = Math.sign(diff);
    if (diffAbs === 0) return new Response();
    if (diffSign === 1)
        await repeatTask(1, diffAbs, () => robot.keyTap('right', ['control', 'command']));
    else
        await repeatTask(1, diffAbs, () => robot.keyTap('left', ['control', 'command']));

    return new Response();
};

function repeatTask(interval: number, times: number, task: () => void): Promise<void>
{
    return new Promise((resolve) =>
    {
        const executeTask = (count: number) =>
        {
            if (count <= 0)
            {
                resolve();
            } else
            {
                // 引数として受け取ったtask関数を実行
                task();
                // 次の実行をスケジュール
                setTimeout(() => executeTask(count - 1), interval * 1000);
            }
        };

        executeTask(times);
    });
}