<script>
	import { onMount } from 'svelte';

	let { src, caption = '' } = $props();
	let canvas = $state();

	onMount(() => {
		let gone = false;
		let gl;
		let is2 = false;
		let prog;
		let fillProg;
		let toneProg;
		let buf;
		let fillBuf;
		let quadBuf;
		let fillN = 0;
		let uMvp;
		let uFillMvp;
		let uInc;
		let uDist;
		let uAcc;
		let uByte;
		let uRes;
		let n = 0;
		let exports;
		let dirty = true;
		let dragging = false;
		let lastX = 0;
		let lastY = 0;
		let raf = 0;
		let accumTex = null;
		let accumFbo = null;
		let accumByte = false;
		let accumW = 0;
		let accumH = 0;

		const vs = `
			attribute vec3 a_p;
			uniform mat4 u_m;
			uniform float u_dist;
			void main() {
				vec4 p = u_m * vec4(a_p, 1.0);
				vec4 o = u_m * vec4(0.0, 0.0, 0.0, 1.0);
				if (p.z * o.w > o.z * p.w) {
					gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
					gl_PointSize = 0.0;
					return;
				}
				p.z -= 0.0015 * p.w;
				gl_Position = p;
				gl_PointSize = max(1.0, mix(2.8, 1.0, clamp((u_dist - 1.15) / 2.4, 0.0, 1.0)));
			}
		`;
		const fs = `
			precision highp float;
			uniform float u_inc;
			void main() {
				gl_FragColor = vec4(u_inc, 0.0, 0.0, 1.0);
			}
		`;
		const fillVs = `
			attribute vec3 a_p;
			uniform mat4 u_m;
			void main() {
				gl_Position = u_m * vec4(a_p, 1.0);
			}
		`;
		const fillFs = `
			precision mediump float;
			void main() {
				gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
			}
		`;
		const toneVs = `
			attribute vec2 a_p;
			varying vec2 v_uv;
			void main() {
				v_uv = a_p * 0.5 + 0.5;
				gl_Position = vec4(a_p, 0.0, 1.0);
			}
		`;
		const toneFs = `
			precision highp float;
			uniform sampler2D u_acc;
			uniform float u_byte;
			uniform vec2 u_res;
			varying vec2 v_uv;
			float asinh_(float x) {
				return log(x + sqrt(x * x + 1.0));
			}
			float countAt(vec2 uv) {
				float c = texture2D(u_acc, uv).r;
				if (u_byte > 0.5) c *= 255.0;
				return c;
			}
			void main() {
				float c = countAt(v_uv);
				if (c < 0.35) discard;
				vec2 px = 1.0 / u_res;
				float blur = c;
				blur += countAt(v_uv + vec2(px.x, 0.0));
				blur += countAt(v_uv + vec2(-px.x, 0.0));
				blur += countAt(v_uv + vec2(0.0, px.y));
				blur += countAt(v_uv + vec2(0.0, -px.y));
				blur *= 0.2;
				float y = asinh_(8.0 * c / 110.0) / 8.0;
				float base = 0.50 + 0.30 * clamp(y / 0.80, 0.0, 1.0);
				float detail = 0.28 * (log(1.0 + c) - log(1.0 + blur));
				float a = clamp(base + detail, 0.20, 0.86);
				gl_FragColor = vec4(0.212, 0.239, 0.302, a);
			}
		`;

		function compile(type, src) {
			const s = gl.createShader(type);
			gl.shaderSource(s, src);
			gl.compileShader(s);
			return s;
		}

		function link(vert, frag) {
			const p = gl.createProgram();
			gl.attachShader(p, compile(gl.VERTEX_SHADER, vert));
			gl.attachShader(p, compile(gl.FRAGMENT_SHADER, frag));
			gl.bindAttribLocation(p, 0, 'a_p');
			gl.linkProgram(p);
			return p;
		}

		function unitSphere(seg, ring) {
			const out = [];
			const pt = (i, j) => {
				const u = (i / seg) * Math.PI * 2;
				const v = (j / ring) * Math.PI - Math.PI / 2;
				const c = Math.cos(v);
				return [c * Math.cos(u), Math.sin(v), c * Math.sin(u)];
			};
			for (let j = 0; j < ring; j++) {
				for (let i = 0; i < seg; i++) {
					const a = pt(i, j);
					const b = pt(i + 1, j);
					const c = pt(i + 1, j + 1);
					const d = pt(i, j + 1);
					out.push(...a, ...b, ...c, ...a, ...c, ...d);
				}
			}
			return new Float32Array(out);
		}

		function destroyAccum() {
			if (!gl) return;
			if (accumTex) gl.deleteTexture(accumTex);
			if (accumFbo) gl.deleteFramebuffer(accumFbo);
			accumTex = null;
			accumFbo = null;
			accumW = 0;
			accumH = 0;
		}

		function createAccum(w, h) {
			destroyAccum();
			const tex = gl.createTexture();
			const fbo = gl.createFramebuffer();
			gl.bindTexture(gl.TEXTURE_2D, tex);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

			const tries = [];
			if (is2) {
				gl.getExtension('EXT_color_buffer_float');
				gl.getExtension('EXT_color_buffer_half_float');
				gl.getExtension('EXT_float_blend');
				tries.push({ ifmt: gl.RGBA16F, fmt: gl.RGBA, type: gl.HALF_FLOAT, byte: false });
				tries.push({ ifmt: gl.R16F, fmt: gl.RED, type: gl.HALF_FLOAT, byte: false });
				tries.push({ ifmt: gl.RGBA32F, fmt: gl.RGBA, type: gl.FLOAT, byte: false });
			} else {
				const hf = gl.getExtension('OES_texture_half_float');
				gl.getExtension('OES_texture_float');
				gl.getExtension('EXT_color_buffer_half_float');
				gl.getExtension('WEBGL_color_buffer_float');
				if (hf) tries.push({ ifmt: gl.RGBA, fmt: gl.RGBA, type: hf.HALF_FLOAT_OES, byte: false });
				tries.push({ ifmt: gl.RGBA, fmt: gl.RGBA, type: gl.FLOAT, byte: false });
			}
			tries.push({
				ifmt: is2 ? gl.RGBA8 : gl.RGBA,
				fmt: gl.RGBA,
				type: gl.UNSIGNED_BYTE,
				byte: true
			});

			let ok = false;
			for (const t of tries) {
				gl.texImage2D(gl.TEXTURE_2D, 0, t.ifmt, w, h, 0, t.fmt, t.type, null);
				gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
				gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
				if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE) {
					accumByte = t.byte;
					ok = true;
					break;
				}
			}
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			if (!ok) {
				gl.deleteTexture(tex);
				gl.deleteFramebuffer(fbo);
				return;
			}
			accumTex = tex;
			accumFbo = fbo;
			accumW = w;
			accumH = h;
		}

		function size() {
			if (!canvas || !gl) return;
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			const css = canvas.clientWidth || canvas.parentElement?.clientWidth || 675;
			const w = Math.max(2, Math.round(css * dpr));
			const h = w;
			if (canvas.width !== w || canvas.height !== h) {
				canvas.width = w;
				canvas.height = h;
			}
			if (accumW !== w || accumH !== h) createAccum(w, h);
			if (exports) {
				exports.setAspect(1);
				exports.update();
			}
			dirty = true;
		}

		function draw() {
			if (gone || !gl || !exports || !n || !dirty || !accumFbo) return;
			exports.update();
			const mvp = new Float32Array(exports.memory.buffer, exports.mvpPtr(), 16);
			const dist = exports.getDist();
			const w = canvas.width;
			const h = canvas.height;

			gl.bindFramebuffer(gl.FRAMEBUFFER, accumFbo);
			gl.viewport(0, 0, w, h);
			gl.disable(gl.DEPTH_TEST);
			gl.disable(gl.DITHER);
			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.ONE, gl.ONE);
			gl.useProgram(prog);
			gl.uniformMatrix4fv(uMvp, false, mvp);
			gl.uniform1f(uInc, accumByte ? 1 / 255 : 1);
			gl.uniform1f(uDist, dist);
			gl.bindBuffer(gl.ARRAY_BUFFER, buf);
			gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
			gl.drawArrays(gl.POINTS, 0, n);

			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.viewport(0, 0, w, h);
			gl.clearColor(1, 254 / 255, 251 / 255, 1);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			gl.disable(gl.BLEND);
			gl.enable(gl.DEPTH_TEST);
			gl.useProgram(fillProg);
			gl.uniformMatrix4fv(uFillMvp, false, mvp);
			gl.bindBuffer(gl.ARRAY_BUFFER, fillBuf);
			gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
			gl.drawArrays(gl.TRIANGLES, 0, fillN);

			gl.disable(gl.DEPTH_TEST);
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
			gl.useProgram(toneProg);
			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, accumTex);
			gl.uniform1i(uAcc, 0);
			gl.uniform1f(uByte, accumByte ? 1 : 0);
			gl.uniform2f(uRes, w, h);
			gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
			gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
			dirty = false;
		}

		function loop() {
			if (gone) return;
			draw();
			raf = requestAnimationFrame(loop);
		}

		function onDown(e) {
			dragging = true;
			lastX = e.clientX;
			lastY = e.clientY;
			canvas.setPointerCapture(e.pointerId);
		}
		function onMove(e) {
			if (!dragging || !exports) return;
			const dx = e.clientX - lastX;
			const dy = e.clientY - lastY;
			lastX = e.clientX;
			lastY = e.clientY;
			exports.rotate(-dx * 0.008, dy * 0.008);
			dirty = true;
		}
		function onUp() {
			dragging = false;
		}
		function onWheel(e) {
			e.preventDefault();
			if (!exports) return;
			exports.zoom(Math.exp(e.deltaY * 0.0012));
			dirty = true;
		}

		(async () => {
			const { default: wasmUrl } = await import('$lib/sphere/sphere.wasm?url');
			const [wasmBuf, dataBuf] = await Promise.all([
				fetch(wasmUrl).then((r) => r.arrayBuffer()),
				fetch(src).then((r) => r.arrayBuffer())
			]);
			if (gone || !canvas) return;

			gl =
				canvas.getContext('webgl2', { alpha: false, antialias: false, depth: true }) ||
				canvas.getContext('webgl', { alpha: false, antialias: false, depth: true });
			if (!gl) return;
			is2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;

			const { instance } = await WebAssembly.instantiate(wasmBuf);
			if (gone) return;
			exports = instance.exports;

			n = dataBuf.byteLength >> 3;
			exports.setCount(n);
			new Uint8Array(exports.memory.buffer, exports.radecPtr(), dataBuf.byteLength).set(
				new Uint8Array(dataBuf)
			);
			exports.buildXyz();

			fillProg = link(fillVs, fillFs);
			uFillMvp = gl.getUniformLocation(fillProg, 'u_m');
			const mesh = unitSphere(48, 24);
			fillN = mesh.length / 3;
			fillBuf = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, fillBuf);
			gl.bufferData(gl.ARRAY_BUFFER, mesh, gl.STATIC_DRAW);

			prog = link(vs, fs);
			uMvp = gl.getUniformLocation(prog, 'u_m');
			uInc = gl.getUniformLocation(prog, 'u_inc');
			uDist = gl.getUniformLocation(prog, 'u_dist');
			buf = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, buf);
			gl.bufferData(
				gl.ARRAY_BUFFER,
				new Float32Array(exports.memory.buffer, exports.xyzPtr(), n * 3),
				gl.STATIC_DRAW
			);

			toneProg = link(toneVs, toneFs);
			uAcc = gl.getUniformLocation(toneProg, 'u_acc');
			uByte = gl.getUniformLocation(toneProg, 'u_byte');
			uRes = gl.getUniformLocation(toneProg, 'u_res');
			quadBuf = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
			gl.bufferData(
				gl.ARRAY_BUFFER,
				new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
				gl.STATIC_DRAW
			);

			gl.enableVertexAttribArray(0);
			gl.depthFunc(gl.LEQUAL);
			gl.disable(gl.DITHER);

			size();
			loop();
		})();

		const ro = new ResizeObserver(size);
		ro.observe(canvas);
		canvas.addEventListener('pointerdown', onDown);
		canvas.addEventListener('pointermove', onMove);
		canvas.addEventListener('pointerup', onUp);
		canvas.addEventListener('pointercancel', onUp);
		canvas.addEventListener('wheel', onWheel, { passive: false });

		return () => {
			gone = true;
			cancelAnimationFrame(raf);
			ro.disconnect();
			canvas.removeEventListener('pointerdown', onDown);
			canvas.removeEventListener('pointermove', onMove);
			canvas.removeEventListener('pointerup', onUp);
			canvas.removeEventListener('pointercancel', onUp);
			canvas.removeEventListener('wheel', onWheel);
			if (gl) {
				destroyAccum();
				gl.bindBuffer(gl.ARRAY_BUFFER, null);
				if (buf) gl.deleteBuffer(buf);
				if (fillBuf) gl.deleteBuffer(fillBuf);
				if (quadBuf) gl.deleteBuffer(quadBuf);
				if (prog) gl.deleteProgram(prog);
				if (fillProg) gl.deleteProgram(fillProg);
				if (toneProg) gl.deleteProgram(toneProg);
			}
		};
	});
</script>

<figure>
	<canvas
		bind:this={canvas}
		width="800"
		height="800"
		aria-label={caption || 'Interactive celestial sphere of the VarWISE Extended Catalog'}
	></canvas>
	{#if caption}<figcaption>{caption}</figcaption>{/if}
</figure>

<style>
	figure {
		margin: 2.5rem 0;
	}
	canvas {
		display: block;
		width: 100%;
		aspect-ratio: 1;
		background: var(--bg);
		cursor: grab;
		touch-action: none;
	}
	canvas:active {
		cursor: grabbing;
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
