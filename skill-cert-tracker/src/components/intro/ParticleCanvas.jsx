import { useEffect, useRef } from 'react';

export default function ParticleCanvas() {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // ---- resize to fill window ----
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // ---- particle pool ----
    const PARTICLE_COUNT = Math.min(100, Math.floor(window.innerWidth / 14));
    const CONNECT_DIST   = 140;
    const particles = [];

    class Particle {
      constructor() { this.reset(true); }

      reset(init = false) {
        this.x  = Math.random() * canvas.width;
        this.y  = init ? Math.random() * canvas.height : canvas.height + 10;
        this.vx = (Math.random() - 0.5) * 0.45;
        this.vy = -(Math.random() * 0.5 + 0.15);
        this.r  = Math.random() * 2 + 1;
        this.alpha = Math.random() * 0.5 + 0.2;
        this.pulse = Math.random() * Math.PI * 2; // phase offset for pulsing
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.pulse += 0.02;
        const a = this.alpha + Math.sin(this.pulse) * 0.15;
        this.currentAlpha = Math.max(0, Math.min(1, a));

        // wrap x
        if (this.x < -10) this.x = canvas.width + 10;
        if (this.x > canvas.width + 10) this.x = -10;
        // reset when off top
        if (this.y < -10) this.reset(false);
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = this.currentAlpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${28 + Math.sin(this.pulse) * 15}deg, 95%, 68%)`;
        ctx.fill();
        // glow
        ctx.shadowBlur  = 8;
        ctx.shadowColor = '#f97316';
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

    // ---- shooting stars ----
    const stars = [];
    const spawnStar = () => {
      if (stars.length >= 4) return;
      stars.push({
        x:     Math.random() * canvas.width,
        y:     Math.random() * canvas.height * 0.5,
        len:   Math.random() * 120 + 60,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.4,
        speed: Math.random() * 6 + 4,
        alpha: 1,
        width: Math.random() * 1.5 + 0.5,
      });
    };
    const starInterval = setInterval(() => {
      if (Math.random() < 0.4) spawnStar();
    }, 2000);

    // ---- animation loop ----
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            const opacity = (1 - dist / CONNECT_DIST) * 0.28;
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.strokeStyle = '#fb923c';
            ctx.lineWidth   = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      // update + draw particles
      particles.forEach(p => { p.update(); p.draw(); });

      // draw + update shooting stars
      for (let s = stars.length - 1; s >= 0; s--) {
        const st = stars[s];
        const ex = st.x + Math.cos(st.angle) * st.len;
        const ey = st.y + Math.sin(st.angle) * st.len;

        const grad = ctx.createLinearGradient(st.x, st.y, ex, ey);
        grad.addColorStop(0, `rgba(255,255,255,0)`);
        grad.addColorStop(0.3, `rgba(253,186,116,${st.alpha * 0.6})`);
        grad.addColorStop(1, `rgba(255,255,255,${st.alpha})`);

        ctx.save();
        ctx.strokeStyle = grad;
        ctx.lineWidth   = st.width;
        ctx.shadowBlur  = 10;
        ctx.shadowColor = '#fcd34d';
        ctx.beginPath();
        ctx.moveTo(st.x, st.y);
        ctx.lineTo(ex, ey);
        ctx.stroke();
        ctx.restore();

        // move star
        st.x += Math.cos(st.angle) * st.speed;
        st.y += Math.sin(st.angle) * st.speed;
        st.alpha -= 0.012;
        if (st.alpha <= 0) stars.splice(s, 1);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      clearInterval(starInterval);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="intro-canvas"
      style={{ opacity: 0.7 }}
    />
  );
}
