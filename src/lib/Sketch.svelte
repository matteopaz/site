<script>
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';

	let { svg, side = 'left', delay = 0 } = $props();
	let root;

	function apply() {
		if (!root) return;
		const max = document.documentElement.scrollHeight - window.innerHeight;
		root.style.setProperty('--progress', String(max > 0 ? window.scrollY / max : 0));
	}

	onMount(() => {
		let ticking = false;
		const onScroll = () => {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(() => {
				ticking = false;
				apply();
			});
		};
		apply();
		addEventListener('scroll', onScroll, { passive: true });
		addEventListener('resize', onScroll);
		return () => {
			removeEventListener('scroll', onScroll);
			removeEventListener('resize', onScroll);
		};
	});

	afterNavigate(() => requestAnimationFrame(apply));
</script>

<aside bind:this={root} class={side} style="--delay: {delay}ms">
	<div class="draw">{@html svg}</div>
	<div class="ink">
		<div class="draw">{@html svg}</div>
	</div>
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
	/* darker ink covers the drawing from the top down. height + overflow
	   is a rectangle clip, so Firefox can keep the SVG on one layer and
	   only move the clip as you scroll — clip-path on these paths was
	   causing the stutter */
	.ink {
		position: absolute;
		top: 0;
		right: 0;
		left: 0;
		height: calc(var(--progress, 0) * 100vh);
		overflow: clip;
		color: var(--title);
		contain: paint;
	}
	/* pin the ink drawing to the viewport, not the growing clip window,
	   so it stays registered with the lighter copy underneath */
	.ink .draw {
		bottom: auto;
		height: 100vh;
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
