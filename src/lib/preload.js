import { preloadData } from '$app/navigation';
import { writings } from './writings.js';
import { pageAssets } from './assets.js';
import wasm from './sphere/sphere.wasm?url';

const routes = ['/', ...writings.map((w) => `/w/${w.slug}`)];

/** Pull every route module and its media into cache so a later click
    is just the crossfade. Two at a time so a hero video doesn't
    starve the rest. */
export async function warmup() {
	await Promise.all(routes.map((href) => preloadData(href).catch(() => {})));

	const queue = [...new Set([...pageAssets, wasm, '/resume.pdf'])];
	await Promise.all(
		[0, 1].map(async () => {
			while (queue.length) {
				const url = queue.shift();
				try {
					const res = await fetch(url, { credentials: 'same-origin', priority: 'low' });
					const reader = res.body?.getReader();
					if (reader) while (!(await reader.read()).done) {}
				} catch {
					/* offline, aborted, or a missing static file */
				}
			}
		})
	);
}
