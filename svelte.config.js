import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';

const VIDEO = /\.(mov|mp4|webm)$/i;
const SKIP = /^(https?:|data:|\/|#)/;

function walk(node, fn) {
	fn(node);
	if (node.children) {
		for (const child of node.children) walk(child, fn);
	}
}

/** `![alt](optica/file.png)` → Vite import from `$lib/content/assets/` */
function remarkAssetImages() {
	return (tree) => {
		const imports = [];
		let needsFrame = false;
		walk(tree, (node) => {
			if (node.type !== 'image' || !node.url) return;
			needsFrame = true;
			const alt = JSON.stringify(node.alt ?? '');
			const isVideo = VIDEO.test(node.url);
			let src;
			if (SKIP.test(node.url)) {
				src = JSON.stringify(node.url);
			} else {
				const id = `__asset_${imports.length}`;
				imports.push(`import ${id} from '$lib/content/assets/${node.url}?url';`);
				src = `{${id}}`;
			}
			const media = isVideo
				? `<video src=${src} autoplay muted loop playsinline></video>`
				: `<img src=${src} alt=${alt} />`;
			const framed = `<Frame>${media}</Frame>`;
			node.type = 'html';
			node.value =
				!isVideo && node.title
					? `<figure>${framed}<figcaption>${node.title}</figcaption></figure>`
					: framed;
			delete node.url;
			delete node.alt;
			delete node.title;
		});
		if (!needsFrame) return;
		tree.children.unshift({
			type: 'html',
			value: `<script>\n\timport Frame from '$lib/Frame.svelte';\n\t${imports.join('\n\t')}\n</script>`
		});
	};
}

export default {
	extensions: ['.svelte', '.md'],
	preprocess: [
		mdsvex({
			extensions: ['.md'],
			remarkPlugins: [remarkAssetImages]
		})
	],
	kit: {
		adapter: adapter(),
		prerender: {
			handleHttpError: ({ path, message }) => {
				// drop resume.pdf into static/ and this goes away; any other
				// dead link should still fail the build
				if (path === '/resume.pdf') return;
				throw new Error(message);
			}
		}
	}
};
