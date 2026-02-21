"use client";

import { useEffect, useRef, useState } from "react";

// ─── Grain Texture Canvas ─────────────────────────────────────────────────────
const GrainOverlay = () => {
  const canvasRef = useRef(null);
  const animRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = 300;
    const H = 300;
    canvas.width = W;
    canvas.height = H;

    const render = () => {
      const imageData = ctx.createImageData(W, H);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const v = Math.random() * 255;
        imageData.data[i] = v;
        imageData.data[i + 1] = v;
        imageData.data[i + 2] = v;
        imageData.data[i + 3] = 18;
      }
      ctx.putImageData(imageData, 0, 0);
      animRef.current = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 2,
        opacity: 0.45,
        mixBlendMode: "overlay",
      }}
    />
  );
};

// ─── Animated Grid Lines ──────────────────────────────────────────────────────
const GridBackground = () => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 0,
      pointerEvents: "none",
      backgroundImage: `
        linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)
      `,
      backgroundSize: "72px 72px",
      maskImage:
        "radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 100%)",
    }}
  />
);

// ─── Pipeline Diagram ─────────────────────────────────────────────────────────
const PipelineDiagram = () => {
  const [activeIdx, setActiveIdx] = useState(0);

  const stages = [
    { id: "code", label: "Code", sub: "Push & PR" },
    { id: "test", label: "Test", sub: "Lint & Validate" },
    { id: "build", label: "Build", sub: "Docker Image" },
    { id: "deploy", label: "Deploy", sub: "GKE Rollout" },
    { id: "monitor", label: "Monitor", sub: "Live Metrics" },
  ];

  useEffect(() => {
    const t = setInterval(
      () => setActiveIdx((i) => (i + 1) % stages.length),
      2000
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ width: "100%", maxWidth: 760, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
        }}
      >
        {stages.map((stage, i) => {
          const isPast = i < activeIdx;
          const isActive = i === activeIdx;
          return (
            <div key={stage.id} style={{ display: "flex", alignItems: "center" }}>
              {/* Node */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.6rem",
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    border: `1px solid ${isActive
                        ? "rgba(255,255,255,0.7)"
                        : isPast
                          ? "rgba(255,255,255,0.3)"
                          : "rgba(255,255,255,0.12)"
                      }`,
                    background: isActive
                      ? "rgba(255,255,255,0.1)"
                      : isPast
                        ? "rgba(255,255,255,0.04)"
                        : "rgba(255,255,255,0.02)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.5s ease",
                    boxShadow: isActive
                      ? "0 0 24px rgba(255,255,255,0.12), inset 0 0 12px rgba(255,255,255,0.05)"
                      : "none",
                    position: "relative",
                  }}
                >
                  {isPast && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M3 8l3.5 3.5L13 5"
                        stroke="rgba(255,255,255,0.5)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {isActive && (
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.9)",
                        animation: "pulseDot 1.5s ease-in-out infinite",
                      }}
                    />
                  )}
                  {!isPast && !isActive && (
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.15)",
                      }}
                    />
                  )}
                  {isActive && (
                    <div
                      style={{
                        position: "absolute",
                        inset: -4,
                        borderRadius: "50%",
                        border: "1px solid rgba(255,255,255,0.15)",
                        animation: "ringPulse 1.5s ease-out infinite",
                      }}
                    />
                  )}
                </div>
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: isActive
                        ? "rgba(255,255,255,0.9)"
                        : isPast
                          ? "rgba(255,255,255,0.4)"
                          : "rgba(255,255,255,0.2)",
                      transition: "color 0.5s",
                    }}
                  >
                    {stage.label}
                  </div>
                  <div
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "0.62rem",
                      color: isActive
                        ? "rgba(255,255,255,0.4)"
                        : "rgba(255,255,255,0.15)",
                      letterSpacing: "0.06em",
                      marginTop: "0.15rem",
                      transition: "color 0.5s",
                    }}
                  >
                    {stage.sub}
                  </div>
                </div>
              </div>

              {/* Connector */}
              {i < stages.length - 1 && (
                <div
                  style={{
                    width: 60,
                    height: 1,
                    position: "relative",
                    margin: "0 4px",
                    marginBottom: "2.2rem",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: isPast
                        ? "rgba(255,255,255,0.25)"
                        : "rgba(255,255,255,0.08)",
                      transition: "background 0.5s",
                    }}
                  />
                  {isActive && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: 16,
                        height: 1,
                        background: "rgba(255,255,255,0.8)",
                        animation: "slideRight 2s linear infinite",
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Feature Card ─────────────────────────────────────────────────────────────
const FeatureCard = ({ number, title, desc, tag }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "2.5rem",
        border: "1px solid rgba(255,255,255,0.07)",
        background: hovered
          ? "rgba(255,255,255,0.03)"
          : "rgba(255,255,255,0.01)",
        transition: "background 0.4s, border-color 0.4s",
        borderColor: hovered
          ? "rgba(255,255,255,0.14)"
          : "rgba(255,255,255,0.07)",
        cursor: "default",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "1px",
          background: "rgba(255,255,255,0.4)",
          transform: hovered ? "scaleX(1)" : "scaleX(0)",
          transition: "transform 0.4s ease",
          transformOrigin: "left",
        }}
      />
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "0.68rem",
          color: "rgba(255,255,255,0.2)",
          letterSpacing: "0.2em",
          marginBottom: "1.5rem",
        }}
      >
        {number}
      </div>
      <div
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "1.35rem",
          fontWeight: 600,
          color: hovered ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.7)",
          marginBottom: "0.9rem",
          letterSpacing: "0.02em",
          transition: "color 0.3s",
          lineHeight: 1.3,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.875rem",
          color: "rgba(255,255,255,0.35)",
          lineHeight: 1.75,
          marginBottom: "1.8rem",
          fontWeight: 300,
        }}
      >
        {desc}
      </div>
      <div
        style={{
          display: "inline-block",
          padding: "0.3rem 0.7rem",
          border: "1px solid rgba(255,255,255,0.1)",
          fontFamily: "'DM Mono', monospace",
          fontSize: "0.65rem",
          color: "rgba(255,255,255,0.3)",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        {tag}
      </div>
    </div>
  );
};

// ─── Stat Item ────────────────────────────────────────────────────────────────
const StatItem = ({
  value,
  label,
}) => (
  <div style={{ textAlign: "center", padding: "2rem 2.5rem", flex: 1 }}>
    <div
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "3.2rem",
        fontWeight: 700,
        color: "rgba(255,255,255,0.85)",
        lineHeight: 1,
        marginBottom: "0.6rem",
        letterSpacing: "-0.02em",
      }}
    >
      {value}
    </div>
    <div
      style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: "0.68rem",
        color: "rgba(255,255,255,0.25)",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
      }}
    >
      {label}
    </div>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!mounted) return null;

  const features = [
    {
      number: "001",
      title: "GitHub Actions CI/CD",
      desc: "Every code push triggers a fully automated pipeline. Lint, test, build, and deploy — version-controlled workflow-as-code with no manual intervention required.",
      tag: "CI/CD Backbone",
    },
    {
      number: "002",
      title: "Docker Containerization",
      desc: "Reproducible, immutable environments from local development to production. Multi-stage builds optimised for size and security. Zero environment drift.",
      tag: "Containerization",
    },
    {
      number: "003",
      title: "Kubernetes on GCP",
      desc: "Auto-scaling inference pods, rolling deployments with zero downtime, and resource-efficient orchestration on Google Kubernetes Engine. Resilient by design.",
      tag: "Orchestration",
    },
    {
      number: "004",
      title: "Live React Dashboard",
      desc: "Real-time visibility across the entire lifecycle. Pipeline health, model performance, deployment history, and infrastructure metrics unified in one interface.",
      tag: "Observability",
    },
    {
      number: "005",
      title: "Automated Quality Gates",
      desc: "Unit tests, integration tests, and model validation run on every pull request. No artifact ships without satisfying performance thresholds and safety checks.",
      tag: "Testing",
    },
    {
      number: "006",
      title: "Drift Detection & Retraining",
      desc: "Continuous monitoring for data and concept drift. Automatic retraining triggered when model performance degrades below defined SLA thresholds.",
      tag: "AutoML",
    },
  ];

  const marqueeItems = [
    "GitHub Actions CI/CD",
    "Docker Containerization",
    "Kubernetes Orchestration",
    "GCP Cloud Infrastructure",
    "Automated Testing",
    "Model Drift Detection",
    "Live React Dashboard",
    "Zero-downtime Deploys",
    "Auto-scaling Inference",
  ];

  const pipelineSteps = [
    { step: "01", title: "Push to main", desc: "Trigger CI pipeline" },
    { step: "02", title: "Tests pass", desc: "847 checks validated" },
    { step: "03", title: "Docker build", desc: "Immutable image tagged" },
    { step: "04", title: "GKE deploy", desc: "Zero-downtime rollout" },
    { step: "05", title: "Monitor live", desc: "Metrics stream to dashboard" },
  ];

  const GITHUB_LINK = "https://github.com/VedantPandhare/MLOps-automation.git";
  const DASHBOARD_LINK = "/dashboard";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,600&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@300;400;500&display=swap');

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --bg: #0e0e0e;
          --border: rgba(255,255,255,0.07);
          --text: rgba(255,255,255,0.85);
          --muted: rgba(255,255,255,0.35);
          --faint: rgba(255,255,255,0.12);
        }

        html { background: var(--bg); color: var(--text); scroll-behavior: smooth; }
        body { background: var(--bg); overflow-x: hidden; -webkit-font-smoothing: antialiased; }

        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: var(--bg); }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); }

        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.3; transform: scale(0.6); }
        }
        @keyframes ringPulse {
          0%   { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes slideRight {
          0%   { left: -20px; opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { left: 100%; opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* Nav */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.4rem 3rem;
          transition: background 0.4s, border-color 0.4s;
        }
        .nav.scrolled {
          background: rgba(14,14,14,0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .nav-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.1rem; font-weight: 600;
          color: rgba(255,255,255,0.85); letter-spacing: 0.08em;
          text-decoration: none; display: flex; align-items: center; gap: 0.75rem;
        }
        .logo-mark {
          width: 28px; height: 28px;
          border: 1px solid rgba(255,255,255,0.2);
          display: flex; align-items: center; justify-content: center;
        }
        .nav-links { display: flex; gap: 2.5rem; list-style: none; align-items: center; }
        .nav-links a {
          font-family: 'DM Mono', monospace; font-size: 0.72rem;
          color: rgba(255,255,255,0.3); text-decoration: none;
          letter-spacing: 0.1em; text-transform: uppercase; transition: color 0.2s;
        }
        .nav-links a:hover { color: rgba(255,255,255,0.75); }
        .nav-cta {
          color: rgba(255,255,255,0.6) !important;
          border: 1px solid rgba(255,255,255,0.15) !important;
          padding: 0.45rem 1.1rem !important;
        }
        .nav-cta:hover {
          color: rgba(255,255,255,0.9) !important;
          border-color: rgba(255,255,255,0.35) !important;
        }

        /* Hero */
        .hero {
          position: relative; z-index: 10; min-height: 100vh;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 10rem 2rem 6rem; text-align: center;
        }
        .hero-eyebrow {
          font-family: 'DM Mono', monospace; font-size: 0.7rem;
          color: rgba(255,255,255,0.25); letter-spacing: 0.28em;
          text-transform: uppercase; margin-bottom: 2.5rem;
          animation: fadeIn 0.8s ease both;
          display: flex; align-items: center; gap: 1rem;
        }
        .eyebrow-line { display: block; width: 32px; height: 1px; background: rgba(255,255,255,0.2); }
        .hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(4rem, 9vw, 8.5rem);
          font-weight: 300; line-height: 1.0;
          letter-spacing: -0.02em; margin-bottom: 2.5rem;
          animation: fadeUp 0.8s 0.1s ease both;
        }
        .title-light  { display: block; color: rgba(255,255,255,0.15); font-style: italic; font-weight: 300; }
        .title-main   { display: block; color: rgba(255,255,255,0.88); font-weight: 600; }
        .title-accent { display: block; color: rgba(255,255,255,0.88); font-weight: 300; font-style: italic; }
        .hero-desc {
          font-family: 'DM Sans', sans-serif;
          font-size: clamp(0.95rem, 1.8vw, 1.1rem);
          color: rgba(255,255,255,0.32); max-width: 560px; line-height: 1.8;
          margin-bottom: 3.5rem; animation: fadeUp 0.8s 0.2s ease both; font-weight: 300;
        }
        .hero-desc strong { color: rgba(255,255,255,0.6); font-weight: 500; }

        /* Buttons */
        .btn-group {
          display: flex; gap: 1rem; align-items: center; justify-content: center;
          animation: fadeUp 0.8s 0.3s ease both; margin-bottom: 6rem;
          flex-wrap: wrap;
        }
        .btn-primary {
          display: inline-flex; align-items: center; gap: 0.7rem;
          padding: 1rem 2.4rem; background: rgba(255,255,255,0.9);
          color: #0e0e0e; font-family: 'DM Mono', monospace;
          font-size: 0.78rem; font-weight: 500; letter-spacing: 0.1em;
          text-transform: uppercase; text-decoration: none;
          border: none; cursor: pointer;
          transition: background 0.25s, transform 0.2s, box-shadow 0.25s;
        }
        .btn-primary:hover {
          background: #ffffff; transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(255,255,255,0.12);
        }
        .btn-primary .arrow { transition: transform 0.2s; }
        .btn-primary:hover .arrow { transform: translateX(4px); }
        .btn-ghost {
          display: inline-flex; align-items: center; gap: 0.6rem;
          padding: 1rem 2rem; background: transparent;
          color: rgba(255,255,255,0.4); font-family: 'DM Mono', monospace;
          font-size: 0.78rem; font-weight: 400; letter-spacing: 0.1em;
          text-transform: uppercase; text-decoration: none;
          border: 1px solid rgba(255,255,255,0.12); cursor: pointer;
          transition: color 0.2s, border-color 0.2s, transform 0.2s;
        }
        .btn-ghost:hover {
          color: rgba(255,255,255,0.75); border-color: rgba(255,255,255,0.28);
          transform: translateY(-2px);
        }

        /* Marquee */
        .marquee-wrap {
          overflow: hidden;
          border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
          padding: 1.4rem 0; position: relative; z-index: 10;
        }
        .marquee-track {
          display: flex; width: max-content;
          animation: marquee 28s linear infinite; gap: 5rem;
        }
        .marquee-item {
          font-family: 'DM Mono', monospace; font-size: 0.7rem;
          color: rgba(255,255,255,0.2); letter-spacing: 0.2em;
          text-transform: uppercase; white-space: nowrap;
          display: flex; align-items: center; gap: 1.2rem;
        }
        .marquee-dot { width: 3px; height: 3px; border-radius: 50%; background: rgba(255,255,255,0.2); flex-shrink: 0; }

        /* Stats */
        .stats-section {
          position: relative; z-index: 10;
          display: flex; justify-content: center;
          max-width: 900px; margin: 0 auto;
          border-left: 1px solid var(--border);
        }
        .stats-divider { width: 1px; background: var(--border); flex-shrink: 0; }

        /* Features */
        .features-section {
          position: relative; z-index: 10;
          max-width: 1100px; margin: 0 auto; padding: 7rem 2rem;
        }
        .section-header {
          display: flex; align-items: baseline; gap: 2rem;
          margin-bottom: 4rem; border-bottom: 1px solid rgba(255,255,255,0.06);
          padding-bottom: 2rem;
        }
        .section-num {
          font-family: 'DM Mono', monospace; font-size: 0.68rem;
          color: rgba(255,255,255,0.18); letter-spacing: 0.2em;
        }
        .section-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.6rem, 3vw, 2.4rem);
          font-weight: 400; color: rgba(255,255,255,0.75); letter-spacing: 0.02em;
        }
        .features-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1px; background: rgba(255,255,255,0.05);
        }

        /* Pipeline section */
        .pipeline-section {
          position: relative; z-index: 10; padding: 7rem 2rem;
          text-align: center; border-top: 1px solid var(--border);
        }

        /* CTA */
        .cta-section {
          position: relative; z-index: 10; text-align: center;
          padding: 8rem 2rem 10rem; border-top: 1px solid var(--border);
        }
        .cta-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(3rem, 7vw, 6.5rem);
          font-weight: 300; color: rgba(255,255,255,0.85);
          line-height: 1.1; margin-bottom: 2rem; letter-spacing: -0.02em;
        }
        .cta-title em { font-style: italic; color: rgba(255,255,255,0.35); }
        .cta-sub {
          font-family: 'DM Sans', sans-serif; font-size: 0.95rem;
          color: rgba(255,255,255,0.25); margin-bottom: 3.5rem;
          max-width: 440px; margin-left: auto; margin-right: auto;
          line-height: 1.75; font-weight: 300;
        }
        .divider {
          width: 1px; height: 80px;
          background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.12), transparent);
          margin: 0 auto;
        }

        /* Footer */
        footer {
          position: relative; z-index: 10;
          border-top: 1px solid var(--border);
          padding: 2rem 3rem; display: flex;
          align-items: center; justify-content: space-between;
        }
        .footer-left {
          font-family: 'Cormorant Garamond', serif; font-size: 0.9rem;
          color: rgba(255,255,255,0.25); letter-spacing: 0.05em;
        }
        .footer-right {
          font-family: 'DM Mono', monospace; font-size: 0.65rem;
          color: rgba(255,255,255,0.15); letter-spacing: 0.12em;
          display: flex; gap: 2rem;
        }
        .footer-right a {
          color: rgba(255,255,255,0.15); text-decoration: none;
          text-transform: uppercase; transition: color 0.2s;
        }
        .footer-right a:hover { color: rgba(255,255,255,0.4); }

        /* Responsive */
        @media (max-width: 900px) { .features-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) {
          .features-grid { grid-template-columns: 1fr; }
          .nav { padding: 1rem 1.5rem; }
          .nav-links { display: none; }
          .hero { padding: 8rem 1.5rem 4rem; }
          .stats-section { flex-direction: column; }
          footer { flex-direction: column; gap: 1rem; text-align: center; }
          .pipeline-steps-grid { flex-direction: column !important; }
        }
      `}</style>

      {/* Background layers */}
      <GridBackground />
      <GrainOverlay />

      {/* Vignette */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse 90% 80% at 50% 30%, transparent 40%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* ── NAV ── */}
      <nav className={`nav ${scrollY > 40 ? "scrolled" : ""}`}>
        <a href="/" className="nav-logo">
          <div className="logo-mark">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
              <rect x="8" y="1" width="5" height="5" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
              <rect x="1" y="8" width="5" height="5" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
              <rect x="8" y="8" width="5" height="5" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
            </svg>
          </div>
          MLOps Automation
        </a>

        <ul className="nav-links">
          <li><a href="#pipeline">Pipeline</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href={GITHUB_LINK} target="_blank" rel="noreferrer">GitHub</a></li>
          <li><a href={DASHBOARD_LINK} className="nav-cta">Dashboard</a></li>
        </ul>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-eyebrow">
          <span className="eyebrow-line" />
          Automated ML Lifecycle
          <span className="eyebrow-line" />
        </div>

        <h1 className="hero-title">
          <span className="title-light">From commit</span>
          <span className="title-main">to production</span>
          <span className="title-accent">autonomously.</span>
        </h1>

        <p className="hero-desc">
          End-to-end automation of the complete ML lifecycle.{" "}
          <strong>GitHub Actions</strong> as the CI/CD backbone,{" "}
          <strong>Docker</strong> for containerization,{" "}
          <strong>Kubernetes on GCP</strong> for orchestration — observed
          through a live React dashboard.
        </p>

        <div className="btn-group">
          <a href={DASHBOARD_LINK} className="btn-primary" style={{ textDecoration: 'none' }}>
            <span>Get Started</span>
            <svg className="arrow" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a href="#features" className="btn-ghost">
            Explore Features
          </a>
        </div>

        {/* Pipeline viz */}
        <div
          style={{
            width: "100%",
            animation: "fadeUp 0.8s 0.45s ease both",
            animationFillMode: "both",
          }}
        >
          <PipelineDiagram />
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <div key={i} className="marquee-item">
              <span className="marquee-dot" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="stats-section">
          <StatItem value="100%" label="Lifecycle Automated" />
          <div className="stats-divider" />
          <StatItem value="5" label="Pipeline Stages" />
          <div className="stats-divider" />
          <StatItem value="< 30s" label="Avg Build Time" />
          <div className="stats-divider" />
          <StatItem value="24 / 7" label="Live Monitoring" />
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section className="features-section" id="features">
        <div className="section-header">
          <span className="section-num">01</span>
          <h2 className="section-title">What powers the pipeline</h2>
        </div>
        <div className="features-grid">
          {features.map((f) => (
            <FeatureCard key={f.number} {...f} />
          ))}
        </div>
      </section>

      {/* ── PIPELINE DETAIL ── */}
      <section className="pipeline-section" id="pipeline">
        <div style={{ marginBottom: "1rem" }}>
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "0.68rem",
              color: "rgba(255,255,255,0.2)",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
            }}
          >
            02 · Live Pipeline
          </span>
        </div>
        <h2
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
            fontWeight: 400,
            color: "rgba(255,255,255,0.7)",
            marginBottom: "4rem",
          }}
        >
          Every stage, fully automated
        </h2>

        <PipelineDiagram />

        {/* Detail row */}
        <div
          className="pipeline-steps-grid"
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "5rem",
            border: "1px solid rgba(255,255,255,0.06)",
            maxWidth: 900,
            margin: "5rem auto 0",
          }}
        >
          {pipelineSteps.map((item, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                padding: "2rem 1.5rem",
                borderRight:
                  i < pipelineSteps.length - 1
                    ? "1px solid rgba(255,255,255,0.06)"
                    : "none",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "0.62rem",
                  color: "rgba(255,255,255,0.18)",
                  letterSpacing: "0.2em",
                  marginBottom: "0.75rem",
                }}
              >
                {item.step}
              </div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.65)",
                  marginBottom: "0.4rem",
                }}
              >
                {item.title}
              </div>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "0.78rem",
                  color: "rgba(255,255,255,0.22)",
                  fontWeight: 300,
                }}
              >
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="divider" style={{ marginBottom: "5rem" }} />
        <h2 className="cta-title">
          Ship models,
          <br />
          <em>not infrastructure.</em>
        </h2>
        <p className="cta-sub">
          Stop managing pipelines manually. Your models deserve automation
          that's as rigorous as your research.
        </p>
        <div className="btn-group">
          <a href={DASHBOARD_LINK} className="btn-primary" style={{ textDecoration: 'none' }}>
            <span>Get Started</span>
            <svg className="arrow" width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a
            href={GITHUB_LINK}
            className="btn-ghost"
            target="_blank"
            rel="noreferrer"
          >
            View on GitHub
          </a>
        </div>
        <div className="divider" style={{ marginTop: "5rem" }} />
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-left">MLOps Automation</div>
        <div className="footer-right">
          <a href={GITHUB_LINK} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={DASHBOARD_LINK}>Dashboard</a>
          <span style={{ color: "rgba(255,255,255,0.1)" }}>© 2026</span>
        </div>
      </footer>
    </>
  );
}
