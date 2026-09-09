
/* ============================================================
   NEURAL NETWORK BACKGROUND — build.nvidia.com style
   Glowing blue neurons + synapse energy pulses
   ============================================================ */
(function () {
    const canvas = document.getElementById('canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let W = 0, H = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W * DPR;
        canvas.height = H * DPR;
        canvas.style.width = W + 'px';
        canvas.style.height = H + 'px';
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    /* ---------- palette ---------- */
    const BLUE = [59, 130, 246];
    const SKY  = [96, 165, 250];
    const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

    function themeDark() {
        return document.documentElement.getAttribute('data-theme') !== 'light';
    }

    /* ---------- state ---------- */
    const NODE_COUNT = Math.min(110, Math.floor(window.innerWidth / 14));
    const LINK_DIST = 150;
    const mouse = { x: -9999, y: -9999, radius: 170 };

    const nodes = [];
    const pulses = [];   // energy packets travelling along links

    class Neuron {
        constructor() { this.reset(true); }
        reset(scatter) {
            this.x = Math.random() * W;
            this.y = Math.random() * H;
            const s = 0.22;
            this.vx = (Math.random() - 0.5) * s;
            this.vy = (Math.random() - 0.5) * s;
            this.r = 1.2 + Math.random() * 2.2;          // radius
            this.pulsePhase = Math.random() * Math.PI * 2; // glow breathing
            this.pulseSpeed = 0.008 + Math.random() * 0.015;
            this.lime = Math.random() < 0.18;            // some bright-lime nodes
        }
        step() {
            this.x += this.vx;
            this.y += this.vy;
            this.pulsePhase += this.pulseSpeed;

            // gentle mouse gravity — neurons lean toward the cursor
            const dx = mouse.x - this.x, dy = mouse.y - this.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < mouse.radius * mouse.radius && d2 > 1) {
                const d = Math.sqrt(d2);
                const f = (1 - d / mouse.radius) * 0.012;
                this.vx += (dx / d) * f;
                this.vy += (dy / d) * f;
            }

            // soft speed clamp
            const sp = Math.hypot(this.vx, this.vy);
            const max = 0.5;
            if (sp > max) { this.vx = this.vx / sp * max; this.vy = this.vy / sp * max; }
            if (sp < 0.08) { this.vx *= 1.02; this.vy *= 1.02; }

            if (this.x < -30) this.x = W + 30; else if (this.x > W + 30) this.x = -30;
            if (this.y < -30) this.y = H + 30; else if (this.y > H + 30) this.y = -30;
        }
        glow() { return 0.55 + 0.45 * Math.sin(this.pulsePhase); }
    }

    for (let i = 0; i < NODE_COUNT; i++) nodes.push(new Neuron());

    /* spatial grid so link detection stays cheap */
    const CELL = LINK_DIST;
    function buildGrid() {
        const grid = new Map();
        nodes.forEach((n, i) => {
            const key = Math.floor(n.x / CELL) + ':' + Math.floor(n.y / CELL);
            if (!grid.has(key)) grid.set(key, []);
            grid.get(key).push(i);
        });
        return grid;
    }

    function neighbours(grid, n) {
        const cx = Math.floor(n.x / CELL), cy = Math.floor(n.y / CELL);
        const out = [];
        for (let gx = cx - 1; gx <= cx + 1; gx++)
            for (let gy = cy - 1; gy <= cy + 1; gy++) {
                const bucket = grid.get(gx + ':' + gy);
                if (bucket) out.push(...bucket);
            }
        return out;
    }

    /* links recomputed each frame from grid */
    let links = [];

    function spawnPulse() {
        if (!links.length) return;
        const link = links[(Math.random() * links.length) | 0];
        if (pulses.length > 26) return;
        pulses.push({
            a: link.a, b: link.b,
            t: 0,
            speed: 0.006 + Math.random() * 0.012,
            dir: Math.random() < 0.5 ? 1 : -1
        });
    }

    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
    window.addEventListener('blur', () => { mouse.x = -9999; mouse.y = -9999; });

    /* ---------- draw ---------- */
    let frame = 0;

    function draw() {
        frame++;
        const dark = themeDark();

        // background: deep black w/ faint blue nebula
        ctx.fillStyle = dark ? '#050505' : '#f2f4ec';
        ctx.fillRect(0, 0, W, H);

        const neb = ctx.createRadialGradient(W * 0.5, H * 0.15, 0, W * 0.5, H * 0.15, Math.max(W, H) * 0.75);
        neb.addColorStop(0, dark ? 'rgba(118,185,0,0.045)' : 'rgba(118,185,0,0.05)');
        neb.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = neb;
        ctx.fillRect(0, 0, W, H);

        nodes.forEach(n => n.step());

        // rebuild links
        const grid = buildGrid();
        links = [];
        const seen = new Set();
        nodes.forEach((n, i) => {
            neighbours(grid, n).forEach(j => {
                if (j <= i) return;
                const m = nodes[j];
                const dx = n.x - m.x, dy = n.y - m.y;
                const d2 = dx * dx + dy * dy;
                if (d2 < LINK_DIST * LINK_DIST) {
                    const key = i + '-' + j;
                    if (!seen.has(key)) {
                        seen.add(key);
                        links.push({ a: i, b: j, d: Math.sqrt(d2) });
                    }
                }
            });
        });

        // synapse lines
        ctx.lineWidth = 1;
        for (const L of links) {
            const na = nodes[L.a], nb = nodes[L.b];
            const alpha = (1 - L.d / LINK_DIST) * (dark ? 0.28 : 0.22);
            ctx.strokeStyle = rgba(BLUE, alpha);
            ctx.beginPath();
            ctx.moveTo(na.x, na.y);
            ctx.lineTo(nb.x, nb.y);
            ctx.stroke();
        }

        // occasional firing
        if (frame % 9 === 0) spawnPulse();

        // pulses — bright packets racing along synapses
        for (let i = pulses.length - 1; i >= 0; i--) {
            const p = pulses[i];
            p.t += p.speed;
            if (p.t >= 1) {
                // on arrival: little flash on target neuron
                const target = nodes[p.dir === 1 ? p.b : p.a];
                target.pulsePhase = Math.PI * 1.5; // bump glow
                pulses.splice(i, 1);
                continue;
            }
            const na = nodes[p.dir === 1 ? p.a : p.b];
            const nb = nodes[p.dir === 1 ? p.b : p.a];
            const x = na.x + (nb.x - na.x) * p.t;
            const y = na.y + (nb.y - na.y) * p.t;

            ctx.save();
            ctx.shadowBlur = 12;
            ctx.shadowColor = rgba(SKY, 0.9);
            ctx.fillStyle = rgba(SKY, dark ? 0.95 : 0.85);
            ctx.beginPath();
            ctx.arc(x, y, 1.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // neurons
        for (const n of nodes) {
            const g = n.glow();
            const base = n.lime ? SKY : BLUE;
            const alpha = (dark ? 0.5 : 0.42) + g * (dark ? 0.5 : 0.4);

            ctx.save();
            ctx.shadowBlur = 6 + g * 14;
            ctx.shadowColor = rgba(base, 0.8);
            ctx.fillStyle = rgba(base, alpha);
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r * (0.8 + g * 0.35), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        requestAnimationFrame(draw);
    }

    draw();
})();