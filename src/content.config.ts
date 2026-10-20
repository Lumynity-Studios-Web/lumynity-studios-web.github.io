// If there is an `Uncached or missing remote URL: astro:content` on the next
// line, run `deno task astro sync` and restart your language server.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const news = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/articles' }),
});

export const collections = { news };
