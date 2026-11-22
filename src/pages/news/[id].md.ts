import { type CollectionEntry, getEntry } from 'astro:content';
import { getStaticPaths as regularStaticPaths } from './[id].astro';
import { readFile } from 'node:fs/promises';
import { type APIRoute } from 'astro';

export const GET = (async ({ params }) => {
    const notFound = { status: 404, statusText: 'Not found' };
    if (!import.meta.env.DEV) {
        return new Response(null, notFound);
    }

    const entry: CollectionEntry<'news'> | undefined = await getEntry('news', params.id!);
    if (!entry) return new Response(null, notFound);

    const postMD = await readFile(entry.filePath!, { encoding: 'utf-8' });
    return new Response(postMD);
}) satisfies APIRoute;

export function getStaticPaths() {
    if (!import.meta.env.DEV) {
        return [];
    }

    return regularStaticPaths();
}
