<script module>
	let n = 0;
</script>

<script>
	let { children } = $props();

	const clipId = `frame-clip-${++n}`;

	const d =
		'M0.35,0.35 L4.49,0.42 L8.62,0.53 L12.76,0.54 L16.9,0.54 L21.04,0.51 L25.18,0.39 L29.31,0.39 L33.45,0.4 L37.59,0.45 L41.73,0.38 L45.86,0.38 L50.0,0.51 L54.14,0.49 L58.28,0.64 L62.41,0.83 L66.55,0.64 L70.69,0.54 L74.83,0.45 L78.96,0.39 L83.1,0.43 L87.24,0.45 L91.38,0.47 L95.51,0.39 L99.65,0.35 L99.56,4.49 L99.55,8.62 L99.55,12.76 L99.63,16.9 L99.64,21.04 L99.54,25.18 L99.55,29.31 L99.54,33.45 L99.58,37.59 L99.52,41.73 L99.42,45.86 L99.49,50.0 L99.43,54.14 L99.41,58.28 L99.48,62.41 L99.55,66.55 L99.59,70.69 L99.45,74.83 L99.43,78.96 L99.36,83.1 L99.48,87.24 L99.54,91.38 L99.63,95.51 L99.65,99.65 L95.51,99.6 L91.38,99.59 L87.24,99.52 L83.1,99.52 L78.96,99.43 L74.83,99.52 L70.69,99.47 L66.55,99.45 L62.41,99.56 L58.27,99.57 L54.14,99.44 L50.0,99.41 L45.86,99.52 L41.72,99.54 L37.59,99.43 L33.45,99.42 L29.31,99.32 L25.17,99.37 L21.04,99.46 L16.9,99.49 L12.76,99.63 L8.62,99.61 L4.49,99.6 L0.35,99.65 L0.41,95.51 L0.53,91.38 L0.54,87.24 L0.6,83.1 L0.51,78.96 L0.47,74.83 L0.39,70.69 L0.46,66.55 L0.43,62.41 L0.37,58.27 L0.46,54.14 L0.39,50.0 L0.53,45.86 L0.72,41.72 L0.74,37.59 L0.63,33.45 L0.68,29.31 L0.41,25.17 L0.43,21.04 L0.46,16.9 L0.54,12.76 L0.51,8.62 L0.44,4.49 L0.35,0.35 Z';
</script>

<span class="frame">
	<span class="media" style="clip-path: url(#{clipId})">
		{@render children?.()}
	</span>

	<svg
		class="shell"
		width="100%"
		height="100%"
		viewBox="0 0 100 100"
		preserveAspectRatio="none"
		aria-hidden="true"
	>
		<defs>
			<clipPath id={clipId} clipPathUnits="objectBoundingBox">
				<path transform="scale(0.01)" {d} />
			</clipPath>
		</defs>

		<path class="ink" {d} />
	</svg>
</span>

<style>
	.frame {
		position: relative;
		display: block;
		width: 100%;
		max-width: 100%;
		min-width: 0;
	}
	.shell {
		position: absolute;
		inset: 0;
		display: block;
		overflow: visible;
		pointer-events: none;
	}
	.media {
		display: block;
		width: 100%;
		margin: 0;
		padding: 0;
		line-height: 0;
	}
	.media :global(img),
	.media :global(video),
	.media :global(canvas) {
		display: block;
		width: 100%;
		height: auto;
	}
	.ink {
		fill: none;
		stroke: var(--title);
		stroke-width: 2.275;
		stroke-linecap: round;
		stroke-linejoin: round;
		vector-effect: non-scaling-stroke;
	}
</style>
