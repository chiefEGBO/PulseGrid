import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../firebase/firebase'
import pulsegridLogo from '../../assets/pulsegrid-logo.png'

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      // Persist user session info
      if (user.displayName) {
        localStorage.setItem('pulsegridUserName', user.displayName)
      }
      localStorage.setItem('user', JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      }))
      
      navigate('/dashboard')
    } catch (err) {
      // Clean up common Firebase Auth error messages
      const formattedError = err.message
        .replace('Firebase: ', '')
        .replace(/\(auth\/.*\)\.?/, '')
        .trim()
      setError(formattedError || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[radial-gradient(circle_at_50%_42%,rgba(14,36,66,0.5)_0%,rgba(5,13,27,0.8)_42%,rgba(2,5,14,0.96)_78%,#010208_100%)] text-[#a0c3f7] font-['Inter','Nunito_Sans',sans-serif]">
      {/* FUTURISTIC BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none bg-[radial-gradient(ellipse_at_50%_48%,rgba(13,38,78,0.20)_0%,rgba(4,12,28,0.12)_38%,transparent_68%)]">
        {/* Atmospheric glows */}
        <div className="absolute w-[560px] h-[560px] rounded-full blur-[110px] opacity-30 -left-[240px] -bottom-[80px] bg-[rgba(0,174,255,0.24)]" />
        <div className="absolute w-[560px] h-[560px] rounded-full blur-[110px] opacity-30 -right-[240px] -bottom-[80px] bg-[rgba(166,45,255,0.34)]" />
        {/* Large futuristic HUD rings */}
        <div className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none border border-[rgba(28,151,255,0.10)] shadow-[0_0_30px_rgba(0,145,255,0.025),inset_0_0_30px_rgba(0,145,255,0.018)] w-[420px] h-[420px] sm:w-[500px] sm:h-[500px]" />
        <div className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none border border-[rgba(57,105,255,0.075)] shadow-[0_0_30px_rgba(0,145,255,0.025),inset_0_0_30px_rgba(0,145,255,0.018)] w-[600px] h-[600px] sm:w-[700px] sm:h-[700px]" />
        <div className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none border border-[rgba(117,68,255,0.06)] shadow-[0_0_30px_rgba(0,145,255,0.025),inset_0_0_30px_rgba(0,145,255,0.018)] w-[760px] h-[760px] sm:w-[900px] sm:h-[900px]" />
        <div className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none border border-[rgba(0,183,255,0.035)] shadow-[0_0_30px_rgba(0,145,255,0.025),inset_0_0_30px_rgba(0,145,255,0.018)] w-[900px] h-[900px] sm:w-[1120px] sm:h-[1120px]" />
        {/* Subtle technical grid */}
        <div className="absolute inset-0 opacity-[0.17] bg-[linear-gradient(rgba(20,137,220,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(20,137,220,0.055)_1px,transparent_1px)] bg-[size:55px_55px] [mask-image:radial-gradient(ellipse_at_center_bottom,black_0%,rgba(0,0,0,0.8)_38%,transparent_76%)] [-webkit-mask-image:radial-gradient(ellipse_at_center_bottom,black_0%,rgba(0,0,0,0.8)_38%,transparent_76%)]" />
        {/* Futuristic wave field */}
        <svg
          className="absolute bottom-0 sm:-bottom-[15px] left-[-45%] sm:left-0 w-[190%] sm:w-full h-[45%] sm:h-[58%] overflow-visible opacity-[0.55] sm:opacity-[0.88] origin-bottom-center"
          viewBox="0 0 1600 650"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <filter id="blueGlow">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="purpleGlow">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <pattern
              id="waveMesh"
              width="38"
              height="22"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M0 11 Q19 0 38 11"
                fill="none"
                stroke="rgba(0,180,255,0.16)"
                strokeWidth="0.7"
              />
              <path
                d="M0 0 Q19 11 38 0"
                fill="none"
                stroke="rgba(100,80,255,0.10)"
                strokeWidth="0.5"
              />
            </pattern>
            <linearGradient
              id="waveGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#00bfff" />
              <stop offset="38%" stopColor="#087dff" />
              <stop offset="60%" stopColor="#5548ff" />
              <stop offset="100%" stopColor="#d62cff" />
            </linearGradient>
          </defs>
          <path
            d="M0 390 C120 315 220 470 350 390 C480 310 570 470 700 390 C830 310 930 470 1050 390 C1180 310 1300 470 1420 390 C1500 340 1560 350 1600 370 L1600 650 L0 650 Z"
            fill="url(#waveMesh)"
            opacity="0.75"
          />
          <g fill="none" stroke="#00bfff" filter="url(#blueGlow)">
            <path d="M-40 455 C90 355 180 510 310 420 C430 335 535 510 665 420 C790 335 900 505 1030 420" strokeWidth="2" opacity="0.85" />
            <path d="M-50 490 C80 390 190 545 320 450 C445 360 540 540 675 450 C805 360 900 535 1035 450" strokeWidth="1.2" opacity="0.55" />
            <path d="M-30 525 C100 425 205 580 335 485 C455 395 560 575 690 485 C810 395 920 570 1050 485" strokeWidth="1" opacity="0.38" />
            <path d="M-20 560 C110 460 220 615 350 520 C475 430 575 610 705 520 C830 430 930 605 1065 520" strokeWidth="0.8" opacity="0.28" />
          </g>
          <g fill="none" stroke="#c52cff" filter="url(#purpleGlow)">
            <path d="M600 420 C730 330 820 500 950 410 C1080 320 1180 505 1310 410 C1430 325 1510 470 1650 370" strokeWidth="2" opacity="0.85" />
            <path d="M590 455 C720 365 825 535 955 445 C1085 350 1185 540 1320 445 C1440 355 1520 505 1660 405" strokeWidth="1.2" opacity="0.58" />
            <path d="M575 490 C710 400 820 570 965 480 C1090 390 1195 575 1330 480 C1450 390 1535 535 1670 440" strokeWidth="1" opacity="0.42" />
            <path d="M565 525 C700 435 815 605 970 515 C1100 425 1200 610 1340 515 C1460 425 1540 570 1680 475" strokeWidth="0.8" opacity="0.30" />
          </g>
          <path
            d="M-20 475 C110 375 210 535 335 445 C465 350 565 545 700 445 C830 350 930 535 1060 445 C1190 350 1300 535 1430 445 C1510 390 1570 410 1620 385"
            fill="none"
            stroke="url(#waveGradient)"
            strokeWidth="2.2"
            filter="url(#blueGlow)"
          />
          <g fill="#00c8ff">
            <circle cx="160" cy="425" r="3" />
            <circle cx="335" cy="445" r="2.5" />
            <circle cx="510" cy="410" r="3" />
            <circle cx="700" cy="445" r="2.5" />
          </g>
          <g fill="#d82cff">
            <circle cx="1060" cy="445" r="2.5" />
            <circle cx="1210" cy="405" r="3" />
            <circle cx="1430" cy="445" r="2.5" />
            <circle cx="1570" cy="405" r="3" />
          </g>
        </svg>

        {/* Small floating data particles */}
        <span className="absolute w-[3px] h-[3px] rounded-full bg-[#00c8ff] shadow-[0_0_6px_rgba(0,195,255,0.95),0_0_14px_rgba(0,195,255,0.55)] animate-[ping_3.5s_ease-in-out_infinite] left-[8%] bottom-[28%]" />
        <span className="absolute w-[3px] h-[3px] rounded-full bg-[#00c8ff] shadow-[0_0_6px_rgba(0,195,255,0.95),0_0_14px_rgba(0,195,255,0.55)] animate-[ping_3.5s_ease-in-out_infinite] left-[18%] bottom-[20%] [animation-delay:0.8s]" />
        <span className="absolute w-[3px] h-[3px] rounded-full bg-[#00c8ff] shadow-[0_0_6px_rgba(0,195,255,0.95),0_0_14px_rgba(0,195,255,0.55)] animate-[ping_3.5s_ease-in-out_infinite] left-[31%] bottom-[31%] [animation-delay:1.5s]" />
        <span className="absolute w-[3px] h-[3px] rounded-full bg-[#c72cff] shadow-[0_0_6px_rgba(199,44,255,0.95),0_0_14px_rgba(199,44,255,0.55)] animate-[ping_3.5s_ease-in-out_infinite] right-[29%] bottom-[24%] [animation-delay:0.5s]" />
        <span className="absolute w-[3px] h-[3px] rounded-full bg-[#d82cff] shadow-[0_0_6px_rgba(216,44,255,0.95),0_0_14px_rgba(216,44,255,0.55)] animate-[ping_3.5s_ease-in-out_infinite] right-[17%] bottom-[30%] [animation-delay:1.8s]" />
        <span className="absolute w-[3px] h-[3px] rounded-full bg-[#00c8ff] shadow-[0_0_6px_rgba(0,195,255,0.95),0_0_14px_rgba(0,195,255,0.55)] animate-[ping_3.5s_ease-in-out_infinite] right-[7%] bottom-[22%] [animation-delay:2.2s]" />
      </div>
      
      {/* MAIN CONTENT */}
      <main className="relative z-10 min-h-screen flex items-center justify-center px-4 py-[25px] sm:px-[20px] sm:py-[40px]">
        <section className="relative w-full max-w-[440px] px-6 py-[30px] sm:px-[38px] sm:py-[34px] pb-[26px] sm:pb-[30px] bg-[linear-gradient(145deg,rgba(9,24,39,0.94),rgba(3,9,19,0.96))] border border-[rgba(94,145,194,0.28)] rounded-[16px] sm:rounded-[18px] shadow-[0_25px_80px_rgba(0,0,0,0.72),0_0_45px_rgba(0,145,255,0.09),0_0_85px_rgba(126,43,255,0.055),inset_0_1px_0_rgba(255,255,255,0.045)] backdrop-blur-[20px] before:content-[''] before:absolute before:inset-[-1px] before:rounded-[inherit] before:p-[1px] before:bg-[linear-gradient(135deg,rgba(0,195,255,0.65),rgba(0,195,255,0.08)_32%,transparent_50%,rgba(168,66,255,0.08)_68%,rgba(190,54,255,0.55))] before:[mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] before:[mask-composite:exclude] before:pointer-events-none after:content-[''] after:absolute after:inset-[10px] after:rounded-[inherit] after:-z-10 after:bg-[linear-gradient(90deg,rgba(0,190,255,0.10),transparent_40%,rgba(180,50,255,0.10))] after:blur-[35px] after:opacity-80">
          
          {/* Branding */}
          <div className="flex items-center justify-center gap-0 mb-[22px] sm:mb-[25px]">
            <img
              src={pulsegridLogo}
              alt="PulseGrid"
              className="w-[50px] h-[50px] sm:w-[58px] sm:h-[58px] object-contain drop-shadow-[0_0_8px_rgba(0,190,255,0.55)] drop-shadow-[0_0_18px_rgba(172,44,255,0.30)]"
            />
            <span className="flex items-center text-[24px] sm:text-[28px] font-semibold tracking-[-1.1px] leading-none">
              <span className="text-[#b3caff]">Pulse</span>
              <span className="bg-[linear-gradient(90deg,#27baff,#5f74ff_45%,#bd3cff)] bg-clip-text text-transparent [text-shadow:0_0_20px_rgba(77,103,255,0.25)]">
                Grid
              </span>
            </span>
          </div>
          {/* Heading */}
          <div className="text-center mb-[28px]">
            <h1 className="m-0 text-[22px] sm:text-[24px] font-semibold tracking-[-0.5px] text-[#b3ccff]">
              Welcome Back
            </h1>
            <p className="mt-[8px] mb-0 text-[13px] text-[rgba(173,213,255,0.821)]">
              Login to continue to your account
            </p>
          </div>
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-[12px] text-center">
              {error}
            </div>
          )}
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-[19px]">
            {/* Email */}
            <div className="flex flex-col gap-[8px]">
              <label htmlFor="email" className="text-[12px] font-medium text-[rgba(174,212,250,0.84)]">
                Email Address
              </label>
              <div className="relative h-[48px] flex items-center rounded-[9px] bg-[rgba(2,10,19,0.84)] border border-[rgba(95,133,168,0.24)] transition-all duration-200 focus-within:border-[rgba(0,194,255,0.65)] focus-within:bg-[rgba(3,13,24,0.94)] focus-within:shadow-[0_0_0_3px_rgba(0,191,255,0.055),0_0_20px_rgba(0,166,255,0.11)]">
                <span className="w-[45px] flex items-center justify-center text-[#12c1f5]">
                  <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 7l9 6 9-6" />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="flex-1 min-w-0 h-full border-none outline-none bg-transparent text-[#bedcff] text-[13px] placeholder:text-[rgba(139,158,180,0.48)] autofill:text-[#c7e1ff] autofill:[box-shadow:0_0_0_1000px_#06111d_inset]"
                />
              </div>
            </div>
            {/* Password */}
            <div className="flex flex-col gap-[8px]">
              <label htmlFor="password" className="text-[12px] font-medium text-[rgba(174,212,250,0.84)]">
                Password
              </label>
              <div className="relative h-[48px] flex items-center rounded-[9px] bg-[rgba(2,10,19,0.84)] border border-[rgba(95,133,168,0.24)] transition-all duration-200 focus-within:border-[rgba(0,194,255,0.65)] focus-within:bg-[rgba(3,13,24,0.94)] focus-within:shadow-[0_0_0_3px_rgba(0,191,255,0.055),0_0_20px_rgba(0,166,255,0.11)]">
                <span className="w-[45px] flex items-center justify-center text-[#12c1f5]">
                  <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                    <rect x="5" y="10" width="14" height="10" rx="2" />
                    <path d="M8 10V7a4 4 0 018 0v3" />
                  </svg>
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="flex-1 min-w-0 h-full border-none outline-none bg-transparent text-[#bedcff] text-[13px] placeholder:text-[rgba(139,158,180,0.48)] autofill:text-[#c7e1ff] autofill:[box-shadow:0_0_0_1000px_#06111d_inset]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="w-[44px] h-full flex items-center justify-center border-none bg-transparent text-[rgba(156,176,197,0.67)] cursor-pointer transition-all duration-200 hover:text-[#c3e3fe] hover:scale-105"
                >
                  {showPassword ? (
                    <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <path d="M3 3l18 18" />
                      <path d="M10.6 10.6a2 2 0 002.8 2.8" />
                      <path d="M9.9 5.1A10.5 10.5 0 0112 5c5 0 8.5 3.5 9.5 7-.4 1.4-1.2 2.7-2.3 3.8" />
                      <path d="M6.2 6.2C4.7 7.3 3.7 9 2.5 12c1 3.5 4.5 7 9.5 7 1.4 0 2.7-.3 3.9-.8" />
                    </svg>
                  ) : (
                    <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                      <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7z" />
                      <circle cx="12" cy="12" r="2.5" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {/* Remember / Forgot */}
            <div className="flex items-center justify-between -mt-[3px]">
              <label className="relative flex items-center gap-[7px] text-[11px] text-[rgba(177,215,255,0.879)] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="peer absolute opacity-0 pointer-events-none"
                />
                <span className="w-[14px] h-[14px] rounded-[3px] border border-[rgba(48,153,211,0.58)] bg-[rgba(2,11,20,0.8)] transition-all duration-200 peer-checked:bg-[linear-gradient(135deg,#00bfff,#8739ff)] peer-checked:border-transparent peer-checked:shadow-[0_0_10px_rgba(0,191,255,0.30)] flex items-center justify-center after:content-['✓'] after:hidden peer-checked:after:block after:text-[#bbdaff] after:text-[10px] after:leading-none" />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                className="border-none p-0 bg-transparent text-[#38bfff] text-[11px] cursor-pointer transition-colors duration-200 hover:text-[#b875ff]"
              >
                Forgot password?
              </button>
            </div>
            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative h-[48px] mt-[3px] border-none rounded-[9px] bg-[linear-gradient(100deg,#08baf2_0%,#357cf4_46%,#9a32ed_100%)] text-white text-[14px] font-semibold cursor-pointer overflow-hidden shadow-[0_8px_24px_rgba(48,105,239,0.25),0_0_24px_rgba(117,43,237,0.15)] transition-all duration-200 hover:-translate-y-[1px] hover:brightness-[1.08] hover:shadow-[0_10px_32px_rgba(48,105,239,0.30),0_0_28px_rgba(117,43,237,0.22)] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute inset-0 bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,0.23)_50%,transparent_80%)] -translate-x-[120%] transition-transform duration-550 group-hover:translate-x-[120%]" />
              <span>{loading ? 'Logging in...' : 'Login'}</span>
            </button>
          </form>
          {/* Register Prompt */}
          <div className="flex justify-center items-center gap-[5px] mt-[24px] text-[11px] text-[rgba(176,214,255,0.808)]">
            <span>Don't have an account?</span>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="border-none p-0 bg-transparent text-[#4dc4ff] text-[11px] font-medium cursor-pointer transition-colors duration-200 hover:text-[#b56cff]"
            >
              Register
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}