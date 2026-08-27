<script>
	import { bySlug, formatDate } from '$lib/writings.js';
	let { data } = $props();
	let entry = $derived(bySlug(data.slug));
</script>

<svelte:head><title>{entry.title}</title></svelte:head>

<main>
	<article>
		<div class="column">
			<a class="back" href="/">← Matteo Paz</a>

			<header>
				<h1>{entry.title}</h1>
				<time datetime={entry.date}>{formatDate(entry.date)}</time>
			</header>
		</div>

		<div class="column prose"><entry.component /></div>
	</article>
</main>

<style>
	article {
		width: 100%;
		min-width: 0;
	}
	.back {
		font-size: var(--text-caption);
		text-decoration: none;
		color: var(--heading);
	}
	.back:hover {
		color: var(--hover);
	}
	header {
		margin: 1.75rem 0 2rem;
	}
	h1 {
		margin: 0;
		color: var(--title);
		font-size: 1.375rem;
		font-weight: 700;
	}
	time {
		display: block;
		margin-top: 0.4rem;
		color: var(--muted);
		font-size: var(--text-caption);
		font-variant-numeric: oldstyle-nums;
	}

	/* markdown body */
	.prose :global(h2),
	.prose :global(h3) {
		margin: 2.25rem 0 0.6rem;
		color: var(--title);
		font-weight: 700;
	}
	.prose :global(h2) {
		font-size: 1.125rem;
	}
	.prose :global(h3) {
		font-size: var(--text-body);
	}
	.prose :global(ul),
	.prose :global(ol) {
		margin: 0 0 1.2em;
		padding-left: 1.2rem;
	}
	.prose :global(li) {
		margin-bottom: 0.3em;
	}
	.prose :global(blockquote) {
		margin: 1.4em 0;
		border-left: 2px solid var(--border);
		padding-left: 1rem;
		color: var(--heading);
	}
	/* code blocks only — proportional faces cannot hold a column */
	.prose :global(code) {
		font-family: var(--font-mono);
		font-size: 0.8125rem;
	}
	.prose :global(pre) {
		margin: 1.4em 0;
		padding: 0.9rem 1rem;
		overflow-x: auto;
		line-height: 1.5;
	}
	.prose :global(hr) {
		display: none;
	}
	.prose :global(strong) {
		color: var(--title);
		font-weight: 700;
	}
	/* bare `?noframe` assets (the flowcharts) run the full measure, with two
	   lines of air above and below */
	.prose :global(img.bare) {
		display: block;
		width: 100%;
		height: auto;
		margin: 3.2rem 0;
	}
	.prose :global(.frame) {
		margin: 2.5rem 0;
	}
	/* a video or image opening the piece sits against the header, not below a gap */
	.prose > :global(:first-child.frame),
	.prose > :global(:first-child) :global(.frame) {
		margin-top: 0;
	}
	.prose :global(figure) {
		width: 100%;
		margin: 2.5rem 0;
	}
	.prose :global(figure .frame) {
		margin: 0;
	}
	/* footnotes: markers in the text, notes collected at the end */
	.prose :global(.fn-ref) {
		padding-left: 0.1em;
		font-size: var(--text-label);
		font-variant-numeric: oldstyle-nums;
	}
	.prose :global(.fn-ref a) {
		text-decoration: none;
	}
	.prose :global(.footnotes) {
		display: block;
		margin-top: 3rem;
		border-top: 1px solid var(--border);
		padding-top: 1.2rem;
		color: var(--heading);
		font-size: var(--text-caption);
		line-height: 1.6;
	}
	.prose :global(.footnotes ol) {
		margin: 0;
		padding-left: 1.1rem;
	}
	.prose :global(.footnotes li) {
		margin-bottom: 0.5em;
	}
	.prose :global(.fn-back) {
		padding-left: 0.3em;
		text-decoration: none;
	}
	.prose :global(figcaption) {
		margin: 0.9rem auto 0;
		max-width: 30rem;
		color: var(--heading);
		font-size: var(--text-caption);
		font-style: italic;
		line-height: 1.5;
		text-align: center;
		text-wrap: pretty;
	}
</style>
