const sources = import.meta.glob('./content/writings/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
});

/* one square line-drawing per writing, matched by slug: thumbs/<slug>.svg */
const thumbs = import.meta.glob('./thumbs/*.svg', {
	eager: true,
	query: '?raw',
	import: 'default'
});
const thumbFor = (slug) => thumbs[`./thumbs/${slug}.svg`];

function parseFrontmatter(raw) {
	const block = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
	if (!block) return {};
	const meta = {};
	for (const line of block[1].split('\n')) {
		const cut = line.indexOf(':');
		if (cut < 0) continue;
		const key = line.slice(0, cut).trim();
		let val = line.slice(cut + 1).trim();
		if (
			(val.startsWith("'") && val.endsWith("'")) ||
			(val.startsWith('"') && val.endsWith('"'))
		) {
			val = val.slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"');
		}
		meta[key] = val;
	}
	return meta;
}

export const writings = Object.entries(sources)
	.map(([path, raw]) => {
		const slug = path.split('?')[0].split('/').pop().replace('.md', '');
		return {
			slug,
			thumb: thumbFor(slug),
			...parseFrontmatter(raw)
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
