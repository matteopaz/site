<script>
	let { authors, journal, detail, year, abstract = '', href } = $props();
</script>

<p class="authors">{authors}</p>
<p class="cite" class:spaced={!!abstract}><span class="journal">{journal}</span> {detail} ({year})</p>
{#if abstract}
	<p class="label">abstract</p>
	<p class="abstract">{abstract}</p>
{/if}
<a {href} target="_blank" rel="noreferrer noopener"
	><span class="text"
		>View paper on Institute of Physics</span
	>
	<span class="arrow" aria-hidden="true">↗</span></a
>

<style>
	.authors {
		margin: 0 0 0.35rem;
		color: var(--heading);
	}
	.cite {
		margin: 0;
		color: var(--muted);
		font-size: var(--text-caption);
		font-variant-numeric: oldstyle-nums;
	}
	.cite.spaced {
		margin-bottom: 1.6rem;
	}
	.journal {
		font-style: italic;
	}
	.abstract {
		margin: 0 0 1.6rem;
	}
	a {
		color: var(--title);
		font-size: var(--text-caption);
		font-style: italic;
		text-decoration: none;
		transition: color 0.15s;
	}
	.text {
		text-decoration: underline;
		text-decoration-color: var(--border);
		text-underline-offset: 3px;
		transition: text-decoration-color 0.15s;
	}
	a:hover {
		color: var(--hover);
	}
	a:hover .text {
		text-decoration-color: var(--hover);
	}
	.arrow {
		font-size: 0.9em;
	}
</style>
