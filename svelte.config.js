import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';
import katex from 'katex';

const VIDEO = /\.(mov|mp4|webm)$/i;
const BIN = /\.bin$/i;
const HERO = /(?:^|\/)hero\.(mov|mp4|webm)$/i;
const SKIP = /^(https?:|data:|\/|#)/;
const NOFRAME = /[?&]noframe\b/;
const PEEK = /^peek:/;
const PAPER = ['authors', 'journal', 'detail', 'year', 'abstract', 'href'];

function walk(node, fn) {
	fn(node);
	if (node.children) {
		for (const child of node.children) walk(child, fn);
	}
}

function textOf(node) {
	if (!node) return '';
	if (node.value) return node.value;
	return (node.children ?? []).map(textOf).join('');
}

function isPara(node) {
	return node?.type === 'paragraph';
}

function hasEmbed(node) {
	return (node.children ?? []).some((c) => c.type === 'image' || c.type === 'html');
}

function isCite(node) {
	return isPara(node) && node.children?.some((c) => c.type === 'emphasis');
}

function paperLink(node) {
	if (!isPara(node)) return null;
	return node.children?.find((c) => c.type === 'link' && /view paper/i.test(textOf(c)));
}

function paperNode(authors, cite, extra) {
	const journal = cite.children.find((c) => c.type === 'emphasis');
	const rest = textOf(cite).replace(textOf(journal), '').trim();
	const year = /\((\d{4})\)\s*$/.exec(rest);
	const props = {
		authors: textOf(authors).trim(),
		journal: textOf(journal).trim(),
		detail: rest.replace(/\s*\(\d{4}\)\s*$/, '').trim(),
		year: year?.[1] ?? '',
		abstract: '',
		href: '',
		...extra
	};
	return {
		type: 'html',
		value: `<Paper ${PAPER.map((k) => `${k}={${JSON.stringify(props[k])}}`).join(' ')} />`
	};
}

/** authors / journal / abstract / IOP link written as ordinary markdown,
    the same way optica writes a heading or a caption — turned into <Paper>
    so the citation block keeps its existing type. Abstract is optional. */
function remarkPaper() {
	return (tree) => {
		const kids = tree.children;
		if (!kids) return;
		const out = [];
		for (let i = 0; i < kids.length; i++) {
			const authors = kids[i];
			const cite = kids[i + 1];
			if (isPara(authors) && !hasEmbed(authors) && isCite(cite)) {
				const label = kids[i + 2];
				const abstract = kids[i + 3];
				const afterAbstract = paperLink(kids[i + 4]);
				if (
					isPara(label) &&
					textOf(label).trim() === 'abstract' &&
					isPara(abstract) &&
					afterAbstract
				) {
					out.push(
						paperNode(authors, cite, {
							abstract: textOf(abstract).trim(),
							href: afterAbstract.url
						})
					);
					i += 4;
					continue;
				}
				const afterCite = paperLink(kids[i + 2]);
				if (afterCite) {
					out.push(paperNode(authors, cite, { href: afterCite.url }));
					i += 2;
					continue;
				}
			}
			out.push(kids[i]);
		}
		tree.children = out;
	};
}

/** `![caption](optica/file.png)` → Vite import from `$lib/content/assets/`.
    The bracket text doubles as the alt attribute and, when non-empty, as
    an italic centered caption below the asset — one source, no separate
    title string or trailing italic paragraph to keep in sync.
    A `.bin` asset is the interactive sky map rather than an image.
    A file named `hero` is the same kind of opener — full-bleed, no frame. */
function remarkAssetImages() {
	return (tree) => {
		const imports = [];
		let needsFrame = false;
		let needsSoundVideo = false;
		let needsPeek = false;
		let needsPaper = false;
		let needsSky = false;
		const assetSrc = (url) => {
			if (SKIP.test(url)) return JSON.stringify(url);
			const id = `__asset_${imports.length}`;
			imports.push(`import ${id} from '$lib/content/assets/${url}?url';`);
			return `{${id}}`;
		};
		walk(tree, (node) => {
			if (node.type === 'html' && /<Paper\b/.test(node.value ?? '')) needsPaper = true;
			// `[phrase](peek:optica/thing.png)` → an underlined phrase that
			// reveals the image below it on hover
			if (node.type === 'link' && PEEK.test(node.url ?? '')) {
				const url = node.url.replace(PEEK, '');
				const text = (node.children ?? [])
					.map((c) => c.value ?? '')
					.join('')
					.replace(/&/g, '&amp;')
					.replace(/</g, '&lt;');
				needsPeek = true;
				node.type = 'html';
				node.value = `<Peek src=${assetSrc(url)} alt={${JSON.stringify(text)}}>${text}</Peek>`;
				delete node.url;
				delete node.children;
				return;
			}
			if (node.type !== 'image' || !node.url) return;
			// `?noframe` opts an image out of the hand-drawn photo/video
			// border — for assets (like generated diagrams) that already
			// draw their own borders and shouldn't be framed twice
			const bare = NOFRAME.test(node.url);
			const url = node.url.replace(NOFRAME, '').replace(/[?&]$/, '');
			if (BIN.test(url)) {
				needsSky = true;
				const caption = node.alt ?? '';
				const cap = caption
					? ` caption={${JSON.stringify(caption)}}`
					: '';
				node.type = 'html';
				node.value = `<Sky src=${assetSrc(url)}${cap} />`;
				delete node.url;
				delete node.alt;
				delete node.title;
				return;
			}
			if (HERO.test(url)) {
				const label = node.alt ? ` aria-label={${JSON.stringify(node.alt)}}` : '';
				node.type = 'html';
				node.value = `<figure><video src=${assetSrc(url)} autoplay muted loop playsinline${label}></video></figure>`;
				delete node.url;
				delete node.alt;
				delete node.title;
				return;
			}
			if (!bare && !VIDEO.test(url)) needsFrame = true;
			const caption = node.alt ?? '';
			const alt = JSON.stringify(caption);
			const isVideo = VIDEO.test(url);
			let src;
			if (SKIP.test(url)) {
				src = JSON.stringify(url);
			} else {
				const id = `__asset_${imports.length}`;
				imports.push(`import ${id} from '$lib/content/assets/${url}?url';`);
				src = `{${id}}`;
			}
			if (isVideo) needsSoundVideo = true;
			// SoundVideo does its own framing so its sound toggle can sit
			// outside Frame's scaled foreignObject
			const media = isVideo
				? `<SoundVideo src=${src} frame={${!bare}} />`
				: `<img${bare ? ' class="bare"' : ''} src=${src} alt=${alt} />`;
			const framed = bare || isVideo ? media : `<Frame>${media}</Frame>`;
			node.type = 'html';
			node.value = caption
				? `<figure>${framed}<figcaption>${caption.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</figcaption></figure>`
				: framed;
			delete node.url;
			delete node.alt;
			delete node.title;
		});
		// markdown wraps a lone image in a <p> — a block-level asset can't
		// live inside that paragraph without browsers hoisting it out and
		// hydration then mismatching, so unwrap it here
		walk(tree, (parent) => {
			const kids = parent.children;
			if (!kids) return;
			for (const kid of kids) {
				if (kid.type !== 'paragraph') continue;
				const inline = (kid.children ?? []).filter((c) => !(c.type === 'text' && !c.value.trim()));
				if (inline.length === 1 && inline[0].type === 'html') {
					kid.type = 'html';
					kid.value = inline[0].value;
					delete kid.children;
				}
			}
		});
		if (
			!imports.length &&
			!needsFrame &&
			!needsSoundVideo &&
			!needsPeek &&
			!needsPaper &&
			!needsSky
		)
			return;
		const frameImport = needsFrame ? `import Frame from '$lib/Frame.svelte';\n\t` : '';
		const soundVideoImport = needsSoundVideo
			? `import SoundVideo from '$lib/SoundVideo.svelte';\n\t`
			: '';
		const peekImport = needsPeek ? `import Peek from '$lib/Peek.svelte';\n\t` : '';
		const paperImport = needsPaper ? `import Paper from '$lib/Paper.svelte';\n\t` : '';
		const skyImport = needsSky ? `import Sky from '$lib/Sky.svelte';\n\t` : '';
		const ids = imports.map((_, i) => `__asset_${i}`);
		const register =
			ids.length > 0
				? `<script context="module">\n\timport { registerAssets } from '$lib/assets.js';\n\t${imports.join('\n\t')}\n\tregisterAssets(${ids.join(', ')});\n</script>\n`
				: '';
		tree.children.unshift({
			type: 'html',
			value: `${register}<script>\n\t${frameImport}${soundVideoImport}${peekImport}${paperImport}${skyImport}${imports.join('\n\t')}\n</script>`
		});
	};
}

/** `text[^id]` in the prose plus a `[^id]: note` paragraph anywhere in the
    file → a numbered marker and a notes list at the end of the piece.
    mdsvex pins an old remark, so remark-gfm's footnotes can't be used —
    that remark parses `[^id]` as a shortcut linkReference, which is what
    this walks for. */
const isFootnote = (node) => node?.type === 'linkReference' && node.identifier?.startsWith('^');

function remarkFootnotes() {
	return (tree) => {
		const defs = new Map();
		// pull the definition paragraphs out of the body first
		tree.children = tree.children.filter((node) => {
			if (node.type !== 'paragraph') return true;
			const [ref, next, ...rest] = node.children ?? [];
			if (!isFootnote(ref) || next?.type !== 'text') return true;
			const m = /^:\s*/.exec(next.value);
			if (!m) return true;
			defs.set(ref.identifier, [{ ...next, value: next.value.slice(m[0].length) }, ...rest]);
			return false;
		});
		if (!defs.size) return;

		// then number the markers in the order they are referenced
		const used = [];
		walk(tree, (node) => {
			if (!node.children) return;
			node.children = node.children.map((child) => {
				if (!isFootnote(child) || !defs.has(child.identifier)) return child;
				const id = child.identifier;
				if (!used.includes(id)) used.push(id);
				const n = used.indexOf(id) + 1;
				const slug = id.slice(1);
				return {
					type: 'html',
					value: `<sup class="fn-ref" id="fnref-${slug}"><a href="#fn-${slug}" data-footnote-ref>${n}</a></sup>`,
				};
			});
		});
		if (!used.length) return;

		tree.children.push(
			{ type: 'html', value: '<section class="footnotes">' },
			{
				type: 'list',
				ordered: true,
				spread: false,
				children: used.map((id) => {
					const slug = id.slice(1);
					return {
						type: 'listItem',
						spread: false,
						data: { hProperties: { id: `fn-${slug}` } },
						children: [
							{
								type: 'paragraph',
								children: [
									...defs.get(id),
									{
										type: 'html',
										value: ` <a class="fn-back" href="#fnref-${slug}" data-footnote-backref aria-label="Back to reference">\u21a9</a>`,
									},
								],
							},
						],
					};
				}),
			},
			{ type: 'html', value: '</section>' },
		);
	};
}

const KATEX = { throwOnError: false, strict: 'ignore', macros: { '\\R': '\\mathbb{R}' } };
const mathByFile = new Map();

function katexHtml(tex, displayMode) {
	return katex.renderToString(tex.trim(), { ...KATEX, displayMode });
}

function outsideCode(text, fn) {
	return text
		.split(/(```[\s\S]*?```|`[^`]+`)/)
		.map((part, i) => (i % 2 ? part : fn(part)))
		.join('');
}

/** Replace `$$...$$` / `$...$` with inert comments before markdown runs
    (so `_` in `$f_{FF}$` is not emphasis, and so `\mathbb` never reaches
    Svelte as raw text). Restore `{@html}` *after* mdsvex — if the HTML
    lands in the markdown source, typographic quotes break the string. */
function protectMath(src, filename) {
	const block = /^---\r?\n[\s\S]*?\r?\n---/.exec(src);
	const head = block ? block[0] : '';
	let body = block ? src.slice(block[0].length) : src;
	const htmls = [];
	const hold = (tex, display) => {
		htmls.push(katexHtml(tex, display));
		return `<!--%%MATH${htmls.length - 1}%%-->`;
	};
	body = outsideCode(body, (t) => t.replace(/\$\$([\s\S]+?)\$\$/g, (_, tex) => `\n\n${hold(tex, true)}\n\n`));
	body = outsideCode(body, (t) => t.replace(/\$([^$\n]+?)\$/g, (_, tex) => hold(tex, false)));
	mathByFile.set(filename, htmls);
	return head + body;
}

function restoreMath(src, filename) {
	const htmls = mathByFile.get(filename);
	if (!htmls) return src;
	mathByFile.delete(filename);
	return src.replace(/<!--%%MATH(\d+)%%-->/g, (_, i) => {
		const html = htmls[Number(i)];
		if (html == null) return _;
		const display = html.includes('katex-display');
		const tag = display ? 'div' : 'span';
		const cls = display ? 'math-display' : 'math-inline';
		return `<${tag} class="${cls}">{@html ${JSON.stringify(html)}}</${tag}>`;
	});
}

function writingsMath() {
	const ours = (filename) =>
		filename?.includes('/content/writings/') && filename.endsWith('.md');
	return {
		markup({ content, filename }) {
			if (!ours(filename)) return;
			return { code: protectMath(content, filename) };
		}
	};
}

function writingsMathRestore() {
	const ours = (filename) =>
		filename?.includes('/content/writings/') && filename.endsWith('.md');
	return {
		markup({ content, filename }) {
			if (!ours(filename) || !mathByFile.has(filename)) return;
			return { code: restoreMath(content, filename) };
		}
	};
}

export default {
	extensions: ['.svelte', '.md'],
	preprocess: [
		writingsMath(),
		mdsvex({
			extensions: ['.md'],
			remarkPlugins: [remarkFootnotes, remarkPaper, remarkAssetImages],
		}),
		writingsMathRestore(),
	],
	kit: {
		adapter: adapter(),
		prerender: {
			origin: 'https://matteopaz.com'
		}
	},
};
