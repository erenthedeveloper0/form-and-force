# Creative coding: visuals made in code

Drawings, generated surfaces, canvas, WebGL, shaders and 3D. How to decide whether one belongs, how to derive it from the subject, how to build it so it survives production, and what it falls back to.

## Contents
1. When a coded visual is the right medium
2. The ladder of means
3. A rule from the subject
4. SVG: drawings, patterns, filters
5. Canvas 2D
6. Fragment shaders without a library
7. three.js and React Three Fiber
8. Objects and product scenes
9. Scroll-linked scenes
10. Pointer and cursor systems
11. Budgets, fallbacks and accessibility
12. Testing

---

## 1. When a coded visual is the right medium

A coded visual belongs when it does one of these jobs better than any still image could:

| Job | Example of the job (not of a look) |
|---|---|
| **Shows a mechanism** | The way the thing works is visible because it is running |
| **Is the material** | A surface that behaves as the subject's material behaves |
| **Responds** | It changes with the visitor's input in a way that teaches or reveals |
| **Never repeats** | A system whose variety is the point: a pattern, a field, a weather |
| **Is driven by something real** | Data, time, place or the content itself sets its parameters |
| **Is the world** | In the Radical register, the scene is the site |

It does not belong when the honest reason is "to look advanced". Test it: replace the canvas with a well-chosen still frame of itself. If nothing of meaning is lost, ship the still. WebGL is a medium. It is not a measure of creativity, and a page with none can outrank a page full of it.

Register sets the default expectation, not a limit: Quiet almost never needs it; Composed may use one purposeful piece; Expressive and Radical may be built on it. In every register it needs a job from the table.

## 2. The ladder of means

Use the lowest rung that carries the device. Each step up costs bytes, battery, fallbacks and testing.

| Rung | Good for | Cost |
|---|---|---|
| **CSS** (gradients, masks, blend modes, `@property`, clip-path, 3D transforms) | Surfaces, simple generative patterns, light, layered depth | Lowest; runs off the main thread when animated by transform or opacity |
| **SVG** | Drawings, diagrams, line animation, patterns, small filters | Low; DOM cost grows with node count |
| **Canvas 2D** | Thousands of simple marks, particles, image processing, pixel work | One element; main-thread drawing |
| **A fragment shader on one triangle** | Full-surface fields, noise, materials, image distortion and transitions | A few kilobytes with no library; GPU cost per pixel |
| **A 3D library** (three.js, OGL) | Real geometry, models, cameras, lighting | Large bundle; lifecycle and fallbacks become real work |

A single shader needs no library (§6). Reach for three.js when there is geometry or a model.

## 3. A rule from the subject

A generated visual is a rule plus parameters. Take both from facts ([direction.md](direction.md) §2), so the result belongs to this project and to no other.

- **Geometry from the subject's own shapes:** a plan, a weave, a contour, a waveform, a cross-section, a route.
- **Parameters from measures:** a count becomes density, a duration becomes period, a tolerance becomes jitter, a ratio becomes proportion.
- **Seeds from identity:** seed the randomness from a real string (a product code, a date, a name) so each item has its own stable pattern.
- **Input from reality:** the time of day, live data, the content being read, the visitor's own input.
- **Behaviour from the material:** how it flows, settles, folds or scatters (the Material lenses).

State the rule in one sentence beside the device: "Each of the 212 members is one stroke; stroke length is their years of membership." A rule that cannot be stated is decoration.

Generic noise is the shader equivalent of a purple gradient. Flowing blobs, particle clouds that form a logo, and neon grids have no subject. If the visual would suit another company unchanged, it has no rule.

## 4. SVG: drawings, patterns, filters

- **Draw for the subject.** A diagram of the real mechanism, a plan at a real scale, a map of real places. Keep `viewBox` units meaningful (millimetres, minutes, metres) so the drawing can be driven by data.
- **Line drawing:** set `pathLength="1"` on the path, then animate `stroke-dashoffset` from 1 to 0. No measuring in script.
```css
.line { stroke-dasharray: 1; stroke-dashoffset: 1; transition: stroke-dashoffset var(--dur-scene) var(--ease-enter); }
.is-drawn .line { stroke-dashoffset: 0; }
@media (prefers-reduced-motion: reduce) { .line { stroke-dashoffset: 0; transition: none; } }
```
- **Patterns:** `<pattern>` for true repeats; for generated ones, emit the SVG at build time or once on load, not every frame.
- **Filters** (`feTurbulence`, `feDisplacementMap`, `feColorMatrix`) are powerful and paint-expensive. Use them on small areas or pre-render. Animating a full-screen filter is a common cause of jank.
- **Text stays text:** use `<text>` or HTML overlays, not outlined paths, for anything that should be read or translated.
- **Accessibility:** a meaningful graphic takes `role="img"` and a `<title>`; data graphics need a text or table equivalent; decorative ones take `aria-hidden="true"`.
- Keep node counts in the hundreds. Beyond a few thousand, move to canvas.

## 5. Canvas 2D

```js
export function mountCanvas(canvas, draw) {
  const ctx = canvas.getContext('2d');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let raf = 0, visible = true;
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(canvas.clientWidth * dpr);
    canvas.height = Math.round(canvas.clientHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);                  // draw in CSS pixels
  };
  const frame = (t) => {
    draw(ctx, canvas.clientWidth, canvas.clientHeight, reduce.matches ? 0 : t / 1000);
    if (visible && !document.hidden && !reduce.matches) raf = requestAnimationFrame(frame);
  };
  const wake = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); };
  const ro = new ResizeObserver(() => { resize(); wake(); });
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) wake(); });
  ro.observe(canvas); io.observe(canvas);
  document.addEventListener('visibilitychange', wake);
  reduce.addEventListener('change', wake);
  resize(); wake();
  return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); document.removeEventListener('visibilitychange', wake); reduce.removeEventListener('change', wake); };
}
```

- The canvas is sized by CSS; the backing store follows it, capped at a device pixel ratio of 2.
- The loop stops when the canvas is off screen, when the tab is hidden, and under reduced motion (one still frame is drawn).
- Keep allocations out of `draw`. Batch by style: one `beginPath`, many segments, one `stroke`.
- For a static result (a generated poster, a dithered image), draw once and stop. Most "generative" work does not need to move.
- Image processing (halftone, dither, threshold, pixel sort): draw the image small, read it with `getImageData`, draw marks at full size. Do it once per image and cache.
- Put the same information in the DOM: a canvas is opaque to assistive technology and to search.

## 6. Fragment shaders without a library

One triangle covers the screen and a fragment shader colours every pixel. This is enough for fields, materials, gradients with life, and image effects.

```js
export function mountShader(canvas, fragment, { maxDpr = 2 } = {}) {
  const gl = canvas.getContext('webgl', { antialias: false, powerPreference: 'low-power' });
  if (!gl) return null;                                        // the caller keeps its CSS fallback
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    return shader;
  };
  const header = 'precision mediump float; uniform vec2 u_res; uniform float u_time; uniform vec2 u_pointer; uniform float u_scroll;\n';
  const vs = compile(gl.VERTEX_SHADER, 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }');
  const fs = compile(gl.FRAGMENT_SHADER, header + fragment);
  const program = gl.createProgram();
  gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program); gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const at = gl.getAttribLocation(program, 'p');
  gl.enableVertexAttribArray(at); gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0);
  const u = Object.fromEntries(['res', 'time', 'pointer', 'scroll'].map((n) => [n, gl.getUniformLocation(program, 'u_' + n)]));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let raf = 0, visible = true, pointer = [0.5, 0.5];
  const frame = (now) => {
    const dpr = Math.min(devicePixelRatio || 1, maxDpr);
    const w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl.viewport(0, 0, w, h); }
    gl.uniform2f(u.res, w, h);
    gl.uniform1f(u.time, reduce.matches ? 0 : now / 1000);
    gl.uniform2f(u.pointer, pointer[0], pointer[1]);
    gl.uniform1f(u.scroll, scrollY / innerHeight);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    if (visible && !document.hidden && !reduce.matches) raf = requestAnimationFrame(frame);
  };
  const wake = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); };
  const onPointer = (e) => { const r = canvas.getBoundingClientRect(); pointer = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height]; };
  const onLost = (e) => { e.preventDefault(); cancelAnimationFrame(raf); canvas.dataset.lost = 'true'; };   // style [data-lost] to show the fallback
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) wake(); });
  const ro = new ResizeObserver(wake);
  io.observe(canvas); ro.observe(canvas);
  addEventListener('pointermove', onPointer, { passive: true });
  document.addEventListener('visibilitychange', wake);
  reduce.addEventListener('change', wake);
  canvas.addEventListener('webglcontextlost', onLost);
  wake();
  return () => {
    cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
    removeEventListener('pointermove', onPointer); document.removeEventListener('visibilitychange', wake);
    reduce.removeEventListener('change', wake); canvas.removeEventListener('webglcontextlost', onLost);
    gl.deleteBuffer(buffer); gl.deleteProgram(program); gl.deleteShader(vs); gl.deleteShader(fs);
  };
}
```

A fragment to start from. It is a structure, not a look: the rule, the scale and both colours must come from the project.

```glsl
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
void main() {
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = vec2(uv.x * u_res.x / u_res.y, uv.y);
  float n = 0.6 * noise(p * 3.0 + vec2(0.0, u_time * 0.05)) + 0.4 * noise(p * 9.0 - u_time * 0.02);
  vec3 ground = vec3(0.93, 0.91, 0.86), ink = vec3(0.13, 0.15, 0.20);     // the colour system's ground and ink
  gl_FragColor = vec4(mix(ground, ink, smoothstep(0.35, 0.65, n)), 1.0);
}
```

Notes:
- **Fallback first.** Give the canvas a CSS background that approximates the settled frame (a gradient or a poster image). It shows while the script loads, when WebGL is unavailable, when the context is lost and when the code throws.
- **Images in shaders:** upload as a texture, sample with `texture2D`, and distort the lookup coordinates (displacement on hover, a wipe between two images driven by a noise threshold). Wait for `img.decode()`; set `UNPACK_FLIP_Y_WEBGL`; keep the real `<img>` in the DOM for accessibility, LCP and no-WebGL.
- **Colour:** pass the system's colours in as uniforms so the shader follows theme changes.
- **Cost** is per pixel. Lower the device pixel ratio cap before simplifying the shader; full-screen surfaces on phones often want a cap of 1 or 1.5.
- **Precision:** `mediump` is enough for most fields; request `highp` only when banding or stepping is visible, and check support.

## 7. three.js and React Three Fiber

three.js never frees GPU memory for you. Everything created is disposed in cleanup.

```tsx
useEffect(() => {
  const canvas = ref.current!;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  /* ...build the scene... */
  const ro = new ResizeObserver(([e]) => {
    const { width, height } = e.contentRect;
    renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix();
  });
  ro.observe(canvas);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let raf = 0, running = !document.hidden;
  const tick = (t: number) => { if (!reduce) { /* advance the scene */ } renderer.render(scene, camera); if (running && !reduce) raf = requestAnimationFrame(tick); };
  const onVis = () => { running = !document.hidden; cancelAnimationFrame(raf); if (running) raf = requestAnimationFrame(tick); };
  document.addEventListener("visibilitychange", onVis);
  raf = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(raf); document.removeEventListener("visibilitychange", onVis); ro.disconnect();
    scene.traverse((o: any) => {
      o.geometry?.dispose?.();
      const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
      for (const m of mats) { for (const v of Object.values(m)) (v as any)?.isTexture && (v as any).dispose(); m.dispose(); }
    });
    renderer.dispose();
  };
}, []);
```

- `scene.remove()` frees nothing. Dispose geometries, materials, textures, render targets, post-processing passes and controls. Close `ImageBitmap`s yourself.
- Check `renderer.info.memory` and `renderer.info.programs` across a mount, unmount and remount. They must not grow.
- **React Three Fiber:** `<Canvas dpr={[1, 2]} frameloop="demand">` for scenes that are mostly still, with `invalidate()` on change. Objects declared in JSX are disposed on unmount; anything created by hand (render targets, textures held in refs) is yours to dispose. Keep allocations out of `useFrame`.
- Load the library and the scene lazily, after a poster is on screen, and only near the viewport.
- Verify API details against the installed version.

## 8. Objects and product scenes

- **Lighting is the art direction.** One key light with a decided position, a fill, an environment that belongs to the subject. Default lighting makes every product look like a configurator demo.
- **Camera with intent.** A long lens (a narrow field of view) flatters objects. Choose two or three views and move between them; free orbiting is rarely the best experience.
- **Pipeline:** glTF with mesh compression (Draco or Meshopt) and KTX2 textures. Budget the model's download like an image.
- **Poster first.** A still render is the LCP element and the fallback. The live scene replaces it when ready.
- **Movement needs a reason:** show a hidden side, a mechanism, a material catching light. An object that spins idly is decoration.
- **Controls:** drag to turn with pointer capture and inertia, keyboard equivalents, and a visible way to reset. Never trap page scroll inside the canvas.

## 9. Scroll-linked scenes

- Read scroll once per frame in the render loop, not in a scroll handler. Map the section's progress (0 to 1) to a uniform or a camera parameter.
- Smooth the mapped value toward its target (`value += (target - value) * 0.12` per frame) so input stays responsive and the picture does not stutter. The page itself scrolls natively.
- Hold the canvas with `position: sticky` inside a tall wrapper (the Stage structure, [composition.md](composition.md)). Text scrolls over or beside it as real DOM.
- Every state the scroll passes through is reachable without the canvas: the same content exists in order in the markup.
- Under reduced motion, show the key states as stills in sequence.
- Phones get a shorter range and a cheaper scene. Decide it; do not just let it run slowly.

Direction of scroll scenes (beats, holds, cuts) is in [motion-direction.md](motion-direction.md).

## 10. Pointer and cursor systems

A custom cursor or pointer-reactive visual is justified when the pointer is a tool in the concept: a light, a lens, a brush, a probe, a way of selecting.

- Follow with a spring or a damped value, never by setting position directly from the event.
- Keep the system cursor's affordances: a text cursor over text, a pointer over links, or a clearly equivalent state.
- Fine pointers only (`(hover: hover) and (pointer: fine)`). Touch, pen and keyboard get the designed resting state, and nothing essential depends on the effect.
- Hide nothing behind it. Information revealed only under a moving pointer does not exist for many visitors.
- Off under reduced motion.

## 11. Budgets, fallbacks and accessibility

| Concern | Rule |
|---|---|
| **Contexts** | As few as possible; browsers cap live WebGL contexts. One shared canvas beats many. |
| **Pixel ratio** | Cap at 2; lower on full-screen surfaces and on phones |
| **Frame time** | Hold 60 fps on a mid-range phone, or reduce: resolution first, then effects, then frame rate |
| **Off screen and hidden tabs** | Stop the loop |
| **Loading** | Poster or CSS fallback first; the script after first paint; lazy-load near the viewport |
| **No WebGL, lost context, script error** | The fallback is already on screen. Nothing is blank. |
| **Reduced motion** | A chosen still frame, or the scene's key states as stills |
| **Save-Data, low memory, low battery** | Prefer the still (`navigator.connection?.saveData`, `navigator.deviceMemory`) |
| **Content** | Everything the visual says also exists as text in the DOM |
| **Focus and scroll** | The canvas never traps either; overlaid controls are real elements |
| **Semantics** | Headings, landmarks and links exist even when the canvas is the experience |

Performance targets and measurement are in [performance-engineering.md](performance-engineering.md); experimental-interface accessibility is in [accessibility.md](accessibility.md).

## 12. Testing

- Headless browsers render WebGL in software and can stall on heavy scenes. Check coded visuals in a headed browser and on a real phone as well, and say which you did.
- Use `audit_page.mjs` for the fallback states: run it with scripts failing or WebGL unavailable where you can, and with reduced motion (it captures that frame).
- Use `motion_strip.mjs --trigger scroll:<from>-<to>` to see a scroll scene as a sequence of stills.
- Mount, unmount and remount (or navigate away and back) and confirm memory does not grow and no second loop starts.
- Throttle the CPU four times and watch the frame rate and input delay.
