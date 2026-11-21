import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

export async function getPosts() {
    const posts = await getCollection<'news'>('news');
    posts.sort((a, b) => a.data.date < b.data.date ? 1 : -1);
    return posts;
}

export const GET = (async () => {
    const posts = await getPosts();
    const ids = posts.map(({ id }) => id);

    return new Response(JSON.stringify(ids));
}) satisfies APIRoute;
