<script>
	import { writings, formatDate } from '$lib/writings.js';
	import About, { metadata } from '$lib/content/about.md';
	import { metadata as recognitions } from '$lib/content/recognitions.md';
	import Seo from '$lib/Seo.svelte';
	import { site } from '$lib/site.js';
</script>

<Seo title={metadata.name} description={site.description} path="/" />

<main class="home">
	<div class="column">
		<header>
			<h1>{metadata.name}</h1>
			<nav>
				<a href={metadata.resume}>rez</a>
				<a href={metadata.linkedin} target="_blank" rel="me noreferrer noopener">[in]</a>
				<a href={metadata.x} target="_blank" rel="me noreferrer noopener">[x]</a>
			</nav>
		</header>

		<section>
			<p class="label">about</p>
			<About />
		</section>

		<section>
			<p class="label">recognitions</p>
			<ul class="recognitions">
				{#each recognitions.items as r}
					<li>
						<span>{r.name}<span class="detail">, {r.detail}</span></span>
						<time datetime={String(r.year)}>{r.year}</time>
					</li>
				{/each}
			</ul>
		</section>

		<section>
			<p class="label">writings</p>
			<ul class="writings">
				{#each writings as w}
					<li>
						<a href="/w/{w.slug}">
							<span class="lead">
								{#if w.thumb}<span class="thumb">{@html w.thumb}</span>{/if}
								<span class="title">{w.title}</span>
							</span>
							<time datetime={w.date}>{formatDate(w.date)}</time>
						</a>
					</li>
				{/each}
			</ul>
		</section>
	</div>
</main>

<style>
	.column {
		display: flex;
		flex-direction: column;
		gap: 2.25rem;
	}
	header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1.5rem;
		margin-bottom: 0.25rem;
	}
	h1 {
		margin: 0;
		color: var(--title);
		font-size: var(--text-display);
		font-weight: 700;
	}
	header nav {
		display: flex;
		align-items: baseline;
		gap: 0.9rem;
		font-size: var(--text-caption);
	}
	header nav a[href^='http'] {
		color: var(--heading);
		text-decoration: none;
	}
	header nav a[href^='http']:hover {
		color: var(--hover);
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
	}

	/* recognitions and writings share the same row rhythm: label-aligned
	   text on the left, dates on the right */
	.recognitions li,
	.writings li a {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1.5rem;
		padding: 0.35rem 0;
		color: var(--title);
	}
	.writings li a {
		text-decoration: none;
	}
	.writings li a:hover {
		color: var(--hover);
	}
	.writings .lead {
		display: flex;
		align-items: center;
		gap: 0.65rem;
		min-width: 0;
	}
	.writings .thumb {
		flex: none;
		width: 1.15em;
		height: 1.15em;
		color: var(--icon);
		transition: color 0.15s;
	}
	.writings .thumb :global(svg) {
		display: block;
		width: 100%;
		height: 100%;
	}
	.writings li a:hover .thumb {
		color: var(--hover);
	}
	.writings .title {
		text-wrap: pretty;
	}

	/* recognitions: plain text at body size rather than links */
	.recognitions .detail {
		color: var(--heading);
	}
	.recognitions time {
		color: var(--muted);
		font-size: var(--text-body);
	}
	time {
		flex: none;
		color: var(--muted);
		font-size: var(--text-caption);
		font-variant-numeric: oldstyle-nums;
		white-space: nowrap;
	}
</style>
