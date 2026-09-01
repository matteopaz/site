import { abs, origin, site } from '$lib/site.js';
import { writings } from '$lib/writings.js';

export const prerender = true;

function loc(path, lastmod, image) {
	const extra = [
		lastmod ? `    <lastmod>${lastmod}</lastmod>` : '',
		image
			? `    <image:image>\n      <image:loc>${abs(site.image)}</image:loc>\n      <image:title>${site.name}</image:title>\n      <image:caption>${site.imageAlt}</image:caption>\n    </image:image>`
			: ''
	]
		.filter(Boolean)
		.join('\n');
	return `  <url>\n    <loc>${origin}${path}</loc>${extra ? `\n${extra}` : ''}\n  </url>`;
}

export function GET() {
	const latest = writings[0]?.date ?? '';
	const urls = [
		loc('/', latest, true),
		...writings.map((w) => loc(`/w/${w.slug}`, w.date))
	].join('\n');
	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls}\n</urlset>\n`,
		{ headers: { 'Content-Type': 'application/xml; charset=utf-8' } }
	);
}
