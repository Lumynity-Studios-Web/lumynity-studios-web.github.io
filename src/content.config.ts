// If there is an `Uncached or missing remote URL: astro:content` on the next
// line, run `deno task astro sync` and restart your language server.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const dateRegex = /^(\d{2})[\/-](\d{2})[\/-](\d{4})$/;

export const ArticleFrontmatter = z.object({
    date: z.stringFormat('dmy-date', dateRegex)
        .transform((value) => {
            const [d, m, y] = value.match(dateRegex)!.slice(1, 4).map((n) =>
                parseInt(n)
            );
            return new Date(y, m - 1, d);
        }),
});
export type ArticleFrontmatter = z.infer<typeof ArticleFrontmatter>;

const news = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/articles' }),
    schema: ArticleFrontmatter,
});

export const collections = { news };
