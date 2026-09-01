// Camera + RA/Dec → unit-sphere XYZ for the VarWISE viewer.
// Rebuild: npx --yes --package assemblyscript@0.27.35 asc src/lib/sphere/sphere.ts \
//   -o src/lib/sphere/sphere.wasm --optimize --runtime stub --initialMemory 700 --maximumMemory 700 --use abort=

const MVP: usize = 0;
const RADEC: usize = 65536;

let count: i32 = 0;
let xyzOff: usize = 0;
const FOVY: f32 = 0.72;
// unit-sphere limb is asin(1/d); keep it inside fovy/2 with ~12% pad
const DIST0: f32 = 3.4;

let yaw: f32 = 2.85;
let pitch: f32 = 0.42;
let dist: f32 = DIST0;
let aspect: f32 = 1.0;

export function radecPtr(): i32 {
	return RADEC as i32;
}

export function xyzPtr(): i32 {
	return xyzOff as i32;
}

export function mvpPtr(): i32 {
	return MVP as i32;
}

export function getCount(): i32 {
	return count;
}

export function setCount(n: i32): void {
	count = n;
	xyzOff = (RADEC + ((n as usize) << 3) + 15) & ~15;
}

export function setAspect(a: f32): void {
	aspect = a > 0.2 ? a : 1.0;
}

export function rotate(dx: f32, dy: f32): void {
	yaw = yaw + dx;
	pitch = Mathf.max(-1.52 as f32, Mathf.min(1.52 as f32, pitch + dy));
}

export function getDist(): f32 {
	return dist;
}

export function zoom(factor: f32): void {
	dist = dist * factor;
	// stay outside the unit sphere; angular scale is unbounded as dist → 1
	if (dist < (1.02 as f32)) dist = 1.02;
}

export function buildXyz(): void {
	const src = RADEC;
	const dst = xyzOff;
	const n = count;
	const deg: f32 = Mathf.PI / (180.0 as f32);
	for (let i: i32 = 0; i < n; i++) {
		const o = (i as usize) << 3;
		const ra = load<f32>(src + o) * deg;
		const dec = load<f32>(src + o + 4) * deg;
		const cd = Mathf.cos(dec);
		const p = dst + (i as usize) * 12;
		store<f32>(p, cd * Mathf.cos(ra));
		store<f32>(p + 4, Mathf.sin(dec));
		store<f32>(p + 8, cd * Mathf.sin(ra));
	}
}

function storeM(i: i32, v: f32): void {
	store<f32>(MVP + (i << 2), v);
}

export function update(): void {
	const cy = Mathf.cos(yaw);
	const sy = Mathf.sin(yaw);
	const cp = Mathf.cos(pitch);
	const sp = Mathf.sin(pitch);

	const ex: f32 = sy * cp * dist;
	const ey: f32 = sp * dist;
	const ez: f32 = cy * cp * dist;

	let fx: f32 = -ex;
	let fy: f32 = -ey;
	let fz: f32 = -ez;
	const fl: f32 = 1.0 / Mathf.sqrt(fx * fx + fy * fy + fz * fz);
	fx = fx * fl;
	fy = fy * fl;
	fz = fz * fl;

	let rx: f32 = -fz;
	const ry: f32 = 0.0;
	let rz: f32 = fx;
	let rl: f32 = Mathf.sqrt(rx * rx + rz * rz);
	if (rl < (1e-5 as f32)) {
		rx = 1.0;
		rz = 0.0;
		rl = 1.0;
	}
	rx = rx / rl;
	rz = rz / rl;

	const ux: f32 = ry * fz - rz * fy;
	const uy: f32 = rz * fx - rx * fz;
	const uz: f32 = rx * fy - ry * fx;

	const v0: f32 = rx;
	const v1: f32 = ux;
	const v2: f32 = -fx;
	const v4: f32 = ry;
	const v5: f32 = uy;
	const v6: f32 = -fy;
	const v8: f32 = rz;
	const v9: f32 = uz;
	const v10: f32 = -fz;
	const v12: f32 = -(rx * ex + ry * ey + rz * ez);
	const v13: f32 = -(ux * ex + uy * ey + uz * ez);
	const v14: f32 = fx * ex + fy * ey + fz * ez;

	const fovy: f32 = FOVY;
	const ad: f32 = Mathf.abs(dist);
	const near: f32 = Mathf.max(0.002 as f32, ad - (1.2 as f32));
	const far: f32 = ad + (1.2 as f32);
	const f: f32 = 1.0 / Mathf.tan(fovy * 0.5);
	const nf: f32 = 1.0 / (near - far);
	const p0: f32 = f / aspect;
	const p5: f32 = f;
	const p10: f32 = (far + near) * nf;
	const p11: f32 = -1.0;
	const p14: f32 = (2.0 as f32) * far * near * nf;

	storeM(0, p0 * v0);
	storeM(1, p5 * v1);
	storeM(2, p10 * v2);
	storeM(3, p11 * v2);
	storeM(4, p0 * v4);
	storeM(5, p5 * v5);
	storeM(6, p10 * v6);
	storeM(7, p11 * v6);
	storeM(8, p0 * v8);
	storeM(9, p5 * v9);
	storeM(10, p10 * v10);
	storeM(11, p11 * v10);
	storeM(12, p0 * v12);
	storeM(13, p5 * v13);
	storeM(14, p10 * v14 + p14);
	storeM(15, p11 * v14);
}
