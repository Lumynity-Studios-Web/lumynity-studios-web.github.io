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
    if (page.match(/^\/news\//)) {
        return false;
    }

    return true;
}
