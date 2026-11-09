import { useEffect, useMemo, useState } from 'react'
import Sidebar from '../../components/Sidebar'
import { db, auth } from '../../firebase/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

function average(values) {
  if (!values.length) return 0
  return Math.round(
    values.reduce((total, value) => total + value, 0) /
      values.length
  )
}

function getMin(values) {
  return values.length ? Math.min(...values) : 0
}

function getMax(values) {
  return values.length ? Math.max(...values) : 0
}

function createChartPath(
  points,
  width = 360,
  height = 100,
  padding = 8
) {
  if (!points.length) return ''
  const min = Math.min(...points)
  const max = Math.max(...points)
  const range = max - min || 1
  return points
    .map((point, index) => {
      const x =
        padding +
        (index / Math.max(points.length - 1, 1)) *
          (width - padding * 2)
      const y =
        height -
        padding -
        ((point - min) / range) *
          (height - padding * 2)
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(
        2
      )} ${y.toFixed(2)}`
    })
    .join(' ')
}

function ReportChart({ title, unit, points, type }) {
  const path = createChartPath(points)
  const isHeart = type === 'heart'

  if (!points.length) {
    return (
      <div
        className={`box-border flex h-[175px] min-h-[175px] flex-col overflow-hidden rounded-[10px] border bg-[#030c18]/76 p-[11px_11px_8px] ${
          isHeart ? 'border-[#eb3682]/26' : 'border-[#00b2ff]/26'
        }`}
      >
        <div className="flex h-[21px] items-center justify-between">
          <div>
            <span className="text-[13px] font-semibold text-[#b3d0ff]">
              {title}
            </span>
            <span className="ml-[5px] text-[10px] text-[#acccff]">
              {unit}
            </span>
          </div>
        </div>
        <div className="grid h-[115px] place-items-center text-center text-[11px] text-[#a1c4fb]">
          No measurements in this date range.
        </div>
      </div>
    )
  }

  const min = Math.min(...points)
  const max = Math.max(...points)

  return (
    <div
      className={`box-border flex h-[175px] min-h-[175px] flex-col overflow-hidden rounded-[10px] border bg-[#030c18]/76 p-[11px_11px_8px] ${
        isHeart ? 'border-[#eb3682]/26' : 'border-[#00b2ff]/26'
      }`}
    >
      <div className="flex h-[21px] items-center justify-between">
        <div>
          <span className="text-[13px] font-semibold text-[#b3d0ff]">
            {title}
          </span>
          <span className="ml-[5px] text-[10px] text-[#acccff]">
            {unit}
          </span>
        </div>
        <span className="text-[9px] text-[#a2c7ff]">
          Selected Range
        </span>
      </div>

      <div className="mt-[6px] flex h-[105px]">
        <div className="flex w-[25px] flex-col justify-between py-[2px] pr-[4px] pl-0 text-right text-[9px] text-[#abcaff]">
          <span>{max}</span>
          <span>{Math.round((max + min) / 2)}</span>
          <span>{min}</span>
        </div>
        <svg
          className="block h-[100px] w-full flex-1 overflow-visible"
          viewBox="0 0 360 100"
          preserveAspectRatio="none"
          aria-label={`${title} trend`}
        >
          <line x1="8" y1="8" x2="352" y2="8" className="stroke-[#546e91]/16 [stroke-dasharray:3_4] [stroke-width:1]" />
          <line x1="8" y1="50" x2="352" y2="50" className="stroke-[#546e91]/16 [stroke-dasharray:3_4] [stroke-width:1]" />
          <line x1="8" y1="92" x2="352" y2="92" className="stroke-[#546e91]/16 [stroke-dasharray:3_4] [stroke-width:1]" />
          
          <path
            className={`opacity-[0.08] ${isHeart ? 'fill-[#f03d91]' : 'fill-[#00bfff]'}`}
            d={`${path} L 352 92 L 8 92 Z`}
          />
          <path
            className={`fill-none [stroke-linecap:round] [stroke-linejoin:round] [stroke-width:2.4] ${
              isHeart
                ? 'stroke-[#f03d91] [filter:drop-shadow(0_0_5px_rgba(240,61,145,0.65))]'
                : 'stroke-[#00bfff] [filter:drop-shadow(0_0_5px_rgba(0,191,255,0.65))]'
            }`}
            d={path}
          />
          {points.map((point, index) => {
            const range = max - min || 1
            const x =
              8 +
              (index / Math.max(points.length - 1, 1)) *
                344
            const y =
              92 -
              ((point - min) / range) * 84
            return (
              <circle
                key={`${type}-${index}`}
                className={`fill-[#071321] [stroke-width:1.5] ${
                  isHeart ? 'stroke-[#f03d91]' : 'stroke-[#00bfff]'
                }`}
                cx={x}
                cy={y}
                r="3"
              />
            )
          })}
        </svg>
      </div>

      <div className="flex justify-between pl-[29px] text-[9px] text-[#9fc4ff]">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>24:00</span>
      </div>
    </div>
  )
}

export default function Reports() {
  const [measurements, setMeasurements] = useState([])

  // Fetch Firestore Data
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setMeasurements([])
        return
      }

      const q = query(
        collection(db, 'measurements'),
        where('userId', '==', currentUser.uid)
      )

      const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        const fetched = snapshot.docs.map((doc) => {
          const data = doc.data()
          let dateStr
          let timeStr

          if (data.timestamp?.toDate) {
            const dateObj = data.timestamp.toDate()
            dateStr = dateObj.toISOString().split('T')[0]
            timeStr = dateObj.toTimeString().split(' ')[0].substring(0, 5)
          } else {
            dateStr = data.date || new Date().toISOString().split('T')[0]
            timeStr = data.time || '00:00'
          }

          return {
            id: doc.id,
            date: dateStr,
            time: timeStr,
            heartRate: Number(data.bpm || data.heartRate || 0),
            spo2: Number(data.spo2 || 0),
            activity: Number(data.activity || 15),
            quality: data.quality || 'Good',
          }
        })

        fetched.sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`))
        setMeasurements(fetched)
      })

      return () => unsubscribeSnapshot()
    })

    return () => unsubscribeAuth()
  }, [])

  const latestMeasurementDate = useMemo(() => {
    if (!measurements.length) return new Date().toISOString().split('T')[0]
    return measurements.reduce((latest, item) => {
      return item.date > latest ? item.date : latest
    }, measurements[0]?.date || new Date().toISOString().split('T')[0])
  }, [measurements])

  const [dateFromInput, setDateFromInput] = useState(null)
  const [dateToInput, setDateToInput] = useState(null)

  const dateFrom = dateFromInput ?? '2025-05-01'
  const dateTo = dateToInput ?? latestMeasurementDate

  const [includeHeartRate, setIncludeHeartRate] = useState(true)
  const [includeSpo2, setIncludeSpo2] = useState(true)
  const [includeActivity, setIncludeActivity] = useState(true)
  const [includeHealthScore, setIncludeHealthScore] = useState(true)
  const [includeCharts, setIncludeCharts] = useState(true)
  const [includeStatistics, setIncludeStatistics] = useState(true)

  const filteredMeasurements = useMemo(() => {
    return measurements.filter((measurement) => {
      return (
        measurement.date >= dateFrom &&
        measurement.date <= dateTo
      )
    })
  }, [measurements, dateFrom, dateTo])

  const statistics = useMemo(() => {
    const heartRates = filteredMeasurements.map(
      (item) => item.heartRate
    )
    const oxygenLevels = filteredMeasurements.map(
      (item) => item.spo2
    )
    const activityLevels = filteredMeasurements.map(
      (item) => item.activity
    )
    const heartRateAverage = average(heartRates)
    const spo2Average = average(oxygenLevels)
    const activityAverage = average(activityLevels)

    let consistency = 0
    if (heartRates.length >= 2) {
      const variation =
        ((getMax(heartRates) - getMin(heartRates)) /
          Math.max(heartRateAverage, 1)) *
        100
      consistency = Math.max(
        0,
        Math.min(100, Math.round(100 - variation))
      )
    }

    let healthScore = 0
    if (filteredMeasurements.length > 0) {
      const heartRateScore =
        heartRateAverage >= 60 &&
        heartRateAverage <= 100
          ? 35
          : 24
      const oxygenScore = Math.min(
        30,
        Math.round((spo2Average / 100) * 30)
      )
      const activityScore = Math.min(
        20,
        activityAverage
      )
      const consistencyScore = Math.round(
        (consistency / 100) * 15
      )
      healthScore = Math.min(
        100,
        heartRateScore +
          oxygenScore +
          activityScore +
          consistencyScore
      )
    }

    return {
      heartRateAverage,
      heartRateMin: getMin(heartRates),
      heartRateMax: getMax(heartRates),
      spo2Average,
      spo2Min: getMin(oxygenLevels),
      spo2Max: getMax(oxygenLevels),
      activityAverage,
      consistency,
      healthScore,
      measurementCount: filteredMeasurements.length,
    }
  }, [filteredMeasurements])

  const heartRatePoints = useMemo(() => {
    return filteredMeasurements.map(
      (item) => item.heartRate
    )
  }, [filteredMeasurements])

  const spo2Points = useMemo(() => {
    return filteredMeasurements.map(
      (item) => item.spo2
    )
  }, [filteredMeasurements])

  const selectedCount = [
    includeHeartRate,
    includeSpo2,
    includeActivity,
    includeHealthScore,
    includeCharts,
    includeStatistics,
  ].filter(Boolean).length

  const handleToday = () => {
    setDateFromInput(latestMeasurementDate)
    setDateToInput(latestMeasurementDate)
  }

  const handleThisWeek = () => {
    const latest = new Date(`${latestMeasurementDate}T00:00:00`)
    const start = new Date(latest)
    start.setDate(latest.getDate() - 6)
    const formattedStart = start.toISOString().split('T')[0]
    setDateFromInput(formattedStart)
    setDateToInput(latestMeasurementDate)
  }

  const handleThisMonth = () => {
    const latest = new Date(`${latestMeasurementDate}T00:00:00`)
    const firstDay = new Date(
      latest.getFullYear(),
      latest.getMonth(),
      1
    )
    const formattedStart = firstDay.toISOString().split('T')[0]
    setDateFromInput(formattedStart)
    setDateToInput(latestMeasurementDate)
  }

  const handleExport = (type) => {
    if (!filteredMeasurements.length) {
      alert('No data available to export for the selected range.')
      return
    }

    if (type === 'CSV') {
      const headers = ['Date', 'Time', 'Heart Rate (BPM)', 'SpO2 (%)', 'Activity', 'Quality']
      const csvRows = [headers.join(',')]

      filteredMeasurements.forEach((item) => {
        csvRows.push([
          item.date,
          item.time,
          includeHeartRate ? item.heartRate : '',
          includeSpo2 ? item.spo2 : '',
          includeActivity ? item.activity : '',
          item.quality,
        ].join(','))
      })

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `PulseGrid_Report_${dateFrom}_to_${dateTo}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } else if (type === 'PDF') {
      const printWindow = window.open('', '_blank')
      if (!printWindow) return

      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>PulseGrid Health Report</title>
            <style>
              body { font-family: sans-serif; padding: 20px; color: #333; }
              h1 { color: #0070f3; margin-bottom: 5px; }
              .period { font-size: 14px; color: #666; margin-bottom: 20px; }
              .summary-box { display: flex; gap: 20px; margin-bottom: 20px; }
              .card { border: 1px solid #ccc; padding: 10px; border-radius: 6px; flex: 1; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
            </style>
          </head>
          <body>
            <h1>PulseGrid Health Report</h1>
            <div class="period">Range: ${dateFrom} to ${dateTo}</div>
            
            ${includeStatistics ? `
              <div class="summary-box">
                ${includeHeartRate ? `<div class="card"><strong>Avg Heart Rate:</strong> ${statistics.heartRateAverage} BPM</div>` : ''}
                ${includeSpo2 ? `<div class="card"><strong>Avg SpO2:</strong> ${statistics.spo2Average}%</div>` : ''}
                ${includeHealthScore ? `<div class="card"><strong>Health Score:</strong> ${statistics.healthScore}/100</div>` : ''}
              </div>
            ` : ''}

            <h3>Measurement Records</h3>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  ${includeHeartRate ? '<th>Heart Rate (BPM)</th>' : ''}
                  ${includeSpo2 ? '<th>SpO2 (%)</th>' : ''}
                  ${includeActivity ? '<th>Activity</th>' : ''}
                  <th>Quality</th>
                </tr>
              </thead>
              <tbody>
                ${filteredMeasurements.map(m => `
                  <tr>
                    <td>${m.date}</td>
                    <td>${m.time}</td>
                    ${includeHeartRate ? `<td>${m.heartRate}</td>` : ''}
                    ${includeSpo2 ? `<td>${m.spo2}</td>` : ''}
                    ${includeActivity ? `<td>${m.activity}</td>` : ''}
                    <td>${m.quality}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <script>
              window.onload = function() {
                window.print();
                window.close();
              };
            </script>
          </body>
        </html>
      `

      printWindow.document.write(htmlContent)
      printWindow.document.close()
    }
  }

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden max-950px:overflow-y-auto bg-[#020711] text-[#b1d6ff] bg-[radial-gradient(circle_at_72%_10%,rgba(70,90,255,0.19),transparent_28%),radial-gradient(circle_at_92%_70%,rgba(180,45,255,0.19),transparent_27%)] before:pointer-events-none before:fixed before:inset-0 before:z-0 before:bg-[linear-gradient(rgba(70,102,160,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(70,102,160,0.025)_1px,transparent_1px)] before:bg-[size:42px_42px]">
      <Sidebar activePage="reports" />

      <main className="relative z-10 h-screen min-w-0 flex-1 overflow-hidden p-[22px_28px_18px] max-1200px:p-[18px] max-950px:h-auto max-950px:min-h-screen max-950px:overflow-visible">
        
        {/* HEADER */}
        <header className="mb-[14px] flex h-[82px] items-center justify-between gap-6 max-650px:h-auto max-650px:items-start">
          <div>
            <p className="m-0 mb-[5px] text-[11px] font-bold tracking-[2.5px] text-[#00d9ff]">
              HEALTH ANALYTICS
            </p>
            <h1 className="m-0 text-[30px] font-bold leading-[1.05] tracking-[-0.7px] text-[#b1d6ff] max-1200px:text-[27px]">
              Health Reports
            </h1>
            <p className="mt-[7px] mb-0 text-[14px] text-[#a9c6fb]">
              Generate a detailed report of your heart-health measurements and trends.
            </p>
          </div>
          <div className="flex min-w-[178px] items-center gap-[15px] rounded-[11px] border border-[#36598b]/50 bg-[#060e1c]/76 p-[12px_15px] shadow-[inset_0_0_20px_rgba(28,82,150,0.05),0_0_18px_rgba(0,153,255,0.04)] max-650px:hidden">
            <span className="h-[8px] w-[8px] shrink-0 rounded-full bg-[#25e68b] shadow-[0_0_8px_rgba(37,230,139,0.85),0_0_15px_rgba(37,230,139,0.25)]" />
            <div>
              <span className="mb-0 block text-[10px] text-[#a3c1fa]">Report Data</span>
              <strong className="block text-[12px] text-[#afc9f9]">
                {statistics.measurementCount} Measurements
              </strong>
            </div>
          </div>
        </header>

        {/* MAIN WORKSPACE */}
        <section className="grid h-[calc(100vh-190px)] min-h-[520px] grid-cols-[minmax(330px,0.75fr)_minmax(560px,1.25fr)] gap-[16px] max-1200px:grid-cols-[320px_minmax(0,1fr)] max-950px:h-auto max-950px:min-h-0 max-950px:grid-cols-1">
          
          {/* CONFIGURATION */}
          <div className="flex min-h-0 flex-col gap-[12px] rounded-[14px] border border-[#2e4d7c]/58 bg-[linear-gradient(145deg,rgba(10,20,38,0.94),rgba(3,10,21,0.95))] p-[16px] shadow-[inset_0_1px_0_rgba(255,255,255,0.025),0_0_32px_rgba(0,97,190,0.035)]">
            <div className="flex min-h-[34px] items-center justify-between gap-3">
              <div className="flex items-center gap-[9px]">
                <span className="text-[11px] font-bold tracking-[1px] text-[#5f759c]">01</span>
                <h2 className="m-0 text-[17px] font-semibold text-[#accbfe]">Report Configuration</h2>
              </div>
              <span className="text-[10px] text-[#7596ce]">{selectedCount} sections selected</span>
            </div>

            {/* DATE RANGE */}
            <div className="rounded-[11px] border border-[#2d4973]/52 bg-[#030b17]/73 p-[14px]">
              <div className="mb-[12px] flex items-center gap-[10px]">
                <span className="grid h-[30px] w-[30px] place-items-center rounded-[8px] border border-[#00b9ff]/20 bg-[#00b9ff]/8 text-[16px] text-[#00d9ff]">
                  ◷
                </span>
                <div>
                  <strong className="block text-[15px] font-semibold text-[#a4c4ff]">Select Date Range</strong>
                  <small className="mt-[3px] block text-[11px] text-[#92b5fb]">Choose the period for your report</small>
                </div>
              </div>

              <div className="flex items-end gap-[8px]">
                <label className="flex-1 min-w-0">
                  <span className="mb-[4px] block text-[10px] text-[#a6c4f9]">From</span>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(event) => {
                      const value = event.target.value
                      setDateFromInput(value)
                      if (value > dateTo) {
                        setDateToInput(value)
                      }
                    }}
                    className="box-border h-[28px] w-full cursor-pointer rounded-[6px] border border-[#375682]/60 bg-[#071222] px-[4px] text-[9px] text-[#bad6ff] outline-none focus:border-[#00caff]/72 focus:shadow-[0_0_12px_rgba(0,202,255,0.1)]"
                  />
                </label>
                <span className="pb-[4px] text-[11px] text-[#a9caff]">→</span>
                <label className="flex-1 min-w-0">
                  <span className="mb-[4px] block text-[10px] text-[#a6c4f9]">To</span>
                  <input
                    type="date"
                    value={dateTo}
                    min={dateFrom}
                    onChange={(event) => setDateToInput(event.target.value)}
                    className="box-border h-[28px] w-full cursor-pointer rounded-[6px] border border-[#375682]/60 bg-[#071222] px-[4px] text-[9px] text-[#bad6ff] outline-none focus:border-[#00caff]/72 focus:shadow-[0_0_12px_rgba(0,202,255,0.1)]"
                  />
                </label>
              </div>

              <div className="mt-[12px] grid grid-cols-2 gap-[8px]">
                <button
                  type="button"
                  onClick={handleToday}
                  className={`h-[34px] w-full cursor-pointer rounded-[7px] border border-[#304c76]/54 px-[8px] text-[10px] font-medium transition-all duration-200 hover:border-[#00c5ff]/58 hover:bg-[#00b0ff]/9 hover:text-[#b8d2fe] hover:shadow-[0_0_13px_rgba(0,188,255,0.08)] ${
                    dateFrom === latestMeasurementDate && dateTo === latestMeasurementDate
                      ? 'border-[#00c5ff]/58 bg-[#00b0ff]/9 text-[#b8d2fe] shadow-[0_0_13px_rgba(0,188,255,0.08)]'
                      : 'bg-[#0a1527]/70 text-[#accbff]'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={handleThisWeek}
                  className="h-[34px] w-full cursor-pointer rounded-[7px] border border-[#304c76]/54 bg-[#0a1527]/70 px-[8px] text-[10px] font-medium text-[#accbff] transition-all duration-200 hover:border-[#00c5ff]/58 hover:bg-[#00b0ff]/9 hover:text-[#b8d2fe] hover:shadow-[0_0_13px_rgba(0,188,255,0.08)]"
                >
                  This Week
                </button>
                <button
                  type="button"
                  onClick={handleThisMonth}
                  className="h-[34px] w-full cursor-pointer rounded-[7px] border border-[#304c76]/54 bg-[#0a1527]/70 px-[8px] text-[10px] font-medium text-[#accbff] transition-all duration-200 hover:border-[#00c5ff]/58 hover:bg-[#00b0ff]/9 hover:text-[#b8d2fe] hover:shadow-[0_0_13px_rgba(0,188,255,0.08)]"
                >
                  This Month
                </button>
                <button
                  type="button"
                  className="h-[34px] w-full cursor-pointer rounded-[7px] border border-[#00c5ff]/58 bg-[#00b0ff]/9 px-[8px] text-[10px] font-medium text-[#b8d2fe] shadow-[0_0_13px_rgba(0,188,255,0.08)] transition-all duration-200"
                >
                  Custom Range
                </button>
              </div>
            </div>

            {/* INCLUDE IN REPORT */}
            <div className="min-h-0 flex-1 rounded-[11px] border border-[#2d4973]/52 bg-[#030b17]/73 p-[14px]">
              <div className="mb-[12px] flex items-center gap-[10px]">
                <span className="grid h-[30px] w-[30px] place-items-center rounded-[8px] border border-[#00b9ff]/20 bg-[#00b9ff]/8 text-[16px] text-[#00d9ff]">
                  ▣
                </span>
                <div>
                  <strong className="block text-[14px] font-semibold text-[#a4c4ff]">Include in Report</strong>
                  <small className="mt-[3px] block text-[10px] text-[#92b5fb]">Select the information to include</small>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-[8px] max-650px:grid-cols-1">
                {[
                  { label: 'Heart Rate', sub: 'Average & trends', state: includeHeartRate, setState: setIncludeHeartRate },
                  { label: 'Blood Oxygen', sub: 'SpO₂ readings', state: includeSpo2, setState: setIncludeSpo2 },
                  { label: 'Activity Trend', sub: 'Activity overview', state: includeActivity, setState: setIncludeActivity },
                  { label: 'Health Score', sub: 'Overall score', state: includeHealthScore, setState: setIncludeHealthScore },
                  { label: 'Charts & Graphs', sub: 'Visual trends', state: includeCharts, setState: setIncludeCharts },
                  { label: 'Summary Statistics', sub: 'Key measurements', state: includeStatistics, setState: setIncludeStatistics },
                ].map((item, idx) => (
                  <label
                    key={idx}
                    className="relative flex min-h-[54px] cursor-pointer items-center gap-[9px] rounded-[8px] border border-[#27436a]/42 bg-[#07101e]/55 p-[8px_9px] transition-all duration-200 hover:border-[#00beff]/42 hover:bg-[#009a00]/5"
                  >
                    <input
                      type="checkbox"
                      checked={item.state}
                      onChange={(event) => item.setState(event.target.checked)}
                      className="peer absolute pointer-events-none opacity-0"
                    />
                    <span className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[4px] border border-[#3b526f] text-transparent text-[12px] transition-all duration-200 peer-checked:border-[#00d8ff] peer-checked:bg-[#00d8ff] peer-checked:text-[#00131c] peer-checked:shadow-[0_0_9px_rgba(0,216,255,0.4),0_0_16px_rgba(0,216,255,0.1)]">
                      ✓
                    </span>
                    <span className="min-w-0">
                      <strong className="block text-[12px] font-semibold text-[#c5dcff]">{item.label}</strong>
                      <small className="mt-0 block text-[10px] text-[#bcd6ff]">{item.sub}</small>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* REPORT PREVIEW */}
          <div className="flex min-h-0 flex-col overflow-hidden rounded-[14px] border border-[#2e4d7c]/58 bg-[linear-gradient(145deg,rgba(10,20,38,0.94),rgba(3,10,21,0.95))] p-[16px] shadow-[inset_0_1px_0_rgba(255,255,255,0.025),0_0_32px_rgba(0,97,190,0.035)] max-950px:min-h-[550px]">
            <div className="flex min-h-[34px] items-center justify-between gap-3 border-b border-[#2a456c]/68 pb-[10px]">
              <div className="flex items-center gap-[9px]">
                <span className="text-[11px] font-bold tracking-[1px] text-[#5f759c]">02</span>
                <h2 className="m-0 text-[17px] font-semibold text-[#accbfe]">Report Preview</h2>
              </div>
              <span className="text-[10px] text-[#7596ce]">
                {dateFrom} — {dateTo}
              </span>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-[10px] pt-[10px]">
              {/* TOP ANALYTICS */}
              <div className="grid grid-cols-3 gap-[8px] max-650px:grid-cols-1">
                {includeHeartRate && (
                  <div className="relative min-h-[78px] overflow-hidden rounded-[10px] border border-[#ec3981]/42 bg-[#050f1d]/76 p-[11px_12px] after:absolute after:-right-[55px] after:-bottom-[65px] after:h-[105px] after:w-[105px] after:rounded-full after:bg-[#ff267f] after:opacity-17 after:blur-[15px]">
                    <span className="text-[13px] font-semibold text-[#a5c5fc]">Heart Rate</span>
                    <strong className="mt-[5px] block text-[25px] font-semibold leading-none text-[#abceff]">
                      {statistics.heartRateAverage}
                      <small className="ml-[4px] text-[13px] font-semibold text-[#abceff]">BPM</small>
                    </strong>
                    <div className="mt-[7px] text-[10px] text-[#8db6f9]">
                      {statistics.heartRateMin} — {statistics.heartRateMax} BPM
                    </div>
                  </div>
                )}
                {includeSpo2 && (
                  <div className="relative min-h-[78px] overflow-hidden rounded-[10px] border border-[#0095ff]/42 bg-[#050f1d]/76 p-[11px_12px] after:absolute after:-right-[55px] after:-bottom-[65px] after:h-[105px] after:w-[105px] after:rounded-full after:bg-[#00cfff] after:opacity-17 after:blur-[15px]">
                    <span className="text-[13px] font-semibold text-[#a5c5fc]">Blood Oxygen</span>
                    <strong className="mt-[5px] block text-[25px] font-semibold leading-none text-[#abceff]">
                      {statistics.spo2Average}
                      <small className="ml-[4px] text-[13px] font-semibold text-[#abceff]">%</small>
                    </strong>
                    <div className="mt-[7px] text-[10px] text-[#8db6f9]">
                      {statistics.spo2Min} — {statistics.spo2Max}%
                    </div>
                  </div>
                )}
                {includeHealthScore && (
                  <div className="relative min-h-[78px] overflow-hidden rounded-[10px] border border-[#8c52ff]/42 bg-[#050f1d]/76 p-[11px_12px] after:absolute after:-right-[55px] after:-bottom-[65px] after:h-[105px] after:w-[105px] after:rounded-full after:bg-[#9d55ff] after:opacity-17 after:blur-[15px]">
                    <span className="text-[13px] font-semibold text-[#a5c5fc]">Health Score</span>
                    <strong className="mt-[5px] block text-[25px] font-semibold leading-none text-[#abceff]">
                      {statistics.healthScore}
                      <small className="ml-[4px] text-[13px] font-semibold text-[#abceff]">/100</small>
                    </strong>
                    <div className="mt-[7px] text-[10px] text-[#8db6f9]">
                      {statistics.healthScore >= 85
                        ? 'Excellent'
                        : statistics.healthScore >= 70
                        ? 'Good'
                        : 'Needs Attention'}
                    </div>
                  </div>
                )}
              </div>

              {/* CHARTS */}
              {includeCharts && (
                <div className="grid min-h-0 flex-1 grid-cols-2 gap-[8px] max-650px:grid-cols-1">
                  {includeHeartRate && (
                    <ReportChart title="Heart Rate" unit="BPM" points={heartRatePoints} type="heart" />
                  )}
                  {includeSpo2 && (
                    <ReportChart title="Blood Oxygen" unit="SpO₂" points={spo2Points} type="oxygen" />
                  )}
                </div>
              )}

              {/* SUMMARY */}
              {includeStatistics && (
                <div className="rounded-[10px] border border-[#2f4c78]/53 bg-[#040d19]/76 p-[10px_12px]">
                  <div className="mb-[9px] flex items-center justify-between">
                    <span className="text-[14px] font-semibold text-[#adceff]">Summary Statistics</span>
                    <small className="text-[9px] text-[#afceff]">
                      Based on {statistics.measurementCount} measurements
                    </small>
                  </div>
                  <div className="grid grid-cols-4 gap-[8px] max-650px:grid-cols-1">
                    <div className="border-r border-[#30486b]/34 pr-[8px] max-650px:border-r-0 max-650px:pr-0">
                      <span className="block text-[11px] font-semibold text-[#9dbff7]">Avg. Heart Rate</span>
                      <strong className="mt-[2px] block text-[17px] font-semibold text-[#aecefe]">
                        {statistics.heartRateAverage}
                        <small className="text-[10px] text-[#bad4ff]"> BPM</small>
                      </strong>
                    </div>
                    <div className="border-r border-[#30486b]/34 pr-[8px] max-650px:border-r-0 max-650px:pr-0">
                      <span className="block text-[11px] font-semibold text-[#9dbff7]">Avg. SpO₂</span>
                      <strong className="mt-[2px] block text-[17px] font-semibold text-[#aecefe]">
                        {statistics.spo2Average}
                        <small className="text-[10px] text-[#bad4ff]">%</small>
                      </strong>
                    </div>
                    <div className="border-r border-[#30486b]/34 pr-[8px] max-650px:border-r-0 max-650px:pr-0">
                      <span className="block text-[11px] font-semibold text-[#9dbff7]">Consistency</span>
                      <strong className="mt-[2px] block text-[17px] font-semibold text-[#aecefe]">
                        {statistics.consistency}
                        <small className="text-[10px] text-[#bad4ff]">%</small>
                      </strong>
                    </div>
                    <div>
                      <span className="block text-[11px] font-semibold text-[#9dbff7]">Activity</span>
                      <strong className="mt-[2px] block text-[17px] font-semibold text-[#aecefe]">
                        {statistics.activityAverage}
                        <small className="text-[10px] text-[#bad4ff]">/ 20</small>
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* EXPORT FOOTER */}
        <section className="mt-[10px] flex h-[66px] box-border items-center justify-between gap-[15px] rounded-[11px] border border-[#2e4d7c]/52 bg-[#060f1d]/84 p-[10px_12px] shadow-[0_0_25px_rgba(0,95,190,0.03)] max-950px:h-auto max-950px:min-h-[66px] max-650px:flex-col max-650px:items-stretch">
          <div className="flex min-w-0 items-center gap-[10px] max-650px:w-full">
            <span className="grid h-[28px] w-[28px] shrink-0 place-items-center rounded-full border border-[#27e38b]/50 bg-[#27e38b]/17 text-[15px] text-[#27e38b] shadow-[0_0_13px_rgba(39,227,139,0.09)]">
              ✓
            </span>
            <div>
              <strong className="mb-[2px] block text-[13px] text-[#b9d9ff]">Report ready</strong>
              <span className="block text-[10px] text-[#b3d0fd]">
                Your selected measurements and analytics will be included in the exported report.
              </span>
            </div>
          </div>
          <div className="flex gap-[8px] max-650px:w-full">
            <button
              type="button"
              onClick={() => handleExport('PDF')}
              className="h-[36px] cursor-pointer rounded-[7px] border border-[#f4407e]/92 bg-[#e72d6c]/28 px-[15px] text-[9px] font-semibold text-[#ffbdd5] transition-all duration-200 hover:-translate-y-[1px] hover:border-[#f4407e] hover:shadow-[0_0_16px_rgba(244,64,126,0.23)] max-650px:flex-1"
            >
              <span className="mr-[6px]">▣</span>
              Export as PDF
            </button>
            <button
              type="button"
              onClick={() => handleExport('CSV')}
              className="h-[36px] cursor-pointer rounded-[7px] border border-[#27da7e]/92 bg-[#27da7e]/27 px-[15px] text-[9px] font-semibold text-[#b5f5d2] transition-all duration-200 hover:-translate-y-[1px] hover:border-[#27da7e]/92 hover:shadow-[0_0_16px_rgba(39,218,126,0.21)] max-650px:flex-1"
            >
              <span className="mr-[6px]">▤</span>
              Export as CSV
            </button>
          </div>
        </section>

      </main>
    </div>
  )
}