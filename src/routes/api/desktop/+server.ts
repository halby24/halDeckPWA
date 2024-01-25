import { getVirtualDesktops } from '$lib/get-virtual-desktops';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () =>
{
    const desktops = await getVirtualDesktops();
    return new Response(JSON.stringify(desktops));
};