import { useNavigate, useLocation } from 'react-router-dom'
import pulsegridLogo from '../assets/pulsegrid-logo.png'

export default function Sidebar({
  activePage,
  disabled = false,
}) {
  const navigate = useNavigate()
  const location = useLocation()

  // Extract path to determine active state automatically if activePage prop is omitted
  const currentPath = location.pathname.toLowerCase()

  const handleNavigation = (path) => {
    if (disabled) {
      return
    }
    navigate(path)
  }

  return (
    <aside
      className={`relative sticky top-5 z-10 my-5 ml-5 flex h-[calc(100vh-40px)] flex-col self-start rounded-[20px] border border-[rgba(168,85,247,0.25)] bg-gradient-to-br from-[rgba(15,10,32,0.94)] to-[rgba(3,11,19,0.96)] px-[12px] pb-[14px] pt-[22px] shadow-[0_0_0_1px_rgba(168,85,247,0.03),0_16px_45px_rgba(0,0,0,0.35),0_0_35px_rgba(168,85,247,0.1)] backdrop-blur-[14px] before:pointer-events-none before:absolute before:inset-[-1px] before:rounded-[inherit] before:bg-[linear-gradient(145deg,rgba(168,85,247,0.12),transparent_35%,transparent_70%,rgba(0,217,255,0.12))] before:opacity-100 before:[mask-composite:exclude] before:[mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] ${
        disabled ? 'opacity-[0.72]' : ''
      }`}
      style={{
        flex: '0 0 230px',
        fontFamily: "'Nunito Sans', 'Plus Jakarta Sans', sans-serif",
      }}
    >
      {/* BRAND */}
      <div className="flex h-[48px] items-center gap-[1px] pl-[8px]">
        <img
          src={pulsegridLogo}
          alt="PulseGrid"
          className="h-[45px] w-[38px] object-contain"
        />

        <span className="flex items-center text-[18px] font-extrabold tracking-[-0.3px]">
          <strong className="text-[#b9e7fe]">Pulse</strong>

          <span className="bg-gradient-to-r from-[#00d9ff] via-[#477cff] via-[#a855f7] to-[#ec4899] bg-clip-text text-transparent [filter:drop-shadow(0_0_7px_rgba(168,85,247,0.25))]">
            Grid
          </span>
        </span>
      </div>

      {/* NAVIGATION */}
      <nav className="mt-[34px] flex flex-col gap-[5px] max-[760px]:mt-[24px] max-[760px]:gap-[4px]">
        {[
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: '📊',
            path: '/dashboard',
          },
          {
            id: 'history',
            label: 'History',
            icon: '📜',
            path: '/history',
          },
          {
            id: 'reports',
            label: 'Reports',
            icon: '📈',
            path: '/reports',
          },
          {
            id: 'learn',
            label: 'Learn',
            icon: '💡',
            path: '/learn',
          },
          {
            id: 'profile',
            label: 'Profile',
            icon: '👤',
            path: '/profile',
          },
          {
            id: 'settings',
            label: 'Settings',
            icon: '⚙️',
            path: '/settings',
          },
        ].map((item) => {
          // Highlight matches explicit activePage prop OR exact URL path matching
          const isActive =
            activePage === item.id ||
            currentPath === item.path ||
            (item.id === 'dashboard' && (currentPath === '/' || currentPath === '/measurement'))

          return (
            <button
              key={item.id}
              className={`relative flex h-[50px] w-full items-center gap-[8px] rounded-[13px] border border-transparent bg-transparent px-[15px] text-left text-[15px] font-semibold tracking-wide transition-all duration-180 max-[1050px]:gap-[10px] max-[1050px]:px-[11px] max-[760px]:h-[45px] ${
                disabled
                  ? 'cursor-not-allowed text-[#88beff]'
                  : 'cursor-pointer text-[#88beff] hover:translate-x-[2px] hover:border-[rgba(168,85,247,0.2)] hover:bg-gradient-to-r hover:from-[rgba(42,24,76,0.34)] hover:to-[rgba(15,10,32,0.42)] hover:text-[#88beff]'
              } ${
                isActive
                  ? disabled
                    ? 'border-[rgba(168,85,247,0.2)] bg-[rgba(26,16,48,0.28)] text-[#88beff]'
                    : 'border-[rgba(168,85,247,0.35)] bg-[linear-gradient(105deg,rgba(58,28,104,0.42),rgba(25,18,52,0.48),rgba(10,34,68,0.34))] text-[#88beff] shadow-[inset_0_0_18px_rgba(168,85,247,0.08),0_0_18px_rgba(168,85,247,0.08)] before:absolute before:bottom-[9px] before:left-[-1px] before:top-[9px] before:w-[3px] before:rounded-r-[5px] before:bg-gradient-to-b before:from-[#a855f7] before:via-[#477cff] before:to-[#00d9ff] before:shadow-[0_0_9px_rgba(168,85,247,0.75)]'
                  : ''
              }`}
              onClick={() => handleNavigation(item.path)}
              disabled={disabled}
            >
              <span
                className={`flex h-[25px] w-[25px] shrink-0 items-center justify-center text-center text-[18px] transition-all duration-180 ${
                  isActive
                    ? 'text-[#a855f7] [filter:drop-shadow(0_0_7px_rgba(168,85,247,0.65))]'
                    : 'text-[#88beff]/70'
                }`}
              >
                {item.icon}
              </span>

              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* USER PROFILE */}
      <div className="mt-auto pt-[20px] max-[760px]:pt-[12px]">
        <div className="flex min-h-[64px] items-center rounded-[14px] border border-[rgba(168,85,247,0.22)] bg-gradient-to-br from-[rgba(23,14,43,0.84)] to-[rgba(6,12,23,0.88)] p-[11px_13px] shadow-[inset_0_0_18px_rgba(168,85,247,0.04)]">
          <div className="mr-[11px] flex h-[25px] w-[25px] shrink-0 items-center justify-center text-[18px] text-[#88beff]">
            ♙
          </div>

          <div className="flex flex-col gap-[3px]">
            <small className="text-[12px] font-bold text-[#88beff]">
              Welcome
            </small>

            <strong className="text-[14px] font-extrabold text-[#24e6a0]">
              {localStorage.getItem('pulsegridUserName') || 'User'}
            </strong>
          </div>
        </div>
      </div>
    </aside>
  )
}