import { type APIRoute } from 'astro';
import { open, writeFile } from 'node:fs/promises';
import { matchesGlob } from 'node:path';
import { fileURLToPath } from 'node:url';
import { imageGlob } from '../images.json.ts';

export const prerender = false;

const notFound = { status: 404, statusText: 'Not found' };

function imageMIME(filename: string): string {
    const extensionDot = filename.lastIndexOf('.');
    const extension = filename.slice(extensionDot + 1);

    // https://www.iana.org/assignments/media-types#image
    // `../images.json.ts` > `imageExtensions`
    const type = {
        jpg: 'jpeg',
        svg: 'svg+xml',
    }[extension] ?? extension;

    return 'image/' + type;
}

export const GET = (async ({ params }) => {
    if (!matchesGlob(params.filename!, imageGlob)) {
        return new Response(null, notFound);
    }

    try {
        const imageFile = await open(
            fileURLToPath(
                new URL(
                    `../../../../articles/${params.filename}`,
                    import.meta.url,
                ),
            ),
        );

        const headers = new Headers();
        headers.set('Content-Type', imageMIME(params.filename!));

        return new Response(
            imageFile.readableWebStream({ autoClose: true }) as ReadableStream,
            { headers },
        );
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            return new Response(null, notFound);
        }

        throw error;
    }
}) satisfies APIRoute;

export const PUT = (async ({ params, request }) => {
    if (!matchesGlob(params.filename!, imageGlob)) {
        return new Response(null, notFound);
    }

    const path = new URL(
        `../../../../articles/${params.filename}`,
        import.meta.url,
    );
    await writeFile(fileURLToPath(path), request.body!);

    return new Response();
}) satisfies APIRoute;
