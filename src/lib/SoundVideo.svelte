<script>
	import { onMount } from 'svelte';
	import Frame from '$lib/Frame.svelte';

	let { src, frame = true } = $props();
	let muted = $state(true);
	let toggleEl;
	let shake = $state(false);

	onMount(() => {
		const el = toggleEl;
		if (!el) return;
		const io = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				shake = true;
				io.disconnect();
			},
			{ threshold: 0.6 }
		);
		io.observe(el);
		return () => io.disconnect();
	});
</script>

{#snippet media()}
	<video {src} autoplay bind:muted loop playsinline></video>
{/snippet}

<!-- The button lives outside <Frame> so the frame's clip path doesn't cut
     into it at the corners. -->
<span class="sound-video">
	{#if frame}
		<Frame>{@render media()}</Frame>
	{:else}
		{@render media()}
	{/if}
	<button
		type="button"
		class="sound-toggle"
		class:shake
		bind:this={toggleEl}
		onclick={() => (muted = !muted)}
		aria-label={muted ? 'Unmute video' : 'Mute video'}
	>
		<svg class="icon" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
			<!-- speaker cone, shared by both states -->
			<path d="M12.4 3.2a.9.9 0 0 1 .6.85v15.9a.9.9 0 0 1-1.5.67L6.6 16.2H3.6a1.6 1.6 0 0 1-1.6-1.6V9.4a1.6 1.6 0 0 1 1.6-1.6h3l4.9-4.42a.9.9 0 0 1 .9-.18Z" />
			{#if muted}
				<path
					d="M16.3 9.05a.85.85 0 0 1 1.2 0L19 10.55l1.5-1.5a.85.85 0 1 1 1.2 1.2L20.2 11.75l1.5 1.5a.85.85 0 0 1-1.2 1.2L19 12.95l-1.5 1.5a.85.85 0 1 1-1.2-1.2l1.5-1.5-1.5-1.5a.85.85 0 0 1 0-1.2Z"
				/>
			{:else}
				<path
					d="M16.5 8.3a.85.85 0 0 1 1.2.06 5.5 5.5 0 0 1 0 7.28.85.85 0 1 1-1.26-1.14 3.8 3.8 0 0 0 0-5A.85.85 0 0 1 16.5 8.3Zm3-2.75a.85.85 0 0 1 1.2.05 9.3 9.3 0 0 1 0 12.8.85.85 0 1 1-1.25-1.15 7.6 7.6 0 0 0 0-10.5.85.85 0 0 1 .05-1.2Z"
				/>
			{/if}
		</svg>
	</button>
</span>

<style>
	.sound-video {
		position: relative;
		display: block;
		width: 100%;
	}
	.sound-video video {
		display: block;
		width: 100%;
	}
	.sound-toggle {
		position: absolute;
		top: 0.7rem;
		right: 0.8rem;
		margin: 0;
		padding: 0;
		border: none;
		background: none;
		color: #fff;
		font: inherit;
		line-height: 0;
		opacity: 0.85;
		cursor: pointer;
	}
	.icon {
		display: block;
		width: 1.65rem;
		height: 1.65rem;
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.35));
	}
	.sound-toggle:hover,
	.sound-toggle:focus-visible {
		opacity: 1;
	}
	.sound-toggle.shake {
		animation: shake 0.55s 0.25s ease-in-out;
	}
	@keyframes shake {
		0%,
		100% {
			transform: rotate(0);
		}
		20% {
			transform: rotate(-14deg);
		}
		40% {
			transform: rotate(12deg);
		}
		60% {
			transform: rotate(-8deg);
		}
		80% {
			transform: rotate(5deg);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.sound-toggle.shake {
			animation: none;
		}
	}
</style>
