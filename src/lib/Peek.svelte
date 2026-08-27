<script>
	import Frame from '$lib/Frame.svelte';

	let { src, alt = '', children } = $props();

	let open = $state(false);
	let shift = $state(0);
	let root;
	let pop;

	// the popup opens flush with the start of the trigger text, but the
	// article column clips its overflow — so pull it back in when the
	// trigger sits close to the right edge
	function place() {
		if (!root || !pop) return;
		const bounds = (root.closest('.column') ?? document.body).getBoundingClientRect();
		const start = root.getBoundingClientRect().left;
		const over = start + pop.offsetWidth - bounds.right;
		shift = over > 0 ? -Math.min(over, start - bounds.left) : 0;
	}

	function show() {
		place();
		open = true;
	}
</script>

<!-- The popup stays mounted and is revealed with opacity/visibility: Frame
     measures its media on mount, and a display:none popup has no width to
     measure from. -->
<span
	class="peek"
	bind:this={root}
	onmouseenter={show}
	onmouseleave={() => (open = false)}
	onfocusin={show}
	onfocusout={() => (open = false)}
>
	<button
		type="button"
		class="trigger"
		aria-expanded={open}
		onclick={() => (open ? (open = false) : show())}
	>
		{@render children?.()}
	</button>
	<span
		class="pop"
		class:open
		bind:this={pop}
		aria-hidden={!open}
		style="--shift: {shift}px"
	>
		<Frame><img {src} {alt} /></Frame>
	</span>
</span>

<style>
	.peek {
		position: relative;
		display: inline-block;
	}
	.trigger {
		margin: 0;
		padding: 0;
		border: none;
		background: none;
		color: inherit;
		font: inherit;
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 0.15em;
		text-decoration-color: var(--border);
		cursor: help;
	}
	.trigger:hover,
	.trigger[aria-expanded='true'] {
		text-decoration-color: currentColor;
	}
	/* three quarters of the article column */
	.pop {
		position: absolute;
		top: calc(100% + 0.6rem);
		left: 0;
		z-index: 2;
		width: calc(var(--col) * 0.75);
		max-width: calc(100vw - 3rem);
		visibility: hidden;
		opacity: 0;
		transform: translate(var(--shift), -0.25rem);
		transition:
			opacity 0.18s ease,
			transform 0.18s ease,
			visibility 0s linear 0.18s;
		pointer-events: none;
	}
	.pop.open {
		visibility: visible;
		opacity: 1;
		transform: translate(var(--shift), 0);
		transition-delay: 0s;
	}
	.pop :global(img) {
		display: block;
		width: 100%;
	}
	@media (prefers-reduced-motion: reduce) {
		.pop {
			transition: none;
		}
	}
</style>
