import robot from 'robotjs';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async () =>
{
    robot.keyTap('audio_mute');
    return new Response();
};