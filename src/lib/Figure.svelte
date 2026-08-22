<script>
	import Frame from '$lib/Frame.svelte';
	let { src, alt = '', caption = '' } = $props();
</script>

<figure>
	<Frame>
		<img {src} {alt} />
	</Frame>
	{#if caption}<figcaption>{caption}</figcaption>{/if}
</figure>

<style>
	/* held to the text column, never wider */
	figure {
		width: 100%;
		margin: 2.5rem 0;
	}
	figcaption {
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
