<script>
	import '../app.css';
	import { onMount } from 'svelte';
	import { onNavigate } from '$app/navigation';
	import Sketch from '$lib/Sketch.svelte';
	import sf from '$lib/sketches/sf.svg?raw';
	import la from '$lib/sketches/la.svg?raw';
	let { children } = $props();

	// once this page's own assets are in, start on everyone else's
	onMount(() => {
		const run = () => import('$lib/preload.js').then((m) => m.warmup());
		const start = () =>
			'requestIdleCallback' in window
				? requestIdleCallback(run, { timeout: 2000 })
				: setTimeout(run, 0);
		if (document.readyState === 'complete') {
			start();
			return;
		}
		addEventListener('load', start, { once: true });
		return () => removeEventListener('load', start);
	});

	// quick crossfade between pages; the sketches and footer are named
	// below so they hold still while the column changes
	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<Sketch svg={sf} side="left" />
<Sketch svg={la} side="right" delay={300} />

{@render children()}

<footer>
	<p><a href="mailto:mpaz@mit.edu">mpaz [at] mit [dot] edu</a></p>
</footer>

<style>
	footer {
		/* inset past the fixed sketch strips so their background never
		   paints over the sketches, which must reach the true bottom
		   of the screen. padding-bottom eats the iOS safe area so the
		   bar itself always fills to the viewport edge */
		position: fixed;
		right: var(--sk-w);
		bottom: 0;
		left: var(--sk-w);
		z-index: 2;
		padding: var(--footer-pad-y) 2rem;
		padding-bottom: max(var(--footer-pad-y), env(safe-area-inset-bottom, 0px));
		background: var(--bg);
		view-transition-name: footer;
	}
	p {
		margin: 0;
		color: var(--muted);
		font-size: var(--text-caption);
		text-align: center;
	}
	a {
		text-decoration: none;
	}
	a:hover {
		color: var(--hover);
		text-decoration: underline;
		text-decoration-color: var(--border);
	}
	span {
		padding: 0 0.35rem;
		color: var(--border);
	}

	@media (max-width: 67rem) {
		footer {
			/* sketches are hidden below this breakpoint, so the footer can
			   go back to spanning the full width */
			left: 0;
			right: 0;
			padding-inline: 1.5rem;
		}
	}
</style>
