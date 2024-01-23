import { tapKey } from '$lib/tap-key';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async () =>
{
    const [result, error] = await tapKey('0xB3');
    if (error) {
        return new Response(JSON.stringify({ ok: false, message: result }), );
    }
    return new Response(JSON.stringify({ ok: true, message: 'success!' }), );
};