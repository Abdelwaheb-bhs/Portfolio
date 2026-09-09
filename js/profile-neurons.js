/* ============================================================
   PROFILE NEURON GALAXY — swirling spiral of neurons around
   the profile photo, blue palette (#3b82f6)
   ============================================================ */
(function () {
    const profileCanvas = document.querySelector('.profile-neurons');
    if (!profileCanvas) return;

    const ctx = profileCanvas.getContext('2d');
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const W = 320, H = 320;
    profileCanvas.width = W * DPR;
    profileCanvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    const BLUE = [59, 130, 246];
    const SKY  = [96, 165, 250];
    const VIOLET = [124, 93, 250];
    const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

    const cx = W / 2, cy = H / 2;

    // photo radius ~95px, container half ~160px.
    // build a galaxy disc in the band 100px..155px with spiral arms.
    const INNER = 100, OUTER = 156;

    const ARMS = 3;                 // spiral arms
    const NODES_PER_ARM = 30;       // neurons per arm
    const nodes = [];

    for (let a = 0; a < ARMS; a++) {
        const armOffset = (a / ARMS) * Math.PI * 2;
        for (let i = 0; i < NODES_PER_ARM; i++) {
            const t = i / NODES_PER_ARM;           // 0..1 along the arm
            const r = INNER + (OUTER - INNER) * t; // radius
            const swirl = t * 2.4;                 // spiral twist
            const angle = armOffset + swirl + (Math.random() - 0.5) * 0.9;

            nodes.push({
                r,
                angle,
                // angular velocity — faster toward the center (galaxy rotation)
                omega: (0.0006 + Math.random() * 0.0008) * (1 - t * 0.5),
                size: 0.7 + Math.random() * 2.2 * (1 - t * 0.3),
                phase: Math.random() * Math.PI * 2,
                tone: Math.random() < 0.16 ? VIOLET : (Math.random() < 0.5 ? SKY : BLUE)
            });
        }
    }

    // scatter some "dust" stars between neurons for density
    const DUST = 90;
    for (let i = 0; i < DUST; i++) {
        const ang = Math.random() * Math.PI * 2;
        const r = INNER + (OUTER - INNER) * Math.random();
        nodes.push({
            r,
            angle: ang,
            omega: 0.00015 + Math.random() * 0.0004,
            size: 0.4 + Math.random() * 0.9,
            phase: Math.random() * Math.PI * 2,
            tone: Math.random() < 0.5 ? BLUE : SKY
        });
    }
    const N = nodes.length;

    const pulses = [];
    function spawnPulse() {
        if (pulses.length > 10) return;
        const a = (Math.random() * N) | 0;
        const b = (Math.random() * N) | 0;
        pulses.push({ a, b, t: 0, speed: 0.008 + Math.random() * 0.02 });
    }

    function pos(i) {
        const n = nodes[i];
        return { x: cx + Math.cos(n.angle) * n.r, y: cy + Math.sin(n.angle) * n.r };
    }

    function draw(t) {
        ctx.clearRect(0, 0, W, H);
        const dark = document.documentElement.getAttribute('data-theme') !== 'light';

        // orbit every node
        for (let i = 0; i < N; i++) nodes[i].angle += nodes[i].omega;

        // nebula glow in the disc
        const neb = ctx.createRadialGradient(cx, cy, INNER * 0.8, cx, cy, OUTER);
        neb.addColorStop(0, 'rgba(0,0,0,0)');
        neb.addColorStop(0.55, dark ? rgba(BLUE, 0.05) : rgba(BLUE, 0.06));
        neb.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = neb;
        ctx.beginPath();
        ctx.arc(cx, cy, OUTER, 0, Math.PI * 2);
        ctx.fill();

        // connections between nearby nodes (spatial hash by angle/radius)
        for (let i = 0; i < N; i++) {
            for (let j = i + 1; j < N; j++) {
                const ni = nodes[i], nj = nodes[j];
                const dx = pos(i).x - pos(j).x;
                const dy = pos(i).y - pos(j).y;
                const d2 = dx * dx + dy * dy;
                if (d2 < 30 * 30) {
                    const alpha = (1 - Math.sqrt(d2) / 30) * (dark ? 0.22 : 0.18);
                    ctx.strokeStyle = rgba(ni.tone, alpha);
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(pos(i).x, pos(i).y);
                    ctx.lineTo(pos(j).x, pos(j).y);
                    ctx.stroke();
                }
            }
        }

        // energy pulses
        if (Math.floor(t / 1000 / 140) % 7 === 0) spawnPulse();
        for (let k = pulses.length - 1; k >= 0; k--) {
            const p = pulses[k];
            p.t += p.speed;
            if (p.t >= 1) { pulses.splice(k, 1); continue; }
            const a = pos(p.a), b = pos(p.b);
            const x = a.x + (b.x - a.x) * p.t;
            const y = a.y + (b.y - a.y) * p.t;
            ctx.save();
            ctx.shadowBlur = 10;
            ctx.shadowColor = rgba(SKY, 0.9);
            ctx.fillStyle = rgba(SKY, dark ? 0.95 : 0.85);
            ctx.beginPath();
            ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // neurons
        for (let i = 0; i < N; i++) {
            const n = nodes[i];
            const g = 0.55 + 0.45 * Math.sin(t / 1000 * 2 + n.phase);
            const p = pos(i);
            ctx.save();
            ctx.shadowBlur = 5 + g * 11;
            ctx.shadowColor = rgba(n.tone, 0.8);
            ctx.fillStyle = rgba(n.tone, dark ? 0.6 : 0.5);
            ctx.beginPath();
            ctx.arc(p.x, p.y, n.size * (0.7 + g * 0.4), 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
})();