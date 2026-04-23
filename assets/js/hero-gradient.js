// ============================================================
// Homepage hero — animated mesh gradient
// Based on a Three.js shader pipeline with touch-reactive distortion.
// Scoped to a single hero container, respects reduced-motion,
// and self-destructs when the hero leaves the viewport.
// ============================================================

(function () {
  const container = document.getElementById('hero-canvas');
  if (!container) return;

  // Respect user motion preferences.
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    // Apply a static brand gradient fallback and bail.
    container.style.background =
      'radial-gradient(ellipse at 30% 20%, #D3968C 0%, transparent 55%), ' +
      'radial-gradient(ellipse at 70% 80%, #839958 0%, transparent 55%), ' +
      '#105666';
    return;
  }

  // Wait for THREE to be available (loaded via script tag).
  if (typeof THREE === 'undefined') {
    console.warn('Three.js not loaded; skipping hero animation.');
    return;
  }

  // ---------- Brand palette as normalized RGB ----------
  // CSS hex is 0–255; WebGL wants 0–1.
  const PALETTE = {
    clementine: [0.902, 0.318, 0.000],  // #E65100
    moss:       [0.514, 0.600, 0.345],  // #839958
    rosie:      [0.827, 0.588, 0.549],  // #D3968C
    midnight:   [0.063, 0.337, 0.400],  // #105666
    alabaster:  [0.976, 0.973, 0.816]   // #F9F8F0
  };

  // ---------- TouchTexture ----------
  class TouchTexture {
    constructor() {
      this.size = 64;
      this.maxAge = 64;
      this.radius = 0.25 * this.size;
      this.speed = 1 / this.maxAge;
      this.trail = [];
      this.last = null;

      this.canvas = document.createElement('canvas');
      this.canvas.width = this.canvas.height = this.size;
      this.ctx = this.canvas.getContext('2d');
      this.clear();
      this.texture = new THREE.Texture(this.canvas);
    }

    clear() {
      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(0, 0, this.size, this.size);
    }

    addTouch(point) {
      let force = 0, vx = 0, vy = 0;
      if (this.last) {
        const dx = point.x - this.last.x;
        const dy = point.y - this.last.y;
        if (dx === 0 && dy === 0) return;
        const dd = dx * dx + dy * dy;
        const d = Math.sqrt(dd);
        vx = dx / d; vy = dy / d;
        force = Math.min(dd * 20000, 2.0);
      }
      this.last = { x: point.x, y: point.y };
      this.trail.push({ x: point.x, y: point.y, age: 0, force, vx, vy });
    }

    update() {
      this.clear();
      for (let i = this.trail.length - 1; i >= 0; i--) {
        const p = this.trail[i];
        const f = p.force * this.speed * (1 - p.age / this.maxAge);
        p.x += p.vx * f;
        p.y += p.vy * f;
        p.age++;
        if (p.age > this.maxAge) this.trail.splice(i, 1);
        else this.drawPoint(p);
      }
      this.texture.needsUpdate = true;
    }

    drawPoint(point) {
      const pos = { x: point.x * this.size, y: (1 - point.y) * this.size };
      let intensity = 1;
      if (point.age < this.maxAge * 0.3) {
        intensity = Math.sin((point.age / (this.maxAge * 0.3)) * (Math.PI / 2));
      } else {
        const t = 1 - (point.age - this.maxAge * 0.3) / (this.maxAge * 0.7);
        intensity = -t * (t - 2);
      }
      intensity *= point.force;

      const color = `${((point.vx + 1) / 2) * 255}, ${((point.vy + 1) / 2) * 255}, ${intensity * 255}`;
      const offset = this.size * 5;
      this.ctx.shadowOffsetX = offset;
      this.ctx.shadowOffsetY = offset;
      this.ctx.shadowBlur = this.radius;
      this.ctx.shadowColor = `rgba(${color},${0.2 * intensity})`;
      this.ctx.beginPath();
      this.ctx.fillStyle = 'rgba(255,0,0,1)';
      this.ctx.arc(pos.x - offset, pos.y - offset, this.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  // ---------- Shader setup ----------
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      vUv = uv;
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec3 uColor1;  // clementine
    uniform vec3 uColor2;  // midnight
    uniform vec3 uColor3;  // moss
    uniform vec3 uColor4;  // rosie
    uniform vec3 uBase;    // midnight (base bg)
    uniform float uSpeed;
    uniform sampler2D uTouchTexture;
    varying vec2 vUv;

    // Six orbiting centers, each pulling toward one of the brand colors.
    void main() {
      vec2 uv = vUv;

      // Touch-driven distortion
      vec4 touch = texture2D(uTouchTexture, uv);
      float vx = -(touch.r * 2.0 - 1.0);
      float vy = -(touch.g * 2.0 - 1.0);
      float intensity = touch.b;
      uv.x += vx * 0.6 * intensity;
      uv.y += vy * 0.6 * intensity;

      float t = uTime * uSpeed;

      // Six gradient centers in slow orbital motion
      vec2 c1 = vec2(0.5 + sin(t * 0.40) * 0.40, 0.5 + cos(t * 0.50) * 0.40);
      vec2 c2 = vec2(0.5 + cos(t * 0.60) * 0.50, 0.5 + sin(t * 0.45) * 0.50);
      vec2 c3 = vec2(0.5 + sin(t * 0.35) * 0.45, 0.5 + cos(t * 0.55) * 0.45);
      vec2 c4 = vec2(0.5 + cos(t * 0.50) * 0.40, 0.5 + sin(t * 0.40) * 0.40);
      vec2 c5 = vec2(0.5 + sin(t * 0.70) * 0.35, 0.5 + cos(t * 0.60) * 0.35);
      vec2 c6 = vec2(0.5 + cos(t * 0.45) * 0.50, 0.5 + sin(t * 0.65) * 0.50);

      float radius = 0.55;
      float i1 = 1.0 - smoothstep(0.0, radius, length(uv - c1));
      float i2 = 1.0 - smoothstep(0.0, radius, length(uv - c2));
      float i3 = 1.0 - smoothstep(0.0, radius, length(uv - c3));
      float i4 = 1.0 - smoothstep(0.0, radius, length(uv - c4));
      float i5 = 1.0 - smoothstep(0.0, radius, length(uv - c5));
      float i6 = 1.0 - smoothstep(0.0, radius, length(uv - c6));

      // Weighted blend: four-color rotation — all colors roughly equal
      vec3 color = vec3(0.0);
      color += uColor1 * i1 * 0.95;            // clementine
      color += uColor2 * i2 * 1.00;            // midnight
      color += uColor3 * i3 * 0.95;            // moss
      color += uColor4 * i4 * 0.95;            // rosie
      color += uColor2 * i5 * 0.95;            // midnight again
      color += uColor3 * i6 * 0.95;            // moss again

      color = clamp(color, vec3(0.0), vec3(1.0));

      // Guarantee a dark floor so text on top stays readable
      float brightness = length(color);
      float mixFactor = max(brightness * 1.1, 0.20);
      color = mix(uBase, color, mixFactor);

      // Soft vignette in the lower third to protect hero text
      float vignette = smoothstep(0.3, 1.0, vUv.y);
      color = mix(color, uBase * 0.7, vignette * 0.4);

      // Subtle grain
      float grain = fract(sin(dot(vUv * uResolution + uTime, vec2(12.9898, 78.233))) * 43758.5453);
      color += (grain * 2.0 - 1.0) * 0.05;

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  // ---------- App ----------
  class HeroGradient {
    constructor(container) {
      this.container = container;
      this.width = container.clientWidth;
      this.height = container.clientHeight;
      this.running = false;
      this.rafId = null;

      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance',
        alpha: false,
        stencil: false,
        depth: false
      });
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      this.renderer.domElement.setAttribute('aria-hidden', 'true');
      container.appendChild(this.renderer.domElement);

      this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
      this.camera.position.z = 50;

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x105666);
      this.clock = new THREE.Clock();

      this.touchTexture = new TouchTexture();

      this.uniforms = {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(this.width, this.height) },
        uColor1: { value: new THREE.Vector3(...PALETTE.clementine) },
        uColor2: { value: new THREE.Vector3(...PALETTE.midnight) },
        uColor3: { value: new THREE.Vector3(...PALETTE.moss) },
        uColor4: { value: new THREE.Vector3(...PALETTE.rosie) },
        uBase:   { value: new THREE.Vector3(...PALETTE.midnight) },
        uSpeed:  { value: 0.8 },
        uTouchTexture: { value: this.touchTexture.texture }
      };

      const viewSize = this.getViewSize();
      const material = new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader,
        fragmentShader
      });
      this.mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(viewSize.width, viewSize.height, 1, 1),
        material
      );
      this.scene.add(this.mesh);

      this.onResize = this.onResize.bind(this);
      this.onPointerMove = this.onPointerMove.bind(this);
      this.tick = this.tick.bind(this);
    }

    getViewSize() {
      const fov = (this.camera.fov * Math.PI) / 180;
      const height = Math.abs(this.camera.position.z * Math.tan(fov / 2) * 2);
      return { width: height * this.camera.aspect, height };
    }

    onPointerMove(ev) {
      const rect = this.container.getBoundingClientRect();
      const x = (ev.clientX - rect.left) / rect.width;
      const y = 1 - (ev.clientY - rect.top) / rect.height;
      if (x < 0 || x > 1 || y < 0 || y > 1) return;
      this.touchTexture.addTouch({ x, y });
    }

    onResize() {
      this.width = this.container.clientWidth;
      this.height = this.container.clientHeight;
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
      this.uniforms.uResolution.value.set(this.width, this.height);
      const viewSize = this.getViewSize();
      this.mesh.geometry.dispose();
      this.mesh.geometry = new THREE.PlaneGeometry(viewSize.width, viewSize.height, 1, 1);
    }

    tick() {
      if (!this.running) return;
      const delta = Math.min(this.clock.getDelta(), 0.1);
      this.uniforms.uTime.value += delta;
      this.touchTexture.update();
      this.renderer.render(this.scene, this.camera);
      this.rafId = requestAnimationFrame(this.tick);
    }

    start() {
      if (this.running) return;
      this.running = true;
      this.clock.start();
      window.addEventListener('resize', this.onResize);
      window.addEventListener('pointermove', this.onPointerMove);
      this.tick();
    }

    stop() {
      this.running = false;
      if (this.rafId) cancelAnimationFrame(this.rafId);
      window.removeEventListener('resize', this.onResize);
      window.removeEventListener('pointermove', this.onPointerMove);
    }

    destroy() {
      this.stop();
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.touchTexture.texture.dispose();
      this.renderer.dispose();
      if (this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
  }

  // ---------- Initialize ----------
  const hero = new HeroGradient(container);
  hero.start();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) hero.start();
          else hero.stop();
        });
      },
      { threshold: 0 }
    );
    observer.observe(container);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) hero.stop();
    else hero.start();
  });
})();
