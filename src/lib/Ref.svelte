<script>
	let { authors, title, venue, detail = '', year, href, label } = $props();
</script>

<aside class="ref">
	<p class="label">paper</p>
	<p class="cite">
		{authors}. <em>{title}.</em>
		<span class="venue">{venue}</span>{#if detail}&nbsp;{detail}{/if} ({year}).
	</p>
	<a {href} target="_blank" rel="noreferrer noopener">{label} <span aria-hidden="true">↗</span></a>
</aside>

<style>
	.ref {
		margin: 2.5rem 0;
		padding: 1rem 0 1.1rem;
	}
	.cite {
		margin: 0 0 0.5rem;
		color: var(--text);
	}
	.venue {
		font-style: italic;
	}
	a {
		color: var(--heading);
		font-size: var(--text-caption);
		text-decoration: none;
	}
	a:hover {
		color: var(--hover);
	}
	a span {
		font-size: 0.9em;
	}
</style>
