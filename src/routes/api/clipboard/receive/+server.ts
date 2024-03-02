import type { RequestHandler } from '../$types';
import clipboard from 'clipboardy';

export const GET: RequestHandler = async () =>
{
    const data = clipboard.readSync();
    return new Response(data);
};
