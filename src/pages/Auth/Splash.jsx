import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import pulsegridLogo from '../../assets/pulsegrid-logo.png'

// Dynamic multi-colored stars with varied timing
const STARS = [
  // Large Glowing Stars
  { l: 12, t: 15, s: 4, o: 0.9, color: 'bg-[#00C8FF]', glow: 'shadow-[0_0_10px_#00C8FF]', dur: '2.5s', delay: '0s' },
  { l: 85, t: 20, s: 5, o: 0.95, color: 'bg-[#FF3CAC]', glow: 'shadow-[0_0_12px_#FF3CAC]', dur: '3.2s', delay: '0.4s' },
  { l: 22, t: 78, s: 4, o: 0.85, color: 'bg-[#7B4DFF]', glow: 'shadow-[0_0_10px_#7B4DFF]', dur: '2.8s', delay: '0.8s' },
  { l: 78, t: 82, s: 4.5, o: 0.9, color: 'bg-[#00C8FF]', glow: 'shadow-[0_0_11px_#00C8FF]', dur: '3.5s', delay: '1.2s' },
  { l: 50, t: 10, s: 4, o: 0.8, color: 'bg-white', glow: 'shadow-[0_0_8px_#ffffff]', dur: '2.2s', delay: '0.2s' },
  
  // Medium Neon Stars
  { l: 8, t: 45, s: 3, o: 0.75, color: 'bg-[#00C8FF]', glow: 'shadow-[0_0_6px_#00C8FF]', dur: '2.4s', delay: '1.5s' },
  { l: 18, t: 32, s: 3, o: 0.8, color: 'bg-[#C04CFF]', glow: 'shadow-[0_0_7px_#C04CFF]', dur: '3.1s', delay: '0.3s' },
  { l: 30, t: 88, s: 2.5, o: 0.7, color: 'bg-white', glow: 'shadow-[0_0_5px_#ffffff]', dur: '2.7s', delay: '0.9s' },
  { l: 42, t: 18, s: 3.5, o: 0.85, color: 'bg-[#00C8FF]', glow: 'shadow-[0_0_8px_#00C8FF]', dur: '2.1s', delay: '1.1s' },
  { l: 62, t: 12, s: 3, o: 0.75, color: 'bg-[#FF3CAC]', glow: 'shadow-[0_0_6px_#FF3CAC]', dur: '3.8s', delay: '0.6s' },
  { l: 70, t: 68, s: 3, o: 0.8, color: 'bg-[#7B4DFF]', glow: 'shadow-[0_0_7px_#7B4DFF]', dur: '2.9s', delay: '1.4s' },
  { l: 88, t: 52, s: 3, o: 0.85, color: 'bg-[#00C8FF]', glow: 'shadow-[0_0_7px_#00C8FF]', dur: '2.3s', delay: '0.1s' },
  { l: 92, t: 30, s: 3.5, o: 0.8, color: 'bg-[#C04CFF]', glow: 'shadow-[0_0_8px_#C04CFF]', dur: '3.3s', delay: '0.7s' },

  // Small Distant Ambient Stars
  { l: 5, t: 82, s: 1.5, o: 0.5, color: 'bg-white', glow: '', dur: '1.8s', delay: '0.5s' },
  { l: 14, t: 22, s: 2, o: 0.6, color: 'bg-[#a5c5fc]', glow: '', dur: '2.6s', delay: '1.0s' },
  { l: 25, t: 48, s: 2, o: 0.55, color: 'bg-[#00C8FF]', glow: '', dur: '3.0s', delay: '0.2s' },
  { l: 35, t: 75, s: 1.5, o: 0.45, color: 'bg-white', glow: '', dur: '2.0s', delay: '1.3s' },
  { l: 48, t: 85, s: 2, o: 0.6, color: 'bg-[#FF3CAC]', glow: '', dur: '2.8s', delay: '0.8s' },
  { l: 55, t: 25, s: 2, o: 0.5, color: 'bg-[#7B4DFF]', glow: '', dur: '2.2s', delay: '0.4s' },
  { l: 72, t: 28, s: 2, o: 0.6, color: 'bg-white', glow: '', dur: '3.4s', delay: '1.6s' },
  { l: 82, t: 15, s: 1.5, o: 0.4, color: 'bg-[#a5c5fc]', glow: '', dur: '1.9s', delay: '0.1s' },
  { l: 94, t: 88, s: 2, o: 0.55, color: 'bg-[#00C8FF]', glow: '', dur: '2.5s', delay: '1.1s' },
]

export default function Splash() {
  const [progress, setProgress] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((current) => {
        if (current >= 100) {
          clearInterval(interval)
          return 100
        }
        return current + 1
      })
    }, 50)

    return () => clearInterval(interval)
  }, [])

  // Redirect to register prompt upon reaching 100%
  useEffect(() => {
    if (progress === 100) {
      const timeout = setTimeout(() => {
        navigate('/register')
      }, 400) // Brief delay for smoother transition visually

      return () => clearTimeout(timeout)
    }
  }, [progress, navigate])

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#020308] font-sans">
      {/* Dynamic Keyframes for ECG Motion & Star Twinkle */}
      <style>{`
        @keyframes ecgPulse {
          0% { stroke-dashoffset: 1200; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes starTwinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .animate-ecg {
          stroke-dasharray: 1200;
          animation: ecgPulse 2.5s linear infinite;
        }
        .animate-star-glow {
          animation: starTwinkle var(--star-dur) ease-in-out infinite;
          animation-delay: var(--star-delay);
        }
      `}</style>

      {/* =====================================================
          DYNAMIC MULTI-COLOR STAR FIELD
      ====================================================== */}
      <div className="pointer-events-none absolute inset-0">
        {STARS.map((star, idx) => (
          <span
            key={idx}
            className={`absolute rounded-full ${star.color} ${star.glow} animate-star-glow`}
            style={{
              left: `${star.l}%`,
              top: `${star.t}%`,
              width: `${star.s}px`,
              height: `${star.s}px`,
              opacity: star.o,
              '--star-dur': star.dur,
              '--star-delay': star.delay,
            }}
          />
        ))}
      </div>

      {/* =====================================================
          ATMOSPHERE GLOW OVERLAY
      ====================================================== */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,200,255,0.08)_0%,rgba(123,77,255,0.05)_40%,transparent_75%)]" />

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}
      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center px-6">
        
        {/* LOGO */}
        <div className="relative mb-1 flex h-56 w-56 items-center justify-center">
          <img
            src={pulsegridLogo}
            alt="PulseGrid heart monitoring logo"
            className="h-auto w-72 translate-y-4 object-contain filter drop-shadow-[0_0_25px_rgba(0,200,255,0.4)]"
            draggable="false"
          />
        </div>

        {/* BRAND NAME */}
        <h1 className="text-6xl font-extrabold tracking-tight filter drop-shadow-[0_0_20px_rgba(0,200,255,0.45)]">
          <span className="text-white">Pulse</span>
          <span className="bg-gradient-to-r from-[#00C8FF] via-[#7B4DFF] to-[#FF3CAC] bg-clip-text text-transparent">
            Grid
          </span>
        </h1>

        {/* SUBTITLE */}
        <p className="mt-3 text-sm font-bold tracking-[0.22em] text-[#a5c5fc] drop-shadow-[0_0_10px_rgba(165,197,252,0.5)]">
          SMART HEART MONITORING
        </p>

{/* =================================================
            ANIMATED REAL-TIME ECG PULSE WAVE (4 ECG BEAT SPIKES)
        ================================================== */}
        <div className="mt-12 h-20 w-full max-w-2xl">
          <svg
            viewBox="0 0 720 80"
            className="h-full w-full overflow-visible"
            preserveAspectRatio="none"
          >
            {/* Background Dim Baseline Path */}
            <path
              d="M0 40 H75 L82 40 L88 32 L95 48 L104 10 L114 68 L123 34 L132 40 H255 L262 40 L268 32 L275 48 L284 10 L294 68 L303 34 L312 40 H435 L442 40 L448 32 L455 48 L464 10 L474 68 L483 34 L492 40 H615 L622 40 L628 32 L635 48 L644 10 L654 68 L663 34 L672 40 H720"
              fill="none"
              stroke="#00C8FF"
              strokeWidth="1.5"
              opacity="0.15"
            />

            {/* Glowing Neon Soft Ambient Trail */}
            <path
              d="M0 40 H75 L82 40 L88 32 L95 48 L104 10 L114 68 L123 34 L132 40 H255 L262 40 L268 32 L275 48 L284 10 L294 68 L303 34 L312 40 H435 L442 40 L448 32 L455 48 L464 10 L474 68 L483 34 L492 40 H615 L622 40 L628 32 L635 48 L644 10 L654 68 L663 34 L672 40 H720"
              fill="none"
              stroke="url(#ecgGradient)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-ecg"
              filter="url(#ecgGlow)"
            />

            {/* Sharp Moving Core Pulse */}
            <path
              d="M0 40 H75 L82 40 L88 32 L95 48 L104 10 L114 68 L123 34 L132 40 H255 L262 40 L268 32 L275 48 L284 10 L294 68 L303 34 L312 40 H435 L442 40 L448 32 L455 48 L464 10 L474 68 L483 34 L492 40 H615 L622 40 L628 32 L635 48 L644 10 L654 68 L663 34 L672 40 H720"
              fill="none"
              stroke="url(#ecgGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-ecg"
            />

            <defs>
              <linearGradient id="ecgGradient" x1="0" y1="0" x2="720" y2="0" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#00C8FF" />
                <stop offset="40%" stopColor="#00C8FF" />
                <stop offset="65%" stopColor="#7B4DFF" />
                <stop offset="85%" stopColor="#FF3CAC" />
                <stop offset="100%" stopColor="#00C8FF" />
              </linearGradient>

              <filter id="ecgGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" />
              </filter>
            </defs>
          </svg>
        </div>

        {/* =================================================
            PROGRESS / LOADING
        ================================================== */}
        <div className="mt-14 w-full max-w-xs">
          <div className="mb-3 flex justify-center">
            <span className="text-sm font-medium text-[#a5c5fc] drop-shadow-[0_0_8px_rgba(165,197,252,0.4)]">
              {progress < 100 ? 'Initialising PulseGrid...' : 'Redirecting...'}
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-white/10 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#00C8FF] via-[#7B4DFF] to-[#FF3CAC] transition-all duration-75 shadow-[0_0_12px_rgba(0,200,255,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="mt-3 text-right">
            <span className="text-sm font-bold text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]">
              {progress}%
            </span>
          </div>
        </div>

      </div>
    </main>
  )
}