import { error } from '@sveltejs/kit';
import { writings, bySlug } from '$lib/writings.js';

export const prerender = true;
export const entries = () => writings.map((w) => ({ slug: w.slug }));

export function load({ params }) {
	if (!bySlug(params.slug)) error(404);
	return { slug: params.slug };
}
