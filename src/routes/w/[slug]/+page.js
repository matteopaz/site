import { error } from '@sveltejs/kit';
import { writings, bySlug } from '$lib/writings.js';

const loaders = import.meta.glob('$lib/content/writings/*.md');

export const prerender = true;
export const entries = () => writings.map((w) => ({ slug: w.slug }));

export async function load({ params }) {
	if (!bySlug(params.slug)) error(404);
	const path = Object.keys(loaders).find((p) => p.endsWith(`/${params.slug}.md`));
	if (!path) error(404);
	const mod = await loaders[path]();
	return { slug: params.slug, Writing: mod.default };
}
