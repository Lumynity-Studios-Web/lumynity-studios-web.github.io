import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    site: 'https://lumynity-studios-web.github.io',
    build: {
        format: 'preserve',
    },
    image: {
        responsiveStyles: true,
    },
});
