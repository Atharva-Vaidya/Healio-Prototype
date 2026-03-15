import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState, useCallback } from 'react';

/* ─── Magnetic Button Hook ─── */
function useMagnetic(strength = 0.35) {
  const ref = useRef(null);
  const handleMove = useCallback((e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${x * strength}px, ${y * strength}px) scale(1.04)`;
  }, [strength]);
  const handleLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = 'translate(0,0) scale(1)';
  }, []);
  return { ref, onMouseMove: handleMove, onMouseLeave: handleLeave };
}

/* ─── 3D Tilt Hook ─── */
function useTilt(max = 12) {
  const ref = useRef(null);
  const handleMove = useCallback((e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const y = ((e.clientY - r.top) / r.height - 0.5) * 2;
    el.style.transform = `perspective(800px) rotateY(${x * max}deg) rotateX(${-y * max}deg) scale3d(1.04,1.04,1.04)`;
    el.style.transition = 'transform 0.08s ease-out';
  }, [max]);
  const handleLeave = useCallback(() => {
    if (ref.current) {
      ref.current.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) scale3d(1,1,1)';
      ref.current.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)';
    }
  }, []);
  return { ref, onMouseMove: handleMove, onMouseLeave: handleLeave };
}

/* ─── Particle Canvas ─── */
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = 700;
    const resize = () => { W = canvas.width = window.innerWidth; };
    window.addEventListener('resize', resize);

    const count = Math.floor(W / 18);
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.4 + 0.1,
    }));
    let mouse = { x: -9999, y: -9999 };
    const onMouse = e => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener('mousemove', onMouse);

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        const dx = mouse.x - p.x, dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) { p.x -= dx * 0.018; p.y -= dy * 0.018; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(20,184,166,${p.alpha})`;
        ctx.fill();
      });
      // Connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(20,184,166,${0.12 * (1 - d / 110)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); window.removeEventListener('mousemove', onMouse); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 0, opacity: 0.9 }} />;
}


/* ─── Floating Card with full 3D tilt ─── */
function FloatCard({ children, className = '', delay = '0s', style = {} }) {
  const tilt = useTilt(14);
  return (
    <div {...tilt} className={className} style={{
      ...style,
      animationDelay: delay,
      transformStyle: 'preserve-3d',
      willChange: 'transform',
    }}>
      {children}
    </div>
  );
}

/* ─── Ecosystem Card ─── */
function EcoCard({ title, desc, icon, gradient }) {
  const tilt = useTilt(10);
  const [hovered, setHovered] = useState(false);
  return (
    <div
      {...tilt}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={(e) => { tilt.onMouseLeave(e); setHovered(false); }}
      style={{ transformStyle: 'preserve-3d', willChange: 'transform', cursor: 'default' }}
      className="relative bg-white rounded-2xl border border-gray-100 p-6 shadow-sm overflow-hidden"
    >
      {/* Animated background blob on hover */}
      <div style={{
        position: 'absolute', inset: 0, opacity: hovered ? 1 : 0,
        background: `radial-gradient(circle at 70% 70%, ${gradient.includes('teal') ? 'rgba(20,184,166,0.07)' : gradient.includes('indigo') ? 'rgba(99,102,241,0.07)' : gradient.includes('emerald') ? 'rgba(16,185,129,0.07)' : 'rgba(245,158,11,0.07)'} 0%, transparent 70%)`,
        transition: 'opacity 0.4s ease',
        borderRadius: '1rem',
        pointerEvents: 'none',
      }} />
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}
        style={{ transform: hovered ? 'translateZ(18px) scale(1.12)' : 'translateZ(0) scale(1)', transition: 'transform 0.35s cubic-bezier(0.23,1,0.32,1)' }}>
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d={icon} /></svg>
      </div>
      <h3 className="text-base font-bold text-gray-800 mb-1 relative z-10" style={{ transform: hovered ? 'translateZ(10px)' : 'none', transition: 'transform 0.35s ease' }}>{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed relative z-10">{desc}</p>
    </div>
  );
}

/* ─── Stat Counter ─── */
function StatCounter({ end, prefix = '', suffix = '', label }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0; const dur = 1600; const step = 16;
        const timer = setInterval(() => {
          start += step;
          setVal(Math.min(Math.round((start / dur) * end), end));
          if (start >= dur) clearInterval(timer);
        }, step);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">{prefix}{val.toLocaleString()}{suffix}</div>
      <div className="text-sm text-gray-400 mt-1 font-medium">{label}</div>
    </div>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const goLogin = () => navigate('/login');
  const heroMag = useMagnetic(0.28);
  const navMag = useMagnetic(0.2);

  /* Scroll fade-in */
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.fade-section').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');

        @keyframes float3d   { 0%,100%{transform:perspective(800px) translateY(0)   rotateX(2deg)  rotateZ(-1deg)} 50%{transform:perspective(800px) translateY(-18px) rotateX(-3deg) rotateZ(1deg)} }
        @keyframes float3d-b { 0%,100%{transform:perspective(800px) translateY(0)   rotateX(-2deg) rotateZ(1deg)}  50%{transform:perspective(800px) translateY(-14px) rotateX(3deg)  rotateZ(-1deg)} }
        @keyframes float3d-c { 0%,100%{transform:perspective(800px) translateY(0)   rotateX(1deg)  rotateZ(0deg)}  50%{transform:perspective(800px) translateY(-10px) rotateX(-2deg) rotateZ(2deg)} }
        @keyframes float3d-d { 0%,100%{transform:perspective(800px) translateY(0)   rotateX(-1deg) rotateZ(-2deg)} 50%{transform:perspective(800px) translateY(-12px) rotateX(2deg)  rotateZ(1deg)} }
        @keyframes gradient-move { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes shimmer    { 0%{transform:translateX(-100%)} 100%{transform:translateX(200%)} }
        @keyframes spin-slow  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulse-glow { 0%,100%{box-shadow:0 0 0 0 rgba(20,184,166,0.4)} 50%{box-shadow:0 0 0 16px rgba(20,184,166,0)} }
        @keyframes text-reveal { from{clip-path:inset(0 100% 0 0)} to{clip-path:inset(0 0% 0 0)} }

        .float-a { animation: float3d   6.2s ease-in-out infinite; }
        .float-b { animation: float3d-b 7.1s ease-in-out 0.8s infinite; }
        .float-c { animation: float3d-c 5.8s ease-in-out 1.6s infinite; }
        .float-d { animation: float3d-d 6.7s ease-in-out 2.4s infinite; }

        .gradient-animate { background-size:200% 200%; animation:gradient-move 8s ease infinite; }

        .glass {
          background: rgba(255,255,255,0.65);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.5);
          box-shadow: 0 8px 32px rgba(20,184,166,0.08), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8);
        }
        .glass:hover { box-shadow: 0 20px 60px rgba(20,184,166,0.15), 0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9); }

        .btn-shimmer { position:relative; overflow:hidden; }
        .btn-shimmer::after { content:''; position:absolute; top:-50%; left:-60%; width:40%; height:200%; background:linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent); transform:skewX(-20deg); animation:shimmer 3.5s infinite; }

        .fade-section { opacity:0; transform:translateY(40px); transition:opacity 0.8s cubic-bezier(0.23,1,0.32,1), transform 0.8s cubic-bezier(0.23,1,0.32,1); }
        .fade-section.visible { opacity:1; transform:translateY(0); }

        .card-3d { transform-style:preserve-3d; }
        .card-3d > * { transform:translateZ(0); }

        .dot-grid {
          background-image: radial-gradient(rgba(20,184,166,0.18) 1px, transparent 1px);
          background-size: 28px 28px;
        }

        .magnetic-btn { transition: transform 0.35s cubic-bezier(0.23,1,0.32,1), box-shadow 0.35s ease; }
        .section-divider { width:48px; height:3px; background:linear-gradient(90deg,#14b8a6,#06b6d4); border-radius:99px; margin:0 auto 1.5rem; }
      `}</style>

      {/* ═══════ NAVBAR ═══════ */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/75 border-b border-gray-200/40" style={{ boxShadow: '0 1px 40px rgba(20,184,166,0.06)' }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <img src="/healio-logo.svg" alt="Healio" className="h-[34px] w-auto drop-shadow-sm transition-transform hover:scale-105" />
          </div>
          <button
            {...navMag}
            onClick={goLogin}
            className="magnetic-btn btn-shimmer px-5 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/35 transition-shadow"
          >
            Login
          </button>
        </div>
      </nav>

      {/* ═══════ HERO ═══════ */}
      <section className="relative pt-16 pb-28 sm:pt-24 sm:pb-36 overflow-hidden">
        <ParticleCanvas />

        {/* Background orbs */}
        <div className="absolute top-[-80px] left-[10%] w-[600px] h-[600px] rounded-full -z-10"
          style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.13) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-[-60px] right-[5%] w-[500px] h-[500px] rounded-full -z-10"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 70%)', filter: 'blur(40px)' }} />

        {/* Dot grid overlay */}
        <div className="absolute inset-0 dot-grid opacity-60 pointer-events-none" style={{ zIndex: 1 }} />

        <div className="max-w-7xl mx-auto px-6 relative" style={{ zIndex: 2 }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: Copy */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-teal-50/80 border border-teal-200 text-teal-700 text-[11px] font-bold px-3.5 py-1.5 rounded-full mb-7 uppercase tracking-widest"
                style={{ backdropFilter: 'blur(8px)' }}>
                <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                Healthcare Benefits Platform
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.6rem] font-extrabold text-gray-900 leading-[1.05] tracking-tight mb-6" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                Healthcare<br />Benefits.{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">Reimagined.</span>
                  <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 200 6" preserveAspectRatio="none">
                    <path d="M0,5 Q50,0 100,5 Q150,10 200,5" stroke="url(#underlineGrad)" strokeWidth="2.5" fill="none">
                      <animate attributeName="d" values="M0,5 Q50,0 100,5 Q150,10 200,5;M0,5 Q50,10 100,5 Q150,0 200,5;M0,5 Q50,0 100,5 Q150,10 200,5" dur="3s" repeatCount="indefinite" />
                    </path>
                    <defs><linearGradient id="underlineGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#14b8a6" /><stop offset="100%" stopColor="#06b6d4" /></linearGradient></defs>
                  </svg>
                </span>
              </h1>
              <p className="text-lg text-gray-500 max-w-lg mx-auto lg:mx-0 mb-9 leading-relaxed" style={{ fontFamily: "'Inter',sans-serif" }}>
                A unified platform connecting employees, companies, clinics, and insurers — with full transparency at every step.
              </p>
              <div className="flex items-center gap-4 justify-center lg:justify-start">
                <button
                  {...heroMag}
                  onClick={goLogin}
                  className="magnetic-btn btn-shimmer px-8 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-bold rounded-2xl text-base shadow-xl shadow-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/40 gradient-animate transition-shadow"
                >
                  Access Platform →
                </button>
                <div className="flex items-center gap-2 text-sm text-gray-400" style={{ fontFamily: "'Inter',sans-serif" }}>
                  <div className="flex -space-x-1.5">
                    {['bg-teal-400', 'bg-cyan-400', 'bg-indigo-400'].map((c, i) => (
                      <div key={i} className={`w-7 h-7 ${c} rounded-full border-2 border-white text-[9px] text-white font-bold flex items-center justify-center`}>{String.fromCharCode(65 + i)}</div>
                    ))}
                  </div>
                  <span>4,500+ Users</span>
                </div>
              </div>
            </div>

            {/* Right: 3D Floating Cards */}
            <div className="relative h-[420px] hidden lg:block" style={{ perspective: '1000px' }}>

              {/* Card 1: Health Wallet */}
              <FloatCard className="absolute top-2 left-2 w-58 glass rounded-2xl p-5 float-a" style={{ width: 220 }}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mb-3 shadow-lg shadow-teal-500/30">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <p className="text-sm font-bold text-gray-800" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Health Wallet</p>
                <p className="text-2xl font-extrabold text-teal-600 mt-1 tracking-tight">₹20,000</p>
                <p className="text-[10px] text-gray-400 mt-1">Available Balance</p>
                <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full w-[62%] bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full" style={{ boxShadow: '0 0 8px rgba(20,184,166,0.5)' }} />
                </div>
                <p className="text-[9px] text-gray-400 mt-1">62% remaining</p>
              </FloatCard>

              {/* Card 2: Claims */}
              <FloatCard className="absolute top-6 right-2 w-52 glass rounded-2xl p-5 float-b" style={{ width: 210 }}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-3 shadow-lg shadow-amber-500/30">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <p className="text-sm font-bold text-gray-800" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Claims</p>
                <div className="flex items-center gap-2 mt-2.5">
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">✓ 12 Approved</span>
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">⏳ 3 Pending</span>
                </div>
                <div className="mt-3 flex gap-0.5">
                  {[85, 60, 90, 40, 75, 95, 50].map((h, i) => (
                    <div key={i} className="flex-1 rounded-sm" style={{ height: h * 0.28 + 'px', background: `rgba(20,184,166,${0.3 + h / 200})` }} />
                  ))}
                </div>
              </FloatCard>

              {/* Card 3: Clinic Network */}
              <FloatCard className="absolute bottom-16 left-10 glass rounded-2xl p-5 float-c" style={{ width: 205 }}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/30">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                </div>
                <p className="text-sm font-bold text-gray-800" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Clinic Network</p>
                <p className="text-xl font-extrabold text-indigo-600 mt-0.5">156</p>
                <p className="text-[10px] text-gray-400">Verified Providers</p>
                <div className="flex -space-x-1.5 mt-2">
                  {['bg-teal-400', 'bg-cyan-400', 'bg-indigo-400', 'bg-amber-400'].map((c, i) => (
                    <div key={i} className={`w-6 h-6 ${c} rounded-full border-2 border-white text-[8px] text-white font-bold flex items-center justify-center`}>{String.fromCharCode(65 + i)}</div>
                  ))}
                  <div className="w-6 h-6 bg-gray-100 rounded-full border-2 border-white text-[8px] text-gray-500 font-bold flex items-center justify-center">+</div>
                </div>
              </FloatCard>

              {/* Card 4: Corporate Benefits */}
              <FloatCard className="absolute bottom-4 right-6 glass rounded-2xl p-5 float-d" style={{ width: 190 }}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center mb-3 shadow-lg shadow-rose-500/30">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <p className="text-sm font-bold text-gray-800" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Corporate Benefits</p>
                <p className="text-[10px] text-gray-400 mt-1">Enterprise-grade coverage</p>
                <div className="mt-2.5 flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-semibold text-emerald-600">All systems active</span>
                </div>
              </FloatCard>

              {/* Rotating ring decoration */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ zIndex: -1 }}>
                <div style={{ width: 220, height: 220, border: '1px dashed rgba(20,184,166,0.2)', borderRadius: '50%', animation: 'spin-slow 18s linear infinite' }} />
                <div style={{ position: 'absolute', top: '15%', left: '15%', right: '15%', bottom: '15%', border: '1px dashed rgba(6,182,212,0.15)', borderRadius: '50%', animation: 'spin-slow 12s linear infinite reverse' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ STATS BAR ═══════ */}
      <section className="py-14 fade-section bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 sm:grid-cols-4 gap-8">
          <StatCounter end={4500} suffix="+" label="Active Users" />
          <StatCounter end={156} label="Clinic Partners" />
          <StatCounter prefix="₹" end={14} suffix="Cr+" label="Claims Processed" />
          <StatCounter end={98} suffix="%" label="Claim Accuracy" />
        </div>
      </section>

      {/* ═══════ ECOSYSTEM ═══════ */}
      <section className="py-24 fade-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-3">One Platform</p>
            <div className="section-divider" />
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              The Complete Healthcare Ecosystem
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { title: 'Employee', desc: 'Health wallet for consultations, tests, and everyday care.', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z', gradient: 'from-teal-500 to-cyan-500' },
              { title: 'HR Teams', desc: 'Monitor employee benefits, spending, and claims.', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', gradient: 'from-indigo-500 to-violet-500' },
              { title: 'Clinics', desc: 'Generate invoices and submit insurance claims.', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', gradient: 'from-emerald-500 to-teal-500' },
              { title: 'TPA', desc: 'Review and process healthcare claims efficiently.', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', gradient: 'from-amber-500 to-orange-500' },
            ].map(r => <EcoCard key={r.title} {...r} />)}
          </div>
        </div>
      </section>

      {/* ═══════ PLATFORM PREVIEW ═══════ */}
      <section className="py-24 fade-section" style={{ background: 'linear-gradient(160deg, #f8fafc 0%, #f0fffe 50%, #f8fafc 100%)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-3">Built for Every Role</p>
            <div className="section-divider" />
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>Powerful Dashboards</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { title: 'Employee Dashboard', desc: 'Health wallet, transactions, claims, and AI-powered insights — all in one view.', accent: 'teal', metrics: ['₹20,000 Wallet', '12 Transactions', '3 Claims'], color: 'rgba(20,184,166,0.08)' },
              { title: 'HR Analytics Dashboard', desc: 'Employee health budget tracking, claims monitoring, and fraud detection for HR teams.', accent: 'indigo', metrics: ['45 Employees', '₹9,00,000 Budget', '8 Pending'], color: 'rgba(99,102,241,0.08)' },
              { title: 'Clinic Billing Dashboard', desc: 'Generate invoices, process payments, and submit insurance claims directly to TPA.', accent: 'emerald', metrics: ['24 Invoices', '₹1,20,000 Revenue', '4.8 ★ Rating'], color: 'rgba(16,185,129,0.08)' },
              { title: 'TPA Claims Dashboard', desc: 'Full claims adjudication queue with fraud detection and payout tracking.', accent: 'amber', metrics: ['47 Claims', '₹14.2L Processed', '8.2% Rejection'], color: 'rgba(245,158,11,0.08)' },
            ].map(d => {
              const tilt = useTilt(7);
              return (
                <div key={d.title} {...tilt} style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm overflow-hidden relative group cursor-default">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"
                    style={{ background: `radial-gradient(circle at 80% 20%, ${d.color} 0%, transparent 70%)` }} />
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-100 transition-all duration-500"
                    style={{ background: `radial-gradient(circle, ${d.color} 0%, transparent 70%)`, borderRadius: '0 1rem 0 100%' }} />
                  <h3 className="text-base font-bold text-gray-800 mb-1 relative z-10" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{d.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 relative z-10" style={{ fontFamily: "'Inter',sans-serif" }}>{d.desc}</p>
                  <div className="flex flex-wrap gap-2 relative z-10">
                    {d.metrics.map(m => (
                      <span key={m} className="text-[10px] font-bold text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100 group-hover:border-gray-200 transition-colors">{m}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ KEY BENEFITS ═══════ */}
      <section className="py-24 fade-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-3">Why Healio</p>
            <div className="section-divider" />
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
              Intelligent Healthcare Infrastructure
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Transparent Spending', desc: 'Every rupee tracked in real-time across the entire benefits lifecycle.', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z' },
              { title: 'Fraud Detection', desc: 'AI-powered verification through verified invoices and pattern analysis.', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
              { title: 'Portable Health History', desc: 'Medical records and benefits travel with the employee across employers.', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
            ].map((b, i) => {
              const tilt = useTilt(10);
              const [hov, setHov] = useState(false);
              return (
                <div key={b.title} {...tilt}
                  onMouseEnter={() => setHov(true)}
                  onMouseLeave={e => { tilt.onMouseLeave(e); setHov(false); }}
                  style={{ transformStyle: 'preserve-3d', willChange: 'transform', animationDelay: `${i * 0.12}s` }}
                  className="text-center p-6 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden relative cursor-default">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                    style={{ background: 'radial-gradient(circle at 50% 0%, rgba(20,184,166,0.06) 0%, transparent 70%)', opacity: hov ? 1 : 0, transition: 'opacity 0.4s ease' }} />
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-teal-500/25"
                    style={{ transform: hov ? 'translateZ(20px) scale(1.1) rotate(-4deg)' : 'translateZ(0) scale(1) rotate(0deg)', transition: 'transform 0.4s cubic-bezier(0.23,1,0.32,1)' }}>
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d={b.icon} /></svg>
                  </div>
                  <h3 className="text-base font-bold text-gray-800 mb-2" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{b.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed" style={{ fontFamily: "'Inter',sans-serif" }}>{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ FINAL CTA ═══════ */}
      <section className="py-20 fade-section">
        <div className="max-w-4xl mx-auto px-6">
          <div className="relative rounded-3xl overflow-hidden" style={{
            background: 'linear-gradient(135deg, #0d9488, #0891b2, #0d9488)',
            backgroundSize: '300% 300%',
            animation: 'gradient-move 8s ease infinite',
            padding: '4px',
          }}>
            <div className="relative rounded-[22px] bg-gradient-to-br from-teal-500 via-cyan-500 to-teal-600 p-10 sm:p-14 text-center text-white overflow-hidden"
              style={{ backgroundSize: '200% 200%', animation: 'gradient-move 8s ease infinite' }}>
              {/* Decorative blobs */}
              <div className="absolute top-0 left-0 w-48 h-48 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
                style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)' }} />
              {/* Dot pattern */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

              <h2 className="text-2xl sm:text-3xl font-extrabold relative z-10 mb-3 tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
                Built for the future of healthcare benefits.
              </h2>
              <p className="text-teal-100 text-sm mb-8 relative z-10" style={{ fontFamily: "'Inter',sans-serif" }}>
                Join the platform that connects every stakeholder in the healthcare ecosystem.
              </p>
              <button
                onClick={goLogin}
                className="relative z-10 magnetic-btn btn-shimmer px-8 py-3.5 bg-white text-teal-700 font-bold rounded-2xl text-base shadow-xl hover:shadow-2xl hover:bg-gray-50 transition-all"
                style={{ transition: 'transform 0.3s cubic-bezier(0.23,1,0.32,1), box-shadow 0.3s ease' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                Login to Healio →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="border-t border-gray-200 bg-white py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-6">
            <div>
              <div className="mb-4">
                <img src="/healio-logo.svg" alt="Healio" className="h-[28px] w-auto opacity-80 hover:opacity-100 transition-opacity cursor-pointer" />
              </div>
              <p className="text-xs text-gray-400" style={{ fontFamily: "'Inter',sans-serif" }}>Healthcare benefits infrastructure platform.</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-gray-600">Hackathon Project</p>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <p className="text-[10px] text-gray-400 text-center">© 2026 Healio</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
