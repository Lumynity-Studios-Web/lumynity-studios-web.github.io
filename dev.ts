import { type AstroIntegration } from 'astro';

export function integration(): AstroIntegration {
    return {
        name: 'lumynity:dev',
        hooks: {
            'astro:config:setup'({ command, injectRoute }) {
                if (command !== 'dev') return;

                injectRoute({
                    pattern: '/news/[id].md',
                    entrypoint: './src/dev/pages/news/[id].md.ts',
                });
                injectRoute({
                    pattern: '/news/images.json',
                    entrypoint: './src/dev/pages/news/images.json.ts',
                });
                injectRoute({
                    pattern: '/news/images/[filename]',
                    entrypoint: './src/dev/pages/news/images/[filename].ts',
                });
            },
        },
    };
}
