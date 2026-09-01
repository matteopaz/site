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

export function parseFrontmatter(raw) {
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

function stripMd(text) {
	return text
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/!\[[^\]]*\]\([^)]+\)/g, '')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/^#{1,6}\s+.*$/gm, '')
		.replace(/\*\*([^*]+)\*\*/g, '$1')
		.replace(/\*([^*]+)\*/g, '$1')
		.replace(/`([^`]+)`/g, '$1')
		.replace(/<[^>]+>/g, '')
		.replace(/\s+/g, ' ')
		.trim();
}

function clip(text, max = 160) {
	if (text.length <= max) return text;
	const slice = text.slice(0, max);
	const sentence = slice.match(/^[\s\S]+?[.!](?=\s|$)/);
	if (sentence && sentence[0].length > 80) return sentence[0];
	const cut = slice.lastIndexOf(' ');
	return (cut > 80 ? slice.slice(0, cut) : slice).replace(/[,;:.!?…]+$/, '') + '…';
}

/** First usable paragraph, or the paper abstract when one is written. */
export function excerpt(raw) {
	const body = raw.replace(/^---\r?\n[\s\S]*?\r?\n---/, '').trim();
	const abs = /\nabstract\n\n([\s\S]+?)(?:\n\n|$)/.exec(`\n${body}`);
	if (abs) {
		const t = stripMd(abs[1]);
		if (t.length > 40) return clip(t);
	}
	for (const block of body.split(/\n\s*\n/)) {
		const line = block.trim();
		if (
			!line ||
			/^!\[/.test(line) ||
			/^#{1,6}\s/.test(line) ||
			/^abstract$/i.test(line) ||
			/^\[View paper/i.test(line) ||
			/\(\d{4}\)\s*$/.test(line.replace(/\*+/g, ''))
		) {
			continue;
		}
		const t = stripMd(block);
		if (t.length < 50) continue;
		return clip(t);
	}
	return '';
}

function paperUrl(raw) {
	return /\[View paper[^\]]*\]\((https?:\/\/[^)]+)\)/i.exec(raw)?.[1] ?? '';
}

export const writings = Object.entries(sources)
	.map(([path, raw]) => {
		const slug = path.split('?')[0].split('/').pop().replace('.md', '');
		return {
			slug,
			thumb: thumbFor(slug),
			description: excerpt(raw),
			paper: paperUrl(raw),
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
