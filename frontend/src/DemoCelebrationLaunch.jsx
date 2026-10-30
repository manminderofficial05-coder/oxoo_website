import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CompanyBrandLogo from './CompanyBrandLogo';

export default function DemoCelebrationLaunch({
  appName = 'Accounting',
  companyName = 'demo',
  onComplete
}) {
  // Animation Phases:
  // 1: Black BG + Fireworks + "WELCOME TO PrimePro DEMO"
  // 2: Black BG + Fireworks + "The one platform you will ever need to transform all your activities."
  // 3: White BG + "Building your {appName}"
  const [phase, setPhase] = useState(1);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const canvasRef = useRef(null);

  // -------------------------------------------------------------
  // CONTINUOUS SKYSHOTS / FIREWORKS CANVAS ENGINE
  // -------------------------------------------------------------
  useEffect(() => {
    if (phase === 3) return; // Stop fireworks in phase 3 (white screen)

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Particle classes
    const fireworks = [];
    const particles = [];

    const colors = [
      '#00e5ff', '#38bdf8', '#818cf8', '#c084fc',
      '#f43f5e', '#fbbf24', '#34d399', '#f472b6', '#ffffff'
    ];

    class Firework {
      constructor() {
        this.x = Math.random() * (canvas.width * 0.8) + (canvas.width * 0.1);
        this.y = canvas.height;
        this.targetY = Math.random() * (canvas.height * 0.45) + (canvas.height * 0.1);
        this.speed = Math.random() * 4 + 9;
        this.angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.25;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.trail = [];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 6) this.trail.shift();

        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.08; // gravity

        if (this.vy >= 0 || this.y <= this.targetY) {
          this.explode();
          return false;
        }
        return true;
      }

      explode() {
        const count = Math.floor(Math.random() * 40) + 60;
        for (let i = 0; i < count; i++) {
          particles.push(new Particle(this.x, this.y, this.color));
        }
      }

      draw() {
        ctx.save();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i < this.trail.length; i++) {
          const pt = this.trail[i];
          if (i === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        }
        ctx.lineTo(this.x, this.y);
        ctx.stroke();

        // Rocket head glow
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    class Particle {
      constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 7 + 1.5;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.alpha = 1;
        this.decay = Math.random() * 0.018 + 0.012;
        this.gravity = 0.09;
        this.size = Math.random() * 2.8 + 1.2;
      }

      update() {
        this.vx *= 0.96;
        this.vy *= 0.96;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
        return this.alpha > 0;
      }

      draw() {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    let lastSpawn = 0;

    const loop = (timestamp) => {
      // Trail fade effect on black background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Continuous rocket launch
      if (timestamp - lastSpawn > 320) {
        fireworks.push(new Firework());
        if (Math.random() > 0.4) {
          fireworks.push(new Firework()); // double burst
        }
        lastSpawn = timestamp;
      }

      // Update fireworks
      for (let i = fireworks.length - 1; i >= 0; i--) {
        if (!fireworks[i].update()) {
          fireworks.splice(i, 1);
        } else {
          fireworks[i].draw();
        }
      }

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        if (!particles[i].update()) {
          particles.splice(i, 1);
        } else {
          particles[i].draw();
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [phase]);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Global safety fallback: force transition after 5.5s max
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
    }, 5500);
    return () => clearTimeout(safetyTimer);
  }, []);

  // -------------------------------------------------------------
  // TYPEWRITER ANIMATION ORCHESTRATOR
  // -------------------------------------------------------------
  useEffect(() => {
    let timeoutId;
    let charIndex = 0;

    const fullTexts = {
      1: 'WELCOME TO PrimePro DEMO',
      2: 'The one platform you will ever need\nto transform all your activities.',
      3: `Building your ${appName}`
    };

    const targetText = fullTexts[phase] || '';
    setDisplayText('');
    setIsTyping(true);

    const typeNextChar = () => {
      if (charIndex < targetText.length) {
        setDisplayText(targetText.slice(0, charIndex + 1));
        charIndex++;
        const speed = phase === 1 ? 25 : (phase === 2 ? 18 : 22);
        timeoutId = setTimeout(typeNextChar, speed);
      } else {
        setIsTyping(false);

        // Pause before changing phase
        if (phase === 1) {
          timeoutId = setTimeout(() => {
            setPhase(2);
          }, 800);
        } else if (phase === 2) {
          timeoutId = setTimeout(() => {
            setPhase(3);
          }, 1000);
        } else if (phase === 3) {
          timeoutId = setTimeout(() => {
            if (onCompleteRef.current) onCompleteRef.current();
          }, 1200);
        }
      }
    };

    timeoutId = setTimeout(typeNextChar, 100);

    return () => clearTimeout(timeoutId);
  }, [phase, appName]);

  const handleSkipToDemo = () => {
    if (onCompleteRef.current) {
      onCompleteRef.current();
    }
  };

  return (
    <div
      className={`celebration-takeover-root ${phase === 3 ? 'is-white-stage' : 'is-black-stage'}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483647,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        transition: 'background-color 0.6s ease',
        backgroundColor: phase === 3 ? '#0f172a' : '#000000'
      }}
    >
      {/* Quick Skip to Demo Button (Top Right) */}
      <button
        type="button"
        onClick={handleSkipToDemo}
        style={{
          position: 'absolute',
          top: '24px',
          right: '24px',
          zIndex: 10,
          background: 'rgba(255, 255, 255, 0.12)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          color: '#ffffff',
          borderRadius: '999px',
          padding: '8px 18px',
          fontSize: '13px',
          fontWeight: '700',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.22)';
          e.currentTarget.style.borderColor = '#ffffff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
        }}
      >
        <span>Open Demo Now</span>
        <span>→</span>
      </button>
      {/* Canvas for Continuous Fireworks in Phases 1 & 2 */}
      {phase !== 3 && (
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1
          }}
        />
      )}

      {/* Central Content Box */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          padding: '0 24px',
          maxWidth: '920px',
          textAlign: 'center',
          userSelect: 'none'
        }}
      >
        <AnimatePresence mode="wait">
          {phase === 1 && (
            <motion.div
              key="phase-1"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.35 } }}
              transition={{ duration: 0.4 }}
            >
              <div
                style={{
                  display: 'inline-block',
                  padding: '6px 18px',
                  borderRadius: '999px',
                  background: 'rgba(0, 229, 255, 0.12)',
                  border: '1px solid rgba(0, 229, 255, 0.4)',
                  color: '#00e5ff',
                  fontSize: '13px',
                  fontWeight: '700',
                  letterSpacing: '2.5px',
                  marginBottom: '24px',
                  textTransform: 'uppercase',
                  boxShadow: '0 0 20px rgba(0, 229, 255, 0.25)'
                }}
              >
                ✨ Live Cloud Provisioning
              </div>

              <h1
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 'clamp(32px, 5.5vw, 64px)',
                  fontWeight: '900',
                  color: '#ffffff',
                  letterSpacing: '-1px',
                  margin: 0,
                  textShadow: '0 0 35px rgba(255, 255, 255, 0.4)',
                  lineHeight: 1.15
                }}
              >
                {displayText}
                <span className="typewriter-cursor">|</span>
              </h1>
            </motion.div>
          )}

          {phase === 2 && (
            <motion.div
              key="phase-2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15, transition: { duration: 0.4 } }}
              transition={{ duration: 0.4 }}
            >
              <h2
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 'clamp(28px, 4.4vw, 52px)',
                  fontWeight: '700',
                  color: '#ffffff',
                  margin: '0 auto',
                  maxWidth: '820px',
                  lineHeight: 1.25,
                  letterSpacing: '-0.5px',
                  whiteSpace: 'pre-line',
                  textShadow: '0 2px 20px rgba(0, 0, 0, 0.8)'
                }}
              >
                {displayText}
                <span className="typewriter-cursor">|</span>
              </h2>
            </motion.div>
          )}

          {phase === 3 && (
            <motion.div
              key="phase-3"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div style={{ marginBottom: '20px' }}>
                <CompanyBrandLogo
                  companyName={companyName}
                  size="md"
                  showPill={true}
                />
              </div>

              <h2
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: 'clamp(32px, 4.5vw, 56px)',
                  color: '#ffffff',
                  fontWeight: '500',
                  margin: '0 0 24px',
                  letterSpacing: '-0.5px'
                }}
              >
                {displayText.startsWith('Building your ') ? (
                  <>
                    <span>Building your </span>
                    <strong style={{ color: '#38bdf8', fontWeight: '800' }}>
                      {displayText.replace('Building your ', '')}
                    </strong>
                  </>
                ) : (
                  displayText
                )}
                <span className="typewriter-cursor">|</span>
              </h2>

              {/* Progress Bar & Status */}
              <div
                style={{
                  width: '320px',
                  height: '5px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  borderRadius: '999px',
                  margin: '0 auto',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '60%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #38bdf8, #00e5ff)',
                    borderRadius: '999px',
                    animation: 'subdomainBarSlide 1.2s infinite ease-in-out'
                  }}
                />
              </div>

              <p
                style={{
                  fontSize: '14.5px',
                  color: '#94a3b8',
                  marginTop: '16px',
                  marginBottom: '26px',
                  fontWeight: '500'
                }}
              >
                Configuring modules for <strong style={{ color: '#e2e8f0' }}>{companyName}.primepro.ai</strong>...
              </p>

              <button
                type="button"
                onClick={handleSkipToDemo}
                style={{
                  padding: '12px 28px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 10px 25px rgba(2, 132, 199, 0.35)',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>Launch Live Demo Now</span>
                <span>→</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Blinking cursor & animations styles */}
      <style>{`
        .typewriter-cursor {
          display: inline-block;
          font-weight: 300;
          color: #00e5ff;
          margin-left: 4px;
          animation: typewriterBlink 0.75s infinite;
        }
        .typewriter-cursor.dark {
          color: #00a3e0;
        }
        @keyframes typewriterBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes subdomainBarSlide {
          0% { left: -60%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
}
