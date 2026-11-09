import { useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { auth, db } from '../../firebase/firebase'
import Sidebar from '../../components/Sidebar'

function normalizeMeasurement(item, index) {
  const heartRate = Number(
    item.heartRate ??
    item.heart_rate ??
    item.bpm ??
    item.heartRateValue
  )
  const spo2 = Number(
    item.spo2 ??
    item.SpO2 ??
    item.spO2 ??
    item.bloodOxygen ??
    item.oxygen
  )
  let timestamp = item.timestamp ?? item.dateTime ?? item.date
  if (!timestamp && item.time) {
    timestamp = `2025-05-06T${convertTimeTo24Hour(item.time)}`
  }
  
  let dateObject = new Date()
  if (timestamp) {
    if (typeof timestamp?.toDate === 'function') {
      dateObject = timestamp.toDate()
    } else if (typeof timestamp?.seconds === 'number') {
      dateObject = new Date(timestamp.seconds * 1000)
    } else {
      dateObject = new Date(timestamp)
    }
  }

  return {
    id: item.id ?? `${timestamp ?? 'measurement'}-${index}`,
    timestamp: Number.isNaN(dateObject.getTime())
      ? new Date().toISOString()
      : dateObject.toISOString(),
    time:
      item.time ??
      (
        Number.isNaN(dateObject.getTime())
          ? '--'
          : dateObject.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
      ),
    heartRate: Number.isFinite(heartRate) && heartRate > 0 ? heartRate : null,
    spo2: Number.isFinite(spo2) && spo2 > 0 ? spo2 : null,
    signalQuality:
      item.signalQuality ??
      item.signal ??
      'Good',
    stability:
      item.stability ??
      item.readingStability ??
      'Stable',
  }
}

function convertTimeTo24Hour(time) {
  const match = String(time).match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
  )
  if (!match) {
    return '12:00:00'
  }
  let hour = Number(match[1])
  const minute = match[2]
  const period = match[3].toUpperCase()
  if (period === 'PM' && hour !== 12) {
    hour += 12
  }
  if (period === 'AM' && hour === 12) {
    hour = 0
  }
  return `${String(hour).padStart(2, '0')}:${minute}:00`
}

function calculateStats(values) {
  const validValues = values.filter(
    value => value !== null && Number.isFinite(value)
  )
  if (validValues.length === 0) {
    return {
      average: '--',
      highest: '--',
      lowest: '--',
    }
  }
  const total = validValues.reduce(
    (sum, value) => sum + value,
    0
  )
  return {
    average: Math.round((total / validValues.length) * 10) / 10,
    highest: Math.max(...validValues),
    lowest: Math.min(...validValues),
  }
}

/* SVG PATH GENERATOR */
function createSmoothPath(values, minValue, maxValue) {
  const validValues = values.map(value =>
    value !== null && Number.isFinite(value) ? value : null
  )
  if (validValues.length === 0 || validValues.every(v => v === null)) {
    return ''
  }
  if (validValues.length === 1) {
    const safeVal = validValues[0] ?? minValue
    const y =
      190 -
      ((safeVal - minValue) /
        (maxValue - minValue)) *
        160
    return `M 0 ${y} L 900 ${y}`
  }
  const points = validValues.map((value, index) => {
    const x =
      (index / (validValues.length - 1)) * 900
    const safeValue =
      value ?? validValues[index - 1] ?? minValue
    const y =
      190 -
      ((safeValue - minValue) /
        (maxValue - minValue)) *
        160
    return { x, y }
  })
  let path = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i += 1) {
    const current = points[i]
    const next = points[i + 1]
    const midX = (current.x + next.x) / 2
    path += `
      C
      ${midX} ${current.y},
      ${midX} ${next.y},
      ${next.x} ${next.y}
    `
  }
  return path
}

function createAreaPath(values, minValue, maxValue) {
  const linePath = createSmoothPath(
    values,
    minValue,
    maxValue
  )
  if (!linePath) {
    return ''
  }
  return `
    ${linePath}
    L 900 230
    L 0 230
    Z
  `
}

/* DATE HELPERS */
function toDateInputValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatHeaderDate(date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatShortDate(value) {
  if (!value) {
    return '--'
  }
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/* HISTORY COMPONENT */
function History() {
  const today = new Date()
  const [activeFilter, setActiveFilter] = useState('today')
  const [customStart, setCustomStart] = useState(
    toDateInputValue(today)
  )
  const [customEnd, setCustomEnd] = useState(
    toDateInputValue(today)
  )
  const [showAll, setShowAll] = useState(false)
  const [rawMeasurements, setRawMeasurements] = useState([])

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setRawMeasurements([])
        return
      }

      const q = query(
        collection(db, 'measurements'),
        where('userId', '==', currentUser.uid)
      )

      const unsubscribeSnapshot = onSnapshot(
        q,
        (snapshot) => {
          const docs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          setRawMeasurements(docs)
        },
        (error) => {
          console.error('Firestore measurements subscription error:', error)
          setRawMeasurements([])
        }
      )

      return () => unsubscribeSnapshot()
    })

    return () => unsubscribeAuth()
  }, [])

  const measurements = useMemo(() => {
    return rawMeasurements
      .map(normalizeMeasurement)
      .sort(
        (a, b) =>
          new Date(b.timestamp) -
          new Date(a.timestamp)
      )
  }, [rawMeasurements])

  /* FILTER MEASUREMENTS */
  const filteredMeasurements = useMemo(() => {
    const now = new Date()
    if (activeFilter === 'today') {
      const start = new Date(now)
      start.setHours(0, 0, 0, 0)
      const end = new Date(now)
      end.setHours(23, 59, 59, 999)
      return measurements.filter(item => {
        const date = new Date(item.timestamp)
        return date >= start && date <= end
      })
    }
    if (activeFilter === 'week') {
      const start = new Date(now)
      start.setDate(now.getDate() - 6)
      start.setHours(0, 0, 0, 0)
      return measurements.filter(item => {
        const date = new Date(item.timestamp)
        return date >= start && date <= now
      })
    }
    if (activeFilter === 'month') {
      const start = new Date(now)
      start.setDate(now.getDate() - 29)
      start.setHours(0, 0, 0, 0)
      return measurements.filter(item => {
        const date = new Date(item.timestamp)
        return date >= start && date <= now
      })
    }
    if (activeFilter === 'custom') {
      if (!customStart || !customEnd) {
        return []
      }
      const start = new Date(
        `${customStart}T00:00:00`
      )
      const end = new Date(
        `${customEnd}T23:59:59`
      )
      if (start > end) {
        return []
      }
      return measurements.filter(item => {
        const date = new Date(item.timestamp)
        return date >= start && date <= end
      })
    }
    return measurements
  }, [
    activeFilter,
    customStart,
    customEnd,
    measurements,
  ])

  /* STATISTICS */
  const heartRateStats = useMemo(() => {
    return calculateStats(
      filteredMeasurements.map(
        item => item.heartRate
      )
    )
  }, [filteredMeasurements])

  const spo2Stats = useMemo(() => {
    return calculateStats(
      filteredMeasurements.map(
        item => item.spo2
      )
    )
  }, [filteredMeasurements])

  /* GRAPH PATHS */
  const heartRateValues = filteredMeasurements
    .slice()
    .reverse()
    .map(item => item.heartRate)
  const spo2Values = filteredMeasurements
    .slice()
    .reverse()
    .map(item => item.spo2)

  const heartPath = createSmoothPath(
    heartRateValues,
    40,
    120
  )
  const heartAreaPath = createAreaPath(
    heartRateValues,
    40,
    120
  )
  const spo2Path = createSmoothPath(
    spo2Values,
    90,
    100
  )
  const spo2AreaPath = createAreaPath(
    spo2Values,
    90,
    100
  )

  /* TABLE */
  const visibleMeasurements = showAll
    ? filteredMeasurements
    : filteredMeasurements.slice(0, 5)

  /* RANGE LABEL */
  const filterDescription = {
    today: "Showing today's measurements",
    week: 'Showing measurements from the last 7 days',
    month: 'Showing measurements from the last 30 days',
    custom:
      customStart && customEnd
        ? `Showing ${formatShortDate(customStart)} – ${formatShortDate(customEnd)}`
        : 'Choose a date range',
  }[activeFilter]

  return (
    <div className="w-full min-h-screen flex overflow-hidden max-md:overflow-y-auto bg-[radial-gradient(circle_at_78%_8%,rgba(92,52,190,0.20),transparent_30%),radial-gradient(circle_at_42%_72%,rgba(0,190,255,0.055),transparent_35%),#020812] text-white font-['Poppins','Inter',sans-serif]">
      <Sidebar activePage="history" />
      <main className="flex-1 min-w-0 h-screen max-md:h-auto max-md:min-h-screen max-md:overflow-visible pt-5 pb-[18px] px-6 max-lg:px-[18px] max-[850px]:min-[951px]:pt-[14px] overflow-y-auto overflow-x-hidden [scrollbar-width:thin] [scrollbar-color:rgba(0,190,255,0.25)_transparent] [&::-webkit-scrollbar]:w-[5px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-[10px] [&::-webkit-scrollbar-thumb]:bg-[rgba(0,190,255,0.25)]">
        
        {/* HEADER */}
        <header className="min-h-[96px] max-sm:min-h-0 flex items-start justify-between mb-[11px] max-sm:gap-[15px] max-[850px]:min-[951px]:min-h-[48px] max-[850px]:min-[951px]:mb-2">
          <div>
            <h1 className="m-0 text-[#b1d6ff] text-[35px] max-[850px]:min-[951px]:text-[25px] font-semibold tracking-[-0.8px] [text-shadow:0_0_18px_rgba(255,255,255,0.06)]">History</h1>
            <p className="mt-[3px] mb-0 text-[#a2cbf1] text-[13px]">
              View and analyze your past measurements
            </p>
          </div>
          <div className="min-w-[118px] max-sm:min-w-0 h-[39px] px-[13px] flex items-center justify-center gap-[10px] border border-[rgba(114,189,240,0.3)] rounded-[9px] bg-[linear-gradient(135deg,rgba(8,26,42,0.9),rgba(6,16,29,0.9))] text-[#a3cdf7] text-[11px] shadow-[0_0_18px_rgba(0,130,200,0.05)]">
            <span>
              {formatHeaderDate(today)}
            </span>
            <span className="text-[#70a4c5] text-[12px]">
              ▣
            </span>
          </div>
        </header>

        {/* FILTER BAR */}
        <section className="min-h-[48px] max-[850px]:min-[951px]:min-h-[43px] flex max-sm:flex-col items-center max-sm:items-start justify-between mb-[10px] max-[850px]:min-[951px]:mb-2 p-[4px_7px] max-sm:p-[7px] max-sm:gap-[7px] border border-[rgba(66,116,151,0.23)] rounded-[10px] bg-[rgba(5,17,29,0.78)] shadow-[inset_0_0_20px_rgba(0,120,190,0.025)]">
          <div className="min-h-full flex items-center gap-[5px]">
            <button
              type="button"
              className={`min-w-[82px] h-[36px] max-[850px]:min-[951px]:h-[32px] px-[15px] flex items-center justify-center gap-2 border rounded-[7px] font-inherit text-[11px] font-medium cursor-pointer transition-all duration-180 ease-in-out hover:text-[#a6d0f7] hover:bg-[rgba(20,65,90,0.20)] hover:-translate-y-[1px] ${
                activeFilter === 'today'
                  ? 'text-[#a7dcf6] border-[rgba(0,205,255,0.38)] bg-[linear-gradient(100deg,rgba(0,167,231,0.22),rgba(96,68,218,0.22))] shadow-[0_0_15px_rgba(0,190,255,0.10),inset_0_0_12px_rgba(0,190,255,0.035)]'
                  : 'text-[#7ea1c2] border-transparent bg-transparent'
              }`}
              onClick={() => setActiveFilter('today')}
            >
              Today
            </button>
            <button
              type="button"
              className={`min-w-[82px] h-[36px] max-[850px]:min-[951px]:h-[32px] px-[15px] flex items-center justify-center gap-2 border rounded-[7px] font-inherit text-[11px] font-medium cursor-pointer transition-all duration-180 ease-in-out hover:text-[#a6d0f7] hover:bg-[rgba(20,65,90,0.20)] hover:-translate-y-[1px] ${
                activeFilter === 'week'
                  ? 'text-[#a7dcf6] border-[rgba(0,205,255,0.38)] bg-[linear-gradient(100deg,rgba(0,167,231,0.22),rgba(96,68,218,0.22))] shadow-[0_0_15px_rgba(0,190,255,0.10),inset_0_0_12px_rgba(0,190,255,0.035)]'
                  : 'text-[#7ea1c2] border-transparent bg-transparent'
              }`}
              onClick={() => setActiveFilter('week')}
            >
              This Week
            </button>
            <button
              type="button"
              className={`min-w-[82px] h-[36px] max-[850px]:min-[951px]:h-[32px] px-[15px] flex items-center justify-center gap-2 border rounded-[7px] font-inherit text-[11px] font-medium cursor-pointer transition-all duration-180 ease-in-out hover:text-[#a6d0f7] hover:bg-[rgba(20,65,90,0.20)] hover:-translate-y-[1px] ${
                activeFilter === 'month'
                  ? 'text-[#a7dcf6] border-[rgba(0,205,255,0.38)] bg-[linear-gradient(100deg,rgba(0,167,231,0.22),rgba(96,68,218,0.22))] shadow-[0_0_15px_rgba(0,190,255,0.10),inset_0_0_12px_rgba(0,190,255,0.035)]'
                  : 'text-[#7ea1c2] border-transparent bg-transparent'
              }`}
              onClick={() => setActiveFilter('month')}
            >
              This Month
            </button>
            <button
              type="button"
              className={`min-w-[82px] h-[36px] max-[850px]:min-[951px]:h-[32px] px-[15px] flex items-center justify-center gap-2 border rounded-[7px] font-inherit text-[11px] font-medium cursor-pointer transition-all duration-180 ease-in-out hover:text-[#a6d0f7] hover:bg-[rgba(20,65,90,0.20)] hover:-translate-y-[1px] ${
                activeFilter === 'custom'
                  ? 'text-[#a7dcf6] border-[rgba(0,205,255,0.38)] bg-[linear-gradient(100deg,rgba(0,167,231,0.22),rgba(96,68,218,0.22))] shadow-[0_0_15px_rgba(0,190,255,0.10),inset_0_0_12px_rgba(0,190,255,0.035)]'
                  : 'text-[#7ea1c2] border-transparent bg-transparent'
              }`}
              onClick={() => setActiveFilter('custom')}
            >
              Custom Range
              <span className="text-[#6f9bb5] text-[11px]">▣</span>
            </button>
          </div>
          <div className="flex items-center gap-2 pr-[10px] max-sm:p-[0_4px_3px] text-[#98c5f0] text-[10px] whitespace-nowrap">
            <span className="w-[6px] h-[6px] shrink-0 rounded-full bg-[#2fe5a0] shadow-[0_0_9px_rgba(47,229,160,0.75)]"></span>
            {filterDescription}
          </div>
        </section>

        {/* CUSTOM DATE RANGE */}
        {activeFilter === 'custom' && (
          <section className="relative z-[20] min-h-[58px] flex max-sm:flex-col items-center max-sm:items-start gap-[12px] -mt-[2px] mb-[10px] p-[8px_13px] border border-[rgba(0,190,255,0.20)] rounded-[10px] bg-[linear-gradient(135deg,rgba(4,24,38,0.92),rgba(5,13,27,0.92))] shadow-[0_0_18px_rgba(0,160,220,0.035)]">
            <div className="relative z-[21] flex items-center gap-[9px] max-sm:w-full max-sm:justify-between">
              <label htmlFor="history-start-date" className="text-[#89b7e0] text-[10px] font-medium cursor-pointer">
                From
              </label>
              <input
                id="history-start-date"
                type="date"
                value={customStart}
                max={customEnd || undefined}
                onChange={event => setCustomStart(event.target.value)}
                className="h-[34px] min-w-[145px] max-sm:min-w-0 max-sm:flex-1 px-[10px] border border-[rgba(66,137,174,0.30)] rounded-[7px] outline-none bg-[rgba(3,14,25,0.90)] text-[#acd2f4] font-inherit text-[11px] [color-scheme:dark] cursor-pointer transition-all duration-180 ease-in-out hover:border-[rgba(0,198,255,0.50)] hover:bg-[rgba(5,22,37,0.95)] focus:border-[rgba(0,215,255,0.75)] focus:shadow-[0_0_0_2px_rgba(0,190,255,0.08),0_0_16px_rgba(0,190,255,0.10)] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-[0.85] [&::-webkit-calendar-picker-indicator]:[filter:drop-shadow(0_0_4px_rgba(0,200,255,0.35))]"
              />
            </div>
            <span className="max-sm:hidden text-[#22c9ff] text-[16px] [text-shadow:0_0_8px_rgba(0,200,255,0.45)]">
              →
            </span>
            <div className="relative z-[21] flex items-center gap-[9px] max-sm:w-full max-sm:justify-between">
              <label htmlFor="history-end-date" className="text-[#89b7e0] text-[10px] font-medium cursor-pointer">
                To
              </label>
              <input
                id="history-end-date"
                type="date"
                value={customEnd}
                min={customStart || undefined}
                onChange={event => setCustomEnd(event.target.value)}
                className="h-[34px] min-w-[145px] max-sm:min-w-0 max-sm:flex-1 px-[10px] border border-[rgba(66,137,174,0.30)] rounded-[7px] outline-none bg-[rgba(3,14,25,0.90)] text-[#acd2f4] font-inherit text-[11px] [color-scheme:dark] cursor-pointer transition-all duration-180 ease-in-out hover:border-[rgba(0,198,255,0.50)] hover:bg-[rgba(5,22,37,0.95)] focus:border-[rgba(0,215,255,0.75)] focus:shadow-[0_0_0_2px_rgba(0,190,255,0.08),0_0_16px_rgba(0,190,255,0.10)] [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-[0.85] [&::-webkit-calendar-picker-indicator]:[filter:drop-shadow(0_0_4px_rgba(0,200,255,0.35))]"
              />
            </div>
          </section>
        )}

        {/* HEART RATE */}
        <section className="grid grid-cols-[minmax(0,1fr)_230px] max-lg:grid-cols-[minmax(0,1fr)_210px] max-md:grid-cols-1 gap-[12px] mb-[11px]">
          <div className="relative border border-[rgba(56,117,158,0.27)] rounded-[14px] bg-[linear-gradient(145deg,rgba(6,24,38,0.96),rgba(3,12,23,0.98))] shadow-[0_10px_30px_rgba(0,0,0,0.27),0_0_28px_rgba(0,130,200,0.045),inset_0_0_28px_rgba(0,130,190,0.02)] overflow-hidden h-[222px] max-[850px]:min-[951px]:h-[200px] p-[15px_18px_10px] after:content-[''] after:absolute after:inset-0 after:pointer-events-none after:rounded-[inherit] after:bg-[linear-gradient(125deg,rgba(0,210,255,0.045),transparent_25%,transparent_70%,rgba(166,72,255,0.045))]">
            <div className="relative z-10 h-[42px] flex items-center justify-between">
              <div className="flex items-center gap-[11px]">
                <div className="w-[34px] h-[34px] flex items-center justify-center rounded-[9px] text-[30px] text-[#a22020] bg-[rgba(255,55,145,0.10)] shadow-[0_0_15px_rgba(255,55,145,0.10)]">
                  ♥
                </div>
                <div>
                  <h2 className="m-0 text-[#74b5f5] text-[18px] font-bold">Heart Rate</h2>
                  <span className="block mt-[3px] text-[#abd6ff] text-[10px]">
                    Beats per minute (BPM)
                  </span>
                </div>
              </div>
              <div className="flex items-baseline gap-[2px] pr-[4px]">
                <strong className="text-[25px] font-semibold leading-none text-[#c62727] [text-shadow:0_0_12px_rgba(255,65,145,0.22)]">
                  {heartRateStats.average}
                </strong>
                <span className="text-[14px] font-medium text-[#c62727] [text-shadow:0_0_12px_rgba(255,65,145,0.22)]">
                  {heartRateStats.average !== '--' ? 'BPM' : ''}
                </span>
                <small className="ml-[7px] text-[#7eb6ea] text-[9px]">Average</small>
              </div>
            </div>
            <div className="relative z-10 h-[139px] max-[850px]:min-[951px]:h-[122px] flex">
              <div className="w-[35px] h-[108px] max-[850px]:min-[951px]:h-[100px] flex flex-col justify-between pt-[7px] text-[#567fa4] text-[10px]">
                <span>120</span>
                <span>100</span>
                <span>80</span>
                <span>60</span>
                <span>40</span>
              </div>
              <div className="relative flex-1 min-w-0 h-[125px] max-[850px]:min-[951px]:h-[110px]">
                <div className="absolute top-[7px] left-0 right-0 h-[108px] max-[850px]:min-[951px]:h-[100px] flex flex-col justify-between">
                  <span className="w-full h-[1px] bg-[rgba(90,137,170,0.10)]"></span>
                  <span className="w-full h-[1px] bg-[rgba(90,137,170,0.10)]"></span>
                  <span className="w-full h-[1px] bg-[rgba(90,137,170,0.10)]"></span>
                  <span className="w-full h-[1px] bg-[rgba(90,137,170,0.10)]"></span>
                  <span className="w-full h-[1px] bg-[rgba(90,137,170,0.10)]"></span>
                </div>
                <svg
                  className="absolute top-[7px] left-0 w-full h-[108px] max-[850px]:min-[951px]:h-[100px] overflow-visible"
                  viewBox="0 0 900 230"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id="heartLineGradient"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop
                        offset="0%"
                        stopColor="#ff4c99"
                      />
                      <stop
                        offset="50%"
                        stopColor="#ff3c91"
                      />
                      <stop
                        offset="100%"
                        stopColor="#a84dff"
                      />
                    </linearGradient>
                    <linearGradient
                      id="heartAreaGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#ff3c91"
                        stopOpacity="0.25"
                      />
                      <stop
                        offset="100%"
                        stopColor="#ff3c91"
                        stopOpacity="0"
                      />
                    </linearGradient>
                    <filter
                      id="heartChartGlow"
                      x="-30%"
                      y="-30%"
                      width="160%"
                      height="160%"
                    >
                      <feGaussianBlur stdDeviation="5" />
                    </filter>
                  </defs>
                  {heartAreaPath && (
                    <path
                      className="stroke-none fill-[url(#heartAreaGradient)] opacity-[0.27]"
                      d={heartAreaPath}
                    />
                  )}
                  {heartPath && (
                    <>
                      <path
                        className="fill-none stroke-linecap-round stroke-linejoin-round stroke-[#ff3c91] stroke-[12px] opacity-[0.27] [filter:url(#heartChartGlow)]"
                        d={heartPath}
                      />
                      <path
                        className="fill-none stroke-linecap-round stroke-linejoin-round stroke-[url(#heartLineGradient)] stroke-[4px]"
                        d={heartPath}
                      />
                      {heartRateValues.filter(v => v !== null).length > 0 && (
                        <circle
                          className="stroke-[2] [filter:drop-shadow(0_0_7px_currentColor)] fill-[#ff4d98] stroke-[#ffc1dc] text-[#ff4d98]"
                          cx="900"
                          cy={
                            190 -
                            (((heartRateValues.filter(v => v !== null).slice(-1)[0] ?? 40) - 40) /
                              80) *
                              160
                          }
                          r="5"
                        />
                      )}
                    </>
                  )}
                </svg>
                <div className="absolute left-0 right-0 bottom-0 flex justify-between text-[#6290ba] text-[9px]">
                  <span>00:00</span>
                  <span>04:00</span>
                  <span>08:00</span>
                  <span>12:00</span>
                  <span>16:00</span>
                  <span>20:00</span>
                  <span>24:00</span>
                </div>
              </div>
            </div>
            <div className="relative z-10 h-[23px] flex items-center justify-between pl-[35px]">
              <div className="flex items-center gap-[7px] text-[#88b6e0] text-[9px]">
                <span className="w-[25px] h-[3px] rounded-[10px] bg-[linear-gradient(90deg,#ff4c99,#a84dff)] shadow-[0_0_8px_rgba(255,65,145,0.55)]"></span>
                Heart Rate
              </div>
              <div className="flex items-center gap-[6px] text-[#8ac0f6] text-[9px]">
                Normal range
                <strong className="text-[#8ac6fd] font-semibold">
                  60–100 BPM
                </strong>
              </div>
            </div>
          </div>
          
          {/* HEART SUMMARY */}
          <div className="relative border border-[rgba(56,117,158,0.27)] rounded-[14px] bg-[linear-gradient(145deg,rgba(6,24,38,0.96),rgba(3,12,23,0.98))] shadow-[0_10px_30px_rgba(0,0,0,0.27),0_0_28px_rgba(0,130,200,0.045),inset_0_0_28px_rgba(0,130,190,0.02)] overflow-hidden h-[222px] max-md:h-auto max-md:min-h-[200px] max-[850px]:min-[951px]:h-[200px] p-[16px] after:content-[''] after:absolute after:inset-0 after:pointer-events-none after:rounded-[inherit] after:bg-[linear-gradient(125deg,rgba(0,210,255,0.045),transparent_25%,transparent_70%,rgba(166,72,255,0.045))]">
            <div className="relative z-10 flex items-center gap-[10px] mb-[15px]">
              <div className="w-[34px] h-[34px] flex items-center justify-center rounded-[9px] text-[25px] text-[#aa1717] bg-[rgba(255,55,145,0.10)] shadow-[0_0_14px_rgba(255,55,145,0.09)]">
                ♥
              </div>
              <div>
                <h2 className="m-0 text-[#73b6f0] text-[14px] font-semibold">Heart Rate</h2>
                <span className="block mt-[3px] text-[#9fd0fb] text-[9px]">Daily summary</span>
              </div>
            </div>
            <div className="relative z-10">
              <div className="min-h-[41px] flex items-center justify-between border-b border-[rgba(95,135,165,0.10)]">
                <span className="text-[#73a5d3] text-[10px]">Average</span>
                <strong className="text-[#a4d4f9] text-[17px] font-semibold">
                  {heartRateStats.average}
                  <small className="ml-[4px] text-[#99cbfa] text-[9px] font-normal">
                    {heartRateStats.average !== '--' ? 'BPM' : ''}
                  </small>
                </strong>
              </div>
              <div className="min-h-[41px] flex items-center justify-between border-b border-[rgba(95,135,165,0.10)]">
                <span className="text-[#73a5d3] text-[10px]">Highest</span>
                <strong className="text-[#a4d4f9] text-[17px] font-semibold">
                  {heartRateStats.highest}
                  <small className="ml-[4px] text-[#99cbfa] text-[9px] font-normal">
                    {heartRateStats.highest !== '--' ? 'BPM' : ''}
                  </small>
                </strong>
              </div>
              <div className="min-h-[41px] flex items-center justify-between">
                <span className="text-[#73a5d3] text-[10px]">Lowest</span>
                <strong className="text-[#a4d4f9] text-[17px] font-semibold">
                  {heartRateStats.lowest}
                  <small className="ml-[4px] text-[#99cbfa] text-[9px] font-normal">
                    {heartRateStats.lowest !== '--' ? 'BPM' : ''}
                  </small>
                </strong>
              </div>
            </div>
            <div className="relative z-10 flex items-center gap-[9px] mt-[12px] p-[8px_9px] border border-[rgba(35,211,153,0.14)] rounded-[8px] bg-[rgba(25,160,120,0.055)]">
              <div className="w-[23px] h-[23px] flex items-center justify-center shrink-0 rounded-full text-[#38dca4] bg-[rgba(35,220,160,0.10)] text-[11px]">
                ↗
              </div>
              <div>
                <strong className="block text-[#65d9b0] text-[9px] font-semibold">
                  Stable trend
                </strong>
                <span className="block mt-[3px] text-[#6b8092] text-[8px] leading-[1.35]">
                  Average remains within your normal resting range.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SPO2 */}
        <section className="grid grid-cols-[minmax(0,1fr)_230px] max-lg:grid-cols-[minmax(0,1fr)_210px] max-md:grid-cols-1 gap-[12px] mb-[11px]">
          <div className="relative border border-[rgba(56,117,158,0.27)] rounded-[14px] bg-[linear-gradient(145deg,rgba(6,24,38,0.96),rgba(3,12,23,0.98))] shadow-[0_10px_30px_rgba(0,0,0,0.27),0_0_28px_rgba(0,130,200,0.045),inset_0_0_28px_rgba(0,130,190,0.02)] overflow-hidden h-[222px] max-[850px]:min-[951px]:h-[200px] p-[15px_18px_10px] after:content-[''] after:absolute after:inset-0 after:pointer-events-none after:rounded-[inherit] after:bg-[linear-gradient(125deg,rgba(0,210,255,0.045),transparent_25%,transparent_70%,rgba(166,72,255,0.045))]">
            <div className="relative z-10 h-[42px] flex items-center justify-between">
              <div className="flex items-center gap-[11px]">
                <div className="w-[34px] h-[34px] flex items-center justify-center rounded-[9px] text-[30px] text-[#1eb6e5] bg-[rgba(0,195,255,0.10)] shadow-[0_0_15px_rgba(0,195,255,0.10)]">
                  ◈
                </div>
                <div>
                  <h2 className="m-0 text-[#74b5f5] text-[18px] font-bold">
                    Blood Oxygen (SpO₂)
                  </h2>
                  <span className="block mt-[3px] text-[#abd6ff] text-[10px]">
                    Oxygen saturation percentage
                  </span>
                </div>
              </div>
              <div className="flex items-baseline gap-[2px] pr-[4px]">
                <strong className="text-[25px] font-semibold leading-none text-[#31caff] [text-shadow:0_0_12px_rgba(0,190,255,0.22)]">
                  {spo2Stats.average}
                </strong>
                <span className="text-[14px] font-medium text-[#31caff] [text-shadow:0_0_12px_rgba(0,190,255,0.22)]">
                  {spo2Stats.average !== '--' ? '%' : ''}
                </span>
                <small className="ml-[7px] text-[#7eb6ea] text-[9px]">Average</small>
              </div>
            </div>
            <div className="relative z-10 h-[139px] max-[850px]:min-[951px]:h-[122px] flex">
              <div className="w-[35px] h-[108px] max-[850px]:min-[951px]:h-[100px] flex flex-col justify-between pt-[7px] text-[#567fa4] text-[10px]">
                <span>100</span>
                <span>98</span>
                <span>96</span>
                <span>94</span>
                <span>92</span>
              </div>
              <div className="relative flex-1 min-w-0 h-[125px] max-[850px]:min-[951px]:h-[110px]">
                <div className="absolute top-[7px] left-0 right-0 h-[108px] max-[850px]:min-[951px]:h-[100px] flex flex-col justify-between">
                  <span className="w-full h-[1px] bg-[rgba(90,137,170,0.10)]"></span>
                  <span className="w-full h-[1px] bg-[rgba(90,137,170,0.10)]"></span>
                  <span className="w-full h-[1px] bg-[rgba(90,137,170,0.10)]"></span>
                  <span className="w-full h-[1px] bg-[rgba(90,137,170,0.10)]"></span>
                  <span className="w-full h-[1px] bg-[rgba(90,137,170,0.10)]"></span>
                </div>
                <svg
                  className="absolute top-[7px] left-0 w-full h-[108px] max-[850px]:min-[951px]:h-[100px] overflow-visible"
                  viewBox="0 0 900 230"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient
                      id="oxygenLineGradient"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop
                        offset="0%"
                        stopColor="#00bfff"
                      />
                      <stop
                        offset="50%"
                        stopColor="#16caff"
                      />
                      <stop
                        offset="100%"
                        stopColor="#477cff"
                      />
                    </linearGradient>
                    <linearGradient
                      id="oxygenAreaGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#00bfff"
                        stopOpacity="0.22"
                      />
                      <stop
                        offset="100%"
                        stopColor="#00bfff"
                        stopOpacity="0"
                      />
                    </linearGradient>
                    <filter
                      id="oxygenChartGlow"
                      x="-30%"
                      y="-30%"
                      width="160%"
                      height="160%"
                    >
                      <feGaussianBlur stdDeviation="5" />
                    </filter>
                  </defs>
                  {spo2AreaPath && (
                    <path
                      className="stroke-none fill-[url(#oxygenAreaGradient)] opacity-[0.22]"
                      d={spo2AreaPath}
                    />
                  )}
                  {spo2Path && (
                    <>
                      <path
                        className="fill-none stroke-linecap-round stroke-linejoin-round stroke-[#00baff] stroke-[12px] opacity-[0.25] [filter:url(#oxygenChartGlow)]"
                        d={spo2Path}
                      />
                      <path
                        className="fill-none stroke-linecap-round stroke-linejoin-round stroke-[url(#oxygenLineGradient)] stroke-[3px]"
                        d={spo2Path}
                      />
                      {spo2Values.filter(v => v !== null).length > 0 && (
                        <circle
                          className="stroke-[2] [filter:drop-shadow(0_0_7px_currentColor)] fill-[#16caff] stroke-[#a9efff] text-[#16caff]"
                          cx="900"
                          cy={
                            190 -
                            (((spo2Values.filter(v => v !== null).slice(-1)[0] ?? 90) - 90) /
                              10) *
                              160
                          }
                          r="5"
                        />
                      )}
                    </>
                  )}
                </svg>
                <div className="absolute left-0 right-0 bottom-0 flex justify-between text-[#6290ba] text-[9px]">
                  <span>00:00</span>
                  <span>04:00</span>
                  <span>08:00</span>
                  <span>12:00</span>
                  <span>16:00</span>
                  <span>20:00</span>
                  <span>24:00</span>
                </div>
              </div>
            </div>
            <div className="relative z-10 h-[23px] flex items-center justify-between pl-[35px]">
              <div className="flex items-center gap-[7px] text-[#88b6e0] text-[9px]">
                <span className="w-[25px] h-[3px] rounded-[10px] bg-[linear-gradient(90deg,#00bfff,#477cff)] shadow-[0_0_8px_rgba(0,190,255,0.55)]"></span>
                SpO₂
              </div>
              <div className="flex items-center gap-[6px] text-[#8ac0f6] text-[9px]">
                Excellent range
                <strong className="text-[#8ac6fd] font-semibold">
                  95–100%
                </strong>
              </div>
            </div>
          </div>
          
          {/* SPO2 SUMMARY */}
          <div className="relative border border-[rgba(56,117,158,0.27)] rounded-[14px] bg-[linear-gradient(145deg,rgba(6,24,38,0.96),rgba(3,12,23,0.98))] shadow-[0_10px_30px_rgba(0,0,0,0.27),0_0_28px_rgba(0,130,200,0.045),inset_0_0_28px_rgba(0,130,190,0.02)] overflow-hidden h-[222px] max-md:h-auto max-md:min-h-[200px] max-[850px]:min-[951px]:h-[200px] p-[16px] after:content-[''] after:absolute after:inset-0 after:pointer-events-none after:rounded-[inherit] after:bg-[linear-gradient(125deg,rgba(0,210,255,0.045),transparent_25%,transparent_70%,rgba(166,72,255,0.045))]">
            <div className="relative z-10 flex items-center gap-[10px] mb-[15px]">
              <div className="w-[34px] h-[34px] flex items-center justify-center rounded-[9px] text-[25px] text-[#16b5e5] bg-[rgba(0,190,255,0.10)] shadow-[0_0_14px_rgba(0,190,255,0.09)]">
                ◈
              </div>
              <div>
                <h2 className="m-0 text-[#73b6f0] text-[14px] font-semibold">SpO₂</h2>
                <span className="block mt-[3px] text-[#9fd0fb] text-[9px]">Daily summary</span>
              </div>
            </div>
            <div className="relative z-10">
              <div className="min-h-[41px] flex items-center justify-between border-b border-[rgba(95,135,165,0.10)]">
                <span className="text-[#73a5d3] text-[10px]">Average</span>
                <strong className="text-[#a4d4f9] text-[17px] font-semibold">
                  {spo2Stats.average}
                  <small className="ml-[4px] text-[#99cbfa] text-[9px] font-normal">
                    {spo2Stats.average !== '--' ? '%' : ''}
                  </small>
                </strong>
              </div>
              <div className="min-h-[41px] flex items-center justify-between border-b border-[rgba(95,135,165,0.10)]">
                <span className="text-[#73a5d3] text-[10px]">Highest</span>
                <strong className="text-[#a4d4f9] text-[17px] font-semibold">
                  {spo2Stats.highest}
                  <small className="ml-[4px] text-[#99cbfa] text-[9px] font-normal">
                    {spo2Stats.highest !== '--' ? '%' : ''}
                  </small>
                </strong>
              </div>
              <div className="min-h-[41px] flex items-center justify-between">
                <span className="text-[#73a5d3] text-[10px]">Lowest</span>
                <strong className="text-[#a4d4f9] text-[17px] font-semibold">
                  {spo2Stats.lowest}
                  <small className="ml-[4px] text-[#99cbfa] text-[9px] font-normal">
                    {spo2Stats.lowest !== '--' ? '%' : ''}
                  </small>
                </strong>
              </div>
            </div>
            <div className="relative z-10 flex items-center gap-[9px] mt-[12px] p-[8px_9px] border border-[rgba(0,190,255,0.14)] rounded-[8px] bg-[rgba(0,170,230,0.045)]">
              <div className="w-[23px] h-[23px] flex items-center justify-center shrink-0 rounded-full text-[#2ecbff] bg-[rgba(0,190,255,0.09)] text-[11px]">
                ✓
              </div>
              <div>
                <strong className="block text-[#53cfff] text-[9px] font-semibold">
                  Excellent oxygenation
                </strong>
                <span className="block mt-[3px] text-[#6b8092] text-[8px] leading-[1.35]">
                  Most readings remained within the healthy range.
                </span>
              </div>
            </div>
          </div>
        </section>

        // RECENT MEASUREMENTS 
        <section className="relative border border-[rgba(56,117,158,0.27)] rounded-[14px] bg-[linear-gradient(145deg,rgba(6,24,38,0.96),rgba(3,12,23,0.98))] shadow-[0_10px_30px_rgba(0,0,0,0.27),0_0_28px_rgba(0,130,200,0.045),inset_0_0_28px_rgba(0,130,190,0.02)] overflow-hidden min-h-[170px] max-[850px]:min-[951px]:min-h-[155px] p-[14px_18px_10px] after:content-[''] after:absolute after:inset-0 after:pointer-events-none after:rounded-[inherit] after:bg-[linear-gradient(125deg,rgba(0,210,255,0.045),transparent_25%,transparent_70%,rgba(166,72,255,0.045))]">
          <div className="relative z-10 min-h-[38px] flex items-start justify-between">
            <div>
              <h2 className="m-0 text-[#65b4f9] text-[18px] font-semibold">
                Recent Measurements
              </h2>
              <span className="block mt-[3px] text-[#9acbfa] text-[10px]">
                Your latest recorded readings
              </span>
            </div>
            <button
              type="button"
              className="min-w-[70px] h-[31px] px-[12px] border border-[rgba(0,186,255,0.40)] rounded-[7px] bg-[rgba(0,150,255,0.055)] text-[#38c9ff] font-inherit text-[10px] font-medium cursor-pointer transition-all duration-180 ease-in-out hover:bg-[rgba(0,170,255,0.22)] hover:border-[rgba(40,183,245,0.475)] hover:shadow-[0_0_12px_rgba(0,180,255,0.10)] hover:-translate-y-[1px]"
              onClick={() => setShowAll(previous => !previous)}
            >
              {showAll ? 'Show Less' : 'View All'}
            </button>
          </div>
          <div className="relative z-10 w-full">
            <div className="min-h-[22px] grid grid-cols-[1.1fr_1fr_1fr_1.2fr_1fr] max-sm:grid-cols-5 max-sm:text-[8px] items-center text-[#cbecfa] text-[12px]">
              <span className="whitespace-nowrap">Time</span>
              <span className="whitespace-nowrap">Heart Rate</span>
              <span className="whitespace-nowrap">SpO₂</span>
              <span className="whitespace-nowrap">Signal Quality</span>
              <span className="whitespace-nowrap">Stability</span>
            </div>
            {visibleMeasurements.length > 0 ? (
              visibleMeasurements.map(item => (
                <div
                  className="min-h-[25px] max-[850px]:min-[951px]:min-h-[22px] grid grid-cols-[1.1fr_1fr_1fr_1.2fr_1fr] max-sm:grid-cols-5 max-sm:text-[8px] items-center border-t border-[rgba(90,132,164,0.075)] text-[#acd7fe] text-[10px]"
                  key={item.id}
                >
                  <span className="whitespace-nowrap">
                    {item.time}
                  </span>
                  <span className="whitespace-nowrap text-[#fc508f] font-medium">
                    {item.heartRate !== null
                      ? `${item.heartRate} BPM`
                      : '--'}
                  </span>
                  <span className="whitespace-nowrap">
                    {item.spo2 !== null
                      ? `${item.spo2}%`
                      : '--'}
                  </span>
                  <span className="whitespace-nowrap text-[#36d9a0] font-medium">
                    {item.signalQuality}
                  </span>
                  <span className="whitespace-nowrap text-[#31c8ff] font-medium">
                    {item.stability}
                  </span>
                </div>
              ))
            ) : (
              <div className="min-h-[60px] flex items-center justify-center text-[#6fabe3] text-[10px]">
                No measurements found for this date range.
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default History