import { type APIRoute, type ImageInputFormat } from 'astro';
import { glob } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const imageExtensions: ImageInputFormat[] = [
    'jpeg',
    'jpg',
    'png',
    'tiff',
    'webp',
    'gif',
    'svg',
    'avif',
];
export const imageGlob = `*.{${imageExtensions.join(',')}}`;

export function getImages(): NodeJS.AsyncIterator<string> {
    return glob(
        imageGlob,
        { cwd: fileURLToPath(new URL('../../../articles/', import.meta.url)) },
    );
}

export const GET = ((_request) => {
    const body = new ReadableStream({
        async start(controller) {
            let first = true;
            controller.enqueue('[');

            for await (const filename of getImages()) {
                controller.enqueue(
                    (first ? '' : ', ') + JSON.stringify(filename),
                );
                first = false;
            }

            controller.enqueue(']');
            controller.close();
        },
    });

    return new Response(body);
}) satisfies APIRoute;
