const files = import.meta.glob('./content/writings/*.md', { eager: true });

/* one square line-drawing per writing, matched by slug: thumbs/<slug>.svg */
const thumbs = import.meta.glob('./thumbs/*.svg', {
	eager: true,
	query: '?raw',
	import: 'default'
});
const thumbFor = (slug) => thumbs[`./thumbs/${slug}.svg`];

const media = import.meta.glob('./content/assets/**/*.{mov,mp4,webm}', {
	eager: true,
	query: '?url',
	import: 'default'
});
const mediaFor = (rel) => (rel ? media[`./content/assets/${rel}`] : undefined);

export const writings = Object.entries(files)
	.map(([path, mod]) => {
		const slug = path.split('/').pop().replace('.md', '');
		const { hero, ...meta } = mod.metadata ?? {};
		return {
			slug,
			component: mod.default,
			thumb: thumbFor(slug),
			hero: mediaFor(hero),
			...meta
		};
	})
	.sort((a, b) => (a.date < b.date ? 1 : -1));

export const bySlug = (slug) => writings.find((w) => w.slug === slug);

export const formatDate = (d) =>
	new Date(d).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		timeZone: 'UTC'
	});
