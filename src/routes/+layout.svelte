<script>
	import '../app.css';
	import { onMount } from 'svelte';
	import { afterNavigate, onNavigate } from '$app/navigation';
	import Sketch from '$lib/Sketch.svelte';
	import sf from '$lib/sketches/sf.svg?raw';
	import la from '$lib/sketches/la.svg?raw';
	let { children } = $props();

	let progress = $state(0);

	function measure() {
		const max = document.documentElement.scrollHeight - window.innerHeight;
		progress = max > 0 ? window.scrollY / max : 0;
	}

	onMount(() => {
		measure();
		addEventListener('scroll', measure, { passive: true });
		addEventListener('resize', measure);
		return () => {
			removeEventListener('scroll', measure);
			removeEventListener('resize', measure);
		};
	});

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

	afterNavigate(() => requestAnimationFrame(measure));

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

<Sketch svg={sf} side="left" {progress} />
<Sketch svg={la} side="right" delay={300} {progress} />

{@render children()}

<footer>
	<p><a href="mailto:mpaz@mit.edu">mpaz [at] mit [dot] edu</a></p>
</footer>

<style>
	footer {
		/* inset past the fixed sketch strips so their background never
		   paints over the sketches, which must reach the true bottom
		   of the screen */
		position: fixed;
		right: var(--sk-w);
		bottom: 0;
		left: var(--sk-w);
		z-index: 2;
		padding: 0.9rem 2rem;
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
