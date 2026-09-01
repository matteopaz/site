import { sveltekit } from '@sveltejs/kit/vite';

export default {
	plugins: [sveltekit()],
	assetsInclude: ['**/*.mov', '**/*.mp4', '**/*.bin', '**/*.wasm']
};
