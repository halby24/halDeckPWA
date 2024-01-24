import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params }) =>
{
    if (!params.title)
    {
        throw error(400, 'no title');
    }
    const title = params.title as string;

    if (isError) {
        throw error(500, result);
    }
    return new Response(JSON.stringify({ ok: true, message: 'success!' }), );
};