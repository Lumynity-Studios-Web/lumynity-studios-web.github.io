import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
    site: 'https://lumynitystudios.net',
    build: {
        format: 'preserve',
    },
    image: {
        responsiveStyles: true,
    },
    integrations: [sitemap({ filter: sitemapFilter })],
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
