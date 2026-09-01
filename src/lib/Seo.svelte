<script>
	import { abs, jsonLd, site } from '$lib/site.js';

	let { title, description, path, type = 'website', date = '', sameAs = '' } = $props();

	let url = $derived(abs(path));
	let image = $derived(abs(site.image));
	let fullTitle = $derived(title === site.name ? title : `${title} — ${site.name}`);
	let ld = $derived(jsonLd({ title, description, type, date, sameAs, url }));
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<meta name="author" content={site.name} />
	<link rel="canonical" href={url} />

	<meta property="og:type" content={type} />
	<meta property="og:site_name" content={site.name} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	<meta property="og:locale" content="en_US" />
	<meta property="og:image" content={image} />
	<meta property="og:image:type" content={site.imageType} />
	<meta property="og:image:width" content={String(site.imageWidth)} />
	<meta property="og:image:height" content={String(site.imageHeight)} />
	<meta property="og:image:alt" content={site.imageAlt} />
	{#if date}
		<meta property="article:published_time" content={date} />
		<meta property="article:author" content={site.name} />
	{/if}

	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:creator" content={site.twitter} />
	<meta name="twitter:image" content={image} />
	<meta name="twitter:image:alt" content={site.imageAlt} />

	{@html `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`}
</svelte:head>
