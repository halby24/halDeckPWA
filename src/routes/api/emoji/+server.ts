import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as ffi from 'ffi-napi';

const dll = 'bin/cpplib.dll';
const lib = ffi.Library(dll, {
    'send_char_unicode': ['int', ['int']],
});

export const POST: RequestHandler = async ({ request }) =>
{
    const { emoji } = await request.json();

    const codePoint = getEmojiCodePoint(emoji);
    if (codePoint === undefined)
        return error(400, 'Invalid emoji');
    const result = lib.send_char_unicode(codePoint);
    if (result === 0)
        return error(500, 'Failed to send emoji');

    return new Response();
};

function getEmojiCodePoint(emoji: string): number | undefined {
    // 絵文字の最初のコードポイントを取得
    const codePoint = emoji.codePointAt(0);
    return codePoint;
}