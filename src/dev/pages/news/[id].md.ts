import { type APIRoute } from 'astro';
import { type CollectionEntry, getEntry } from 'astro:content';
import { open, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const prerender = false;

const notFound = { status: 404, statusText: 'Not found' };

export const GET = (async ({ params }) => {
    const entry: CollectionEntry<'news'> | undefined = await getEntry(
        'news',
        params.id!,
    );
    if (!entry) return new Response(null, notFound);

    const postFile = await open(entry.filePath!);
    return new Response(
        postFile.readableWebStream({ autoClose: true }) as ReadableStream,
    );
}) satisfies APIRoute;

export const PUT = (async ({ params, request }) => {
    const path = new URL(`../../../articles/${params.id}.md`, import.meta.url);
    await writeFile(fileURLToPath(path), request.body!);

    return new Response();
}) satisfies APIRoute;
