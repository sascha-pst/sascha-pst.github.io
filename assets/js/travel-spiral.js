// ============================================================
// Travel spiral — a 3D gallery that rotates with scroll/drag.
// Each image in the spiral is clickable and links to its post.
// Adapted from https://codepen.io/ol-ivier (spiral scroll base).
// ============================================================

(function () {
  const container = document.getElementById('travel-spiral');
  const canvas = document.getElementById('travel-canvas');
  const dataEl = document.getElementById('travel-data');
  if (!container || !canvas || !dataEl) return;

  // Respect reduced-motion — fall back to the accessible list below.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    container.classList.add('is-reduced-motion');
    return;
  }

  if (typeof THREE === 'undefined') {
    console.warn('Three.js not loaded; travel spiral skipped.');
    return;
  }

  // Parse the Liquid-generated data block
  let entries;
  try {
    entries = JSON.parse(dataEl.textContent);
  } catch (err) {
    console.error('Invalid travel data JSON:', err);
    return;
  }
  if (!entries.length) return;

  const numberOfImages = entries.length;
  const imageUrls = entries.map(e => e.image);

  let scene, camera, renderer, spiralMesh, tiltGroup, shaderMaterial, raycaster, mouse;
  let scrollOffset = 0;
  let isDragging = false;
  let hasDragged = false;
  let previousMousePosition = { x: 0, y: 0 };
  let dragRotation = { x: 0, z: 0 };
  let baseRotation = { x: -0.18, z: 0.12 };
  let imageRatios = [];
  let imageSegmentBounds = [];  // Maps UV ranges to entry indices for click detection

  const inertiaParams = {
    friction: 0.94,
    strength: 0.8,
    maxSpeed: 0.05,
    directionSmoothing: 0.92,
    scrollSensitivity: 0.0008
  };

  const config = {
    imageHeight: 7,
    curvature: -0.030,
    gapSize: 0,
    spiralRadius: 3.5,
    spiralTurns: 2.8 + (numberOfImages - 21) * 0.1,
    spiralHeight: 12 + (numberOfImages - 21) * 0.25,
    centerX: -2,
    centerY: 4.38,
    centerZ: 0
  };

  const originalPositions = [];
  let targetVelocity = 0;
  let currentVelocity = 0;

  // ---------- Sizing ----------
  function getSize() {
    return {
      width: container.clientWidth,
      height: container.clientHeight
    };
  }

  // ---------- Geometry ----------
  function rebuildGeometry() {
    if (!spiralMesh) return;

    const totalSlots = imageRatios.length;
    const widths = imageRatios.map(r => r * config.imageHeight);
    const totalWidth = widths.reduce((a, b) => a + b, 0);
    const segmentsW = 200 + totalSlots * 20;
    const segmentsH = 24;

    const geometry = new THREE.PlaneGeometry(totalWidth, config.imageHeight, segmentsW, segmentsH);
    const positions = geometry.attributes.position;
    const uvs = geometry.attributes.uv;

    const origX = [];
    const origY = [];
    for (let i = 0; i < positions.count; i++) {
      origX.push(positions.getX(i));
      origY.push(positions.getY(i));
    }

    const cumulative = [0];
    for (let i = 0; i < totalSlots; i++) {
      cumulative.push(cumulative[i] + widths[i] / totalWidth);
    }

    // Store segment bounds for raycasting hit detection
    imageSegmentBounds = [];
    for (let i = 0; i < totalSlots; i++) {
      imageSegmentBounds.push({ start: cumulative[i], end: cumulative[i + 1] });
    }

    const imageRatio = 1 - config.gapSize;

    for (let i = 0; i < uvs.count; i++) {
      let u = uvs.getX(i);
      u = Math.max(0, Math.min(0.999999, u));

      let found = false;
      for (let j = 0; j < totalSlots; j++) {
        if (u >= cumulative[j] && u < cumulative[j + 1]) {
          const localU = (u - cumulative[j]) / (cumulative[j + 1] - cumulative[j]);
          if (localU > imageRatio) {
            uvs.setX(i, cumulative[j + 1] - 0.001);
          } else {
            let scaledU = localU / imageRatio;
            const edgeMargin = 0.001;
            scaledU = Math.max(edgeMargin, Math.min(1 - edgeMargin, scaledU));
            const newU = cumulative[j] + scaledU * (cumulative[j + 1] - cumulative[j]);
            uvs.setX(i, newU);
          }
          found = true;
          break;
        }
      }
      if (!found) uvs.setX(i, cumulative[totalSlots] - 0.001);
    }

    // Bend the plane and fold it into the spiral
    for (let i = 0; i < positions.count; i++) {
      const x = origX[i];
      const y = origY[i];
      let t = (x + totalWidth / 2) / totalWidth;
      t = Math.max(0, Math.min(1, t));

      const angle = t * Math.PI * 2 * config.spiralTurns;
      const radius = config.spiralRadius * (1 - t * 0.12);
      let px = Math.sin(angle) * radius;
      let pz = Math.cos(angle) * radius;
      let py = (t - 0.5) * config.spiralHeight + y * 0.35;

      if (!originalPositions[i]) {
        originalPositions[i] = {
          offsetX: (Math.random() - 0.5) * 0.001,
          offsetY: (Math.random() - 0.5) * 0.001,
          offsetZ: (Math.random() - 0.5) * 0.001
        };
      }

      px += originalPositions[i].offsetX;
      py += originalPositions[i].offsetY;
      pz += originalPositions[i].offsetZ;

      positions.setXYZ(i, px, py, pz);
    }

    geometry.computeVertexNormals();
    const oldGeo = spiralMesh.geometry;
    spiralMesh.geometry = geometry;
    if (oldGeo) oldGeo.dispose();

    if (shaderMaterial) shaderMaterial.uniforms.gap.value = config.gapSize;
  }

  function updateUVOffset() {
    if (!shaderMaterial) return;
    let offset = scrollOffset;
    while (offset >= 1.0) offset -= 1.0;
    while (offset < 0) offset += 1.0;
    shaderMaterial.uniforms.offset.value = offset;
  }

  // ---------- Texture stitching ----------
  function createMasterTexture() {
    return new Promise((resolve) => {
      const c = document.createElement('canvas');
      const ctx = c.getContext('2d');
      const baseHeight = 500;
      let loaded = 0;
      const images = [];

      imageUrls.forEach((url, idx) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
          const ratio = img.naturalWidth / img.naturalHeight;
          imageRatios[idx] = ratio;
          images[idx] = { img, width: baseHeight * ratio, height: baseHeight };
          loaded++;
          if (loaded === numberOfImages) finish();
        };
        img.onerror = () => {
          imageRatios[idx] = 0.8;
          images[idx] = null;
          loaded++;
          if (loaded === numberOfImages) finish();
        };
        img.src = url;
      });

      function finish() {
        const totalWidth = images.reduce((sum, i) => sum + (i ? i.width : baseHeight * 0.8), 0);
        c.width = totalWidth;
        c.height = baseHeight;
        ctx.fillStyle = '#105666';  // midnight fallback behind missing images
        ctx.fillRect(0, 0, c.width, c.height);
        let offsetX = 0;
        images.forEach((data) => {
          if (data && data.img) ctx.drawImage(data.img, offsetX, 0, data.width, baseHeight);
          offsetX += data ? data.width : baseHeight * 0.8;
        });
        const tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        resolve(tex);
      }
    });
  }

  // ---------- Click-through via raycaster ----------
  // Determine which image an intersection point falls on by reading the UV.
  function handleClick(clientX, clientY) {
    const size = getSize();
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((clientX - rect.left) / size.width) * 2 - 1;
    mouse.y = -((clientY - rect.top) / size.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObject(spiralMesh);
    if (!hits.length) return;

    const hit = hits[0];
    if (!hit.uv) return;

    // The hit UV has already been remapped by our geometry work.
    // Apply the same offset that scrolling uses.
    let u = hit.uv.x + shaderMaterial.uniforms.offset.value;
    while (u >= 1.0) u -= 1.0;
    while (u < 0) u += 1.0;

    // Find which segment this UV falls into
    for (let i = 0; i < imageSegmentBounds.length; i++) {
      const b = imageSegmentBounds[i];
      if (u >= b.start && u < b.end) {
        const entry = entries[i];
        if (entry && entry.url) window.location.href = entry.url;
        return;
      }
    }
  }

  // ---------- Init ----------
  async function init() {
    const size = getSize();

    scene = new THREE.Scene();
    scene.background = null;  // transparent — let the page background show

    camera = new THREE.PerspectiveCamera(50, size.width / size.height, 0.1, 1000);
    camera.position.set(0, 3.5, 9);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(size.width, size.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.9);
    mainLight.position.set(5, 8, 5);
    scene.add(mainLight);

    tiltGroup = new THREE.Group();
    tiltGroup.rotation.x = baseRotation.x;
    tiltGroup.rotation.z = baseRotation.z;
    scene.add(tiltGroup);

    const texture = await createMasterTexture();

    shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        map: { value: texture },
        gap: { value: config.gapSize },
        offset: { value: 0.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        uniform float offset;
        varying vec2 vUv;
        void main() {
          float u = vUv.x + offset;
          if (u >= 1.0) u -= 1.0;
          if (u < 0.0) u += 1.0;
          gl_FragColor = texture2D(map, vec2(u, vUv.y));
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });

    spiralMesh = new THREE.Mesh(new THREE.BufferGeometry(), shaderMaterial);
    spiralMesh.position.set(config.centerX, config.centerY, config.centerZ);
    spiralMesh.rotation.x = 0.35;
    tiltGroup.add(spiralMesh);

    rebuildGeometry();

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    setupInertia();
    setupDrag();
    setupClick();
    window.addEventListener('resize', onResize);

    animate();
  }

  function setupInertia() {
    let acceleration = 0;

    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rawDelta = e.deltaY * inertiaParams.scrollSensitivity * inertiaParams.strength;
      const maxAccel = 0.015;
      let deltaAccel = rawDelta - acceleration;
      deltaAccel = Math.max(-maxAccel, Math.min(maxAccel, deltaAccel));
      acceleration += deltaAccel;
      acceleration = Math.max(-0.03, Math.min(0.03, acceleration));
      targetVelocity = targetVelocity * inertiaParams.directionSmoothing + acceleration * (1 - inertiaParams.directionSmoothing);
      targetVelocity = Math.max(-inertiaParams.maxSpeed, Math.min(inertiaParams.maxSpeed, targetVelocity));
    }, { passive: false });

    window._travelInertia = function () {
      targetVelocity *= inertiaParams.friction;
      currentVelocity = currentVelocity * 0.85 + targetVelocity * 0.15;
      if (Math.abs(currentVelocity) > 0.0001) {
        scrollOffset += currentVelocity;
        updateUVOffset();
      } else {
        currentVelocity = 0;
        targetVelocity = 0;
        acceleration = 0;
      }
    };
  }

  function setupDrag() {
    canvas.style.cursor = 'grab';

    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      hasDragged = false;
      previousMousePosition = { x: e.clientX, y: e.clientY };
      canvas.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - previousMousePosition.x;
      const dy = e.clientY - previousMousePosition.y;
      // Only count as drag if movement exceeds a small threshold
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasDragged = true;
      dragRotation.z += dx * 0.002;
      dragRotation.x -= dy * 0.002;
      dragRotation.x = Math.max(-0.35, Math.min(0.35, dragRotation.x));
      dragRotation.z = Math.max(-0.35, Math.min(0.35, dragRotation.z));
      tiltGroup.rotation.x = baseRotation.x + dragRotation.x;
      tiltGroup.rotation.z = baseRotation.z + dragRotation.z;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
      canvas.style.cursor = 'grab';
    });
  }

  function setupClick() {
    canvas.addEventListener('click', (e) => {
      // If the user was dragging, don't treat it as a click
      if (hasDragged) return;
      handleClick(e.clientX, e.clientY);
    });
  }

  function onResize() {
    const size = getSize();
    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();
    renderer.setSize(size.width, size.height);
  }

  function animate() {
    requestAnimationFrame(animate);
    if (window._travelInertia) window._travelInertia();
    renderer.render(scene, camera);
  }

  init();
})();
