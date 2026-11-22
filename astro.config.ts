import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { assert } from 'node:console';
import { z } from 'astro/zod';

import { integration as devIntegration } from './dev.ts';

const debugSitemap = z.stringbool().default(false).parse(
    Deno.env.get('DEBUG_SITEMAP'),
);

// https://astro.build/config
export default defineConfig({
    site: 'https://lumynitystudios.net',
    build: {
        format: 'preserve',
    },
    image: {
        responsiveStyles: true,
    },
    integrations: [
        devIntegration(),
        sitemap({
            filter: debugSitemap
                ? debugSitemapFilter(sitemapFilter)
                : sitemapFilter,
        }),
    ],
});

function sitemapFilter(page: string): boolean {
    const { origin, pathname } = new URL(page);
    assert(
        origin === 'https://lumynitystudios.net',
        `unexpected sitemap origin '${origin}' (update sitemapFilter in astro.config.ts)`,
    );

    if (pathname.match(/^\/news\//)) {
        return false;
    }

    return true;
}

function debugSitemapFilter(
    filter: (page: string) => boolean,
): (page: string) => boolean {
    let first = true;

    return (page) => {
        if (first) {
            first = false;
            console.log(
                `%c${
                    new Date().toLocaleTimeString()
                } %c[sitemap] %cDebugging sitemap`,
                'color: grey',
                'color: blue',
                'color: unset',
            );
        }

        const result = filter(page);
        console.log(
            `%c${new Date().toLocaleTimeString()} %c  ├─ %c${
                result ? 'in' : 'ex'
            }cluded %c${page}`,
            'color: grey',
            'color: blue',
            `color: ${result ? 'green' : 'red'}`,
            'color: unset',
        );

        return result;
    };
}
