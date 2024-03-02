import { error } from '@sveltejs/kit';
import type { RequestHandler } from '../$types';
import clipboard from 'clipboardy';

export const POST: RequestHandler = async ({ request }) =>
{
    const { text } = await request.json();
    if (typeof text !== 'string')
        return error(400, 'Invalid text');
    clipboard.writeSync(text);
    return new Response();
};
