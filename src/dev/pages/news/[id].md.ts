import { type CollectionEntry, getEntry } from 'astro:content';
import { readFile } from 'node:fs/promises';
import { type APIRoute } from 'astro';
import { fileURLToPath } from 'node:url';
import { writeFile } from 'node:fs/promises';

export const prerender = false;

const notFound = { status: 404, statusText: 'Not found' };

export const GET = (async ({ params }) => {
    const entry: CollectionEntry<'news'> | undefined = await getEntry(
        'news',
        params.id!,
    );
    if (!entry) return new Response(null, notFound);

    const postMD = await readFile(entry.filePath!, { encoding: 'utf-8' });
    return new Response(postMD);
}) satisfies APIRoute;

export const PUT = (async ({ params, request }) => {
    const path = new URL(`../../../articles/${params.id}.md`, import.meta.url);
    await writeFile(fileURLToPath(path), request.body!);

    return new Response();
}) satisfies APIRoute;
