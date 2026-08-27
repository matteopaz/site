import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';

const VIDEO = /\.(mov|mp4|webm)$/i;
const SKIP = /^(https?:|data:|\/|#)/;
const NOFRAME = /[?&]noframe\b/;
const PEEK = /^peek:/;

function walk(node, fn) {
	fn(node);
	if (node.children) {
		for (const child of node.children) walk(child, fn);
	}
}

/** `![caption](optica/file.png)` → Vite import from `$lib/content/assets/`.
    The bracket text doubles as the alt attribute and, when non-empty, as
    an italic centered caption below the asset — one source, no separate
    title string or trailing italic paragraph to keep in sync. */
function remarkAssetImages() {
	return (tree) => {
		const imports = [];
		let needsFrame = false;
		let needsSoundVideo = false;
		let needsPeek = false;
		const assetSrc = (url) => {
			if (SKIP.test(url)) return JSON.stringify(url);
			const id = `__asset_${imports.length}`;
			imports.push(`import ${id} from '$lib/content/assets/${url}?url';`);
			return `{${id}}`;
		};
		walk(tree, (node) => {
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
		if (!imports.length && !needsFrame && !needsSoundVideo && !needsPeek) return;
		const frameImport = needsFrame ? `import Frame from '$lib/Frame.svelte';\n\t` : '';
		const soundVideoImport = needsSoundVideo
			? `import SoundVideo from '$lib/SoundVideo.svelte';\n\t`
			: '';
		const peekImport = needsPeek ? `import Peek from '$lib/Peek.svelte';\n\t` : '';
		tree.children.unshift({
			type: 'html',
			value: `<script>\n\t${frameImport}${soundVideoImport}${peekImport}${imports.join('\n\t')}\n</script>`,
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

export default {
	extensions: ['.svelte', '.md'],
	preprocess: [
		mdsvex({
			extensions: ['.md'],
			remarkPlugins: [remarkFootnotes, remarkAssetImages],
		}),
	],
	kit: {
		adapter: adapter(),
		prerender: {
			handleHttpError: ({ path, message }) => {
				// drop resume.pdf into static/ and this goes away; any other
				// dead link should still fail the build
				if (path === '/resume.pdf') return;
				throw new Error(message);
			},
		},
	},
};
