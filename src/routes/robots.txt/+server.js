import { origin } from '$lib/site.js';

export const prerender = true;

export function GET() {
	return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' }
	});
}
