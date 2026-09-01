import aboutRaw from '$lib/content/about.md?raw';
import { excerpt, parseFrontmatter } from '$lib/writings.js';

const about = parseFrontmatter(aboutRaw);

/** Public origin. Canonicals, Open Graph, and the sitemap all use this. */
export const origin = 'https://matteopaz.com';

export const site = {
	name: about.name,
	origin,
	email: 'mpaz@mit.edu',
	description: excerpt(aboutRaw),
	linkedin: about.linkedin,
	x: about.x,
	twitter: `@${about.x.replace(/\/+$/, '').split('/').pop()}`,
	image: '/img/headshot.jpeg',
	imageType: 'image/jpeg',
	imageWidth: 1517,
	imageHeight: 2558,
	imageAlt: 'Portrait of Matteo Paz'
};

export const abs = (path) => origin + (path.startsWith('/') ? path : `/${path}`);

export function jsonLd({ title, description, type, date, sameAs, url }) {
	const image = {
		'@type': 'ImageObject',
		'@id': `${origin}/#headshot`,
		url: abs(site.image),
		contentUrl: abs(site.image),
		width: site.imageWidth,
		height: site.imageHeight,
		caption: site.imageAlt
	};

	const person = {
		'@type': 'Person',
		'@id': `${origin}/#person`,
		name: site.name,
		url: `${origin}/`,
		email: site.email,
		image: { '@id': image['@id'] },
		sameAs: [site.linkedin, site.x],
		description: site.description
	};

	if (type === 'article') {
		const article = {
			'@type': 'Article',
			headline: title,
			description,
			datePublished: date,
			url,
			image: { '@id': image['@id'] },
			mainEntityOfPage: url,
			author: { '@id': person['@id'] }
		};
		if (sameAs) article.sameAs = sameAs;
		return { '@context': 'https://schema.org', '@graph': [image, person, article] };
	}

	return {
		'@context': 'https://schema.org',
		'@graph': [
			image,
			person,
			{
				'@type': 'WebSite',
				'@id': `${origin}/#website`,
				url: `${origin}/`,
				name: site.name,
				description: site.description,
				author: { '@id': person['@id'] }
			},
			{
				'@type': 'WebPage',
				'@id': `${origin}/#webpage`,
				url: `${origin}/`,
				name: site.name,
				description: site.description,
				isPartOf: { '@id': `${origin}/#website` },
				about: { '@id': person['@id'] },
				primaryImageOfPage: { '@id': image['@id'] }
			}
		]
	};
}
