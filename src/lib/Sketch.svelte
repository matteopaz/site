<script>
	let { svg, side = 'left', delay = 0, progress = 0 } = $props();
</script>

<aside
	class={side}
	style="--delay: {delay}ms; --progress: {progress}"
>
	<div class="draw">{@html svg}</div>
	<div class="draw ink">{@html svg}</div>
</aside>

<style>
	/* Each sketch stands on its screen edge: the horizon line runs the full
	   height of the viewport and the buildings grow horizontally inward.
	   Sizing comes from --sk-len / --sk-w / --sk-off in app.css. */
	aside {
		position: fixed;
		top: 0;
		z-index: 0;
		width: var(--sk-w);
		height: 100vh;
		overflow: hidden;
		color: var(--heading);
		pointer-events: none;
	}
	/* named so the page crossfade leaves them alone */
	aside.left {
		left: 0;
		view-transition-name: sketch-left;
	}
	aside.right {
		right: 0;
		view-transition-name: sketch-right;
	}
	.draw {
		position: absolute;
		inset: 0;
	}
	/* darker ink covers the drawing from the top down, in proportion to
	   how far the page has been scrolled */
	.ink {
		color: var(--title);
		clip-path: inset(0 0 calc((1 - var(--progress)) * 100%) 0);
	}
	aside :global(svg) {
		display: block;
		width: var(--sk-len);
		height: auto;
		transform-origin: 0 0;
		/* clipped in the drawing's own space, so it traces along the pen
		   direction whichever way the sketch is turned */
		animation: trace 2.4s var(--delay) cubic-bezier(0.3, 0.7, 0.3, 1) both;
	}
	/* rotated about the top-left corner, then walked back into the strip and
	   up by --sk-off so the overhang is split evenly top and bottom */
	aside.left :global(svg) {
		transform: translate(var(--sk-w), calc(-1 * var(--sk-off))) rotate(90deg);
	}
	aside.right :global(svg) {
		transform: translateY(calc(var(--sk-len) - var(--sk-off))) rotate(-90deg);
		animation-name: trace-reverse;
	}
	/* Both sketches draw downward, finishing at the bottom of the screen.
	   The clip runs in the drawing's own space, and the right sketch is
	   rotated the other way, so its reveal has to run the other way too. */
	@keyframes trace {
		from {
			clip-path: inset(0 100% 0 0);
		}
		to {
			clip-path: inset(0 0 0 0);
		}
	}
	@keyframes trace-reverse {
		from {
			clip-path: inset(0 0 0 100%);
		}
		to {
			clip-path: inset(0 0 0 0);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		aside :global(svg) {
			animation: none;
		}
	}
</style>
