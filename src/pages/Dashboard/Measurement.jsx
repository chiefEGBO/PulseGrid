import { useEffect, useRef, useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import fingerprintAsset from '../../assets/measurement/fingerprint.png'
import Stabilizing from './Stabilizing'
import LiveMeasurement from './LiveMeasurement'
import Sidebar from '../../components/Sidebar'
import { auth, db } from '../../firebase/firebase'

const ESP32_URL = import.meta.env.VITE_ESP32_URL

export default function Measurement() {
  const [measurementState, setMeasurementState] = useState('waiting')
  const [signalProgress, setSignalProgress] = useState(0)
  const [heartRate, setHeartRate] = useState(0)
  const [spo2, setSpo2] = useState(0)
  const [measurementTime, setMeasurementTime] = useState(0)
  const [currentUser, setCurrentUser] = useState(null)

  const measurementStateRef = useRef('waiting')
  const heartRateRef = useRef(0)
  const spo2Ref = useRef(0)
  const measurementTimeRef = useRef(0)
  const currentUserRef = useRef(null)

  const measurementSavedRef = useRef(false)
  const measurementSavingRef = useRef(false)
  const completedMeasurementRef = useRef(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      currentUserRef.current = user
      setCurrentUser(user)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!ESP32_URL) {
      return
    }

    let active = true

    const saveMeasurement = async (measurement) => {
      if (
        !measurement ||
        measurementSavedRef.current ||
        measurementSavingRef.current ||
        !currentUserRef.current
      ) {
        return
      }

      if (
        Number(measurement.heartRate) <= 0 ||
        Number(measurement.spo2) <= 0
      ) {
        return
      }

      measurementSavingRef.current = true

      try {
        await addDoc(
          collection(db, 'measurements'),
          {
            userId: currentUserRef.current.uid,
            heartRate: Number(measurement.heartRate),
            spo2: Number(measurement.spo2),
            signalQuality: 'Excellent',
            stability: 'Stable',
            measurementTime: Number(measurement.measurementTime),
            timestamp: serverTimestamp(),
            createdAt: serverTimestamp(),
            device: 'ESP32',
            sensor: 'MAX30102',
          }
        )

        measurementSavedRef.current = true
      } catch (error) {
        console.error(
          'Unable to save measurement:',
          error
        )
      } finally {
        measurementSavingRef.current = false
      }
    }

    const pollMeasurement = async () => {
      try {
        const response = await fetch(`${ESP32_URL}/measurement`, {
          cache: 'no-store',
        })

        if (!response.ok) {
          throw new Error('Unable to read ESP32')
        }

        const data = await response.json()

        if (!active) {
          return
        }

        const fingerDetected = Boolean(data.fingerDetected)
        const currentState = measurementStateRef.current

        if (currentState === 'waiting') {
          if (!fingerDetected) {
            return
          }

          measurementSavedRef.current = false
          measurementSavingRef.current = false
          completedMeasurementRef.current = null

          measurementStateRef.current = 'stabilizing'
          setMeasurementState('stabilizing')

          const progress = Number(
            data.stabilizationProgress || 0
          )

          const elapsed = Math.floor(
            Number(data.elapsed || 0) / 1000
          )

          setSignalProgress(progress)
          setMeasurementTime(elapsed)

          return
        }

        if (currentState === 'stabilizing') {
          const progress = Math.min(
            100,
            Number(data.stabilizationProgress || 0)
          )

          const elapsed = Math.floor(
            Number(data.elapsed || 0) / 1000
          )

          setSignalProgress(progress)
          setMeasurementTime(elapsed)

          const measurementReady =
            data.measurementReady &&
            data.bpmReady &&
            data.spo2Ready

          if (!measurementReady) {
            return
          }

          const finalHeartRate = Number(
            data.averageBpm || data.bpm || 0
          )

          const finalSpO2 = Number(
            data.averageSpo2 || data.spo2 || 0
          )

          if (
            finalHeartRate <= 0 ||
            finalSpO2 <= 0
          ) {
            return
          }

          heartRateRef.current = finalHeartRate
          spo2Ref.current = finalSpO2
          measurementTimeRef.current = elapsed

          setHeartRate(finalHeartRate)
          setSpo2(finalSpO2)
          setMeasurementTime(elapsed)
          setSignalProgress(100)

          completedMeasurementRef.current = {
            heartRate: finalHeartRate,
            spo2: finalSpO2,
            measurementTime: elapsed,
          }

          measurementStateRef.current = 'live'
          setMeasurementState('live')

          await saveMeasurement(
            completedMeasurementRef.current
          )

          return
        }

        if (currentState === 'live') {
          if (
            completedMeasurementRef.current &&
            !measurementSavedRef.current
          ) {
            await saveMeasurement(
              completedMeasurementRef.current
            )
          }

          return
        }
      } catch {
        return
      }
    }

    pollMeasurement()

    const interval = setInterval(
      pollMeasurement,
      500
    )

    return () => {
      active = false
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (
      currentUser &&
      completedMeasurementRef.current &&
      !measurementSavedRef.current
    ) {
      const saveCompletedMeasurement = async () => {
        if (measurementSavingRef.current) {
          return
        }

        measurementSavingRef.current = true

        try {
          await addDoc(
            collection(db, 'measurements'),
            {
              userId: currentUser.uid,
              heartRate: Number(
                completedMeasurementRef.current.heartRate
              ),
              spo2: Number(
                completedMeasurementRef.current.spo2
              ),
              signalQuality: 'Excellent',
              stability: 'Stable',
              measurementTime: Number(
                completedMeasurementRef.current.measurementTime
              ),
              timestamp: serverTimestamp(),
              createdAt: serverTimestamp(),
              device: 'ESP32',
              sensor: 'MAX30102',
            }
          )

          measurementSavedRef.current = true
        } catch (error) {
          console.error(
            'Unable to save measurement:',
            error
          )
        } finally {
          measurementSavingRef.current = false
        }
      }

      saveCompletedMeasurement()
    }
  }, [currentUser])

  const resetMeasurement = () => {
    measurementSavedRef.current = false
    measurementSavingRef.current = false
    completedMeasurementRef.current = null

    heartRateRef.current = 0
    spo2Ref.current = 0
    measurementTimeRef.current = 0

    measurementStateRef.current = 'waiting'

    setSignalProgress(0)
    setMeasurementTime(0)
    setHeartRate(0)
    setSpo2(0)
    setMeasurementState('waiting')
  }

  return (
    <div className="relative w-full h-screen min-h-[680px] overflow-hidden bg-[#02070d] bg-[radial-gradient(circle_at_75%_15%,rgba(16,116,190,0.13),transparent_32%),radial-gradient(circle_at_75%_85%,rgba(105,38,190,0.10),transparent_30%)] text-[#cce2ec] font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[700px] h-[700px] rounded-full filter blur-[120px] opacity-[0.65] -top-[300px] right-[80px] bg-[rgba(0,170,255,0.20)]"></div>
        <div className="absolute w-[700px] h-[700px] rounded-full filter blur-[120px] opacity-[0.65] left-[60px] -bottom-[350px] bg-[rgba(135,55,255,0.25)]"></div>
        <div
          className="absolute inset-0 opacity-[0.16] bg-[linear-gradient(rgba(32,173,219,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(32,173,219,0.12)_1px,transparent_1px)] bg-[size:42px_42px]"
          style={{
            maskImage:
              'linear-gradient(to bottom, black, transparent 90%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, black, transparent 90%)',
          }}
        ></div>
        <div className="absolute inset-0 opacity-[0.14] bg-[linear-gradient(135deg,transparent_0_52%,rgba(0,213,255,0.22)_52.1%,transparent_52.3%),linear-gradient(35deg,transparent_0_72%,rgba(136,74,255,0.18)_72.1%,transparent_72.3%)]"></div>
      </div>

      <div className="relative z-10 flex w-full h-screen">
        <div className="flex w-full h-screen min-w-0">
          <div className="flex-none w-[248px] max-lg:w-[220px] max-md:w-[190px]">
            <Sidebar activePage="dashboard" />
          </div>

          <main className="relative z-10 flex-1 min-w-0 h-screen px-8 max-lg:px-6 max-md:px-4 pt-6 max-md:pt-4 max-sm:pt-3 pb-[22px] max-md:pb-3.5 max-sm:pb-2.5 overflow-hidden">
            <header className="flex items-start justify-between h-[118px] max-md:h-[100px] max-sm:h-[88px] pb-[19px] border-b border-[rgba(65,153,188,0.13)]">
              <div className="min-w-0">
                <span className="block mb-[7px] text-[#4b91ad] text-[12px] font-bold tracking-[1.6px]">
                  PULSEGRID / BIOMETRIC MONITOR
                </span>

                <h1 className="m-0 text-[#acd0fc] text-[33px] max-sm:text-[25px] leading-tight font-bold tracking-[-0.8px]">
                  {measurementState === 'waiting' &&
                    'Heart Rate Measurement'}
                  {measurementState === 'stabilizing' &&
                    'Signal Stabilization'}
                  {measurementState === 'live' &&
                    'Live Measurement'}
                </h1>

                <p className="mt-2 text-[#98d6f8] text-[15px] max-sm:text-[12px]">
                  {measurementState === 'waiting' &&
                    'Place your finger on the MAX30102 sensor to begin'}
                  {measurementState === 'stabilizing' &&
                    'PulseGrid is establishing a stable sensor signal'}
                  {measurementState === 'live' &&
                    'Real-time biometric readings'}
                </p>
              </div>

              <div className="flex items-center gap-[9px] min-w-[150px] h-[42px] px-3.5 border border-[rgba(54,159,200,0.18)] rounded-[11px] bg-[rgba(7,22,32,0.72)] text-[#9ad7f6] text-[12px]">
                <span className="w-[7px] h-[7px] rounded-full bg-[#24e6a0] shadow-[0_0_9px_rgba(36,230,160,0.75)]"></span>
                <span>ESP32</span>
                <strong className="ml-[3px] text-[#24e6a0] text-[11px] tracking-[0.7px]">
                  ONLINE
                </strong>
              </div>
            </header>

            {measurementState === 'waiting' && (
              <section className="w-full grid grid-cols-[minmax(0,1fr)_305px] max-lg:grid-cols-[minmax(0,1fr)_260px] max-md:grid-cols-[minmax(0,1fr)_225px] gap-[24px] max-md:gap-[14px] h-[calc(100vh-143px)] max-md:h-[calc(100vh-118px)] max-sm:h-[calc(100vh-103px)] pt-[22px] max-md:pt-[15px]">
                <div className="relative min-w-0 h-full flex flex-col border border-[rgba(56,171,211,0.18)] rounded-[19px] bg-[radial-gradient(circle_at_50%_44%,rgba(9,94,126,0.11),transparent_30%),linear-gradient(145deg,rgba(8,25,36,0.94),rgba(4,13,21,0.96))] overflow-hidden">
                  <div className="flex items-center gap-[10px] p-[28px_30px] max-md:p-[19px_25px] text-[#16d9ff] text-[15px] font-bold tracking-[1px]">
                    <span className="w-[8px] h-[8px] flex-none rounded-full bg-[#16d9ff] shadow-[0_0_10px_rgba(22,217,255,0.7)]"></span>
                    <span>SENSOR READY</span>
                    <strong className="text-[#24e6a0] text-[15px]">
                      MAX30102
                    </strong>
                  </div>

                  <div className="flex-1 flex items-center justify-center min-h-0">
                    <img
                      src={fingerprintAsset}
                      alt="Fingerprint sensor"
                      className="w-[min(92%,560px)] h-[min(90%,500px)] object-contain filter drop-shadow-[0_0_0px_rgba(20,210,255,0.38)] drop-shadow-[0_0_0px_rgba(100,55,255,0.22)]"
                    />
                  </div>

                  <div className="px-[30px] pb-[30px] max-md:pb-[20px] text-center">
                    <h2 className="m-0 text-[#7ab6ff] text-[24px] max-md:text-[21px] leading-tight font-bold">
                      PLACE YOUR FINGER ON THE SENSOR
                    </h2>

                    <div className="flex items-center justify-center gap-[5px] mt-[10px]">
                      <span className="w-[10px] h-[10px] rounded-full bg-[#16d9ff]"></span>
                      <span className="w-[10px] h-[10px] rounded-full bg-[#16d9ff]"></span>
                      <span className="w-[10px] h-[10px] rounded-full bg-[#16d9ff]"></span>
                      <strong className="ml-[7px] text-[#73b2fe] text-[12px] font-semibold">
                        Waiting for finger
                      </strong>
                    </div>
                  </div>
                </div>

                <aside className="grid grid-rows-4 gap-[14px] min-h-0">
                  <div className="flex flex-col justify-center min-h-0 px-[20px] py-[19px] border border-[rgba(55,155,193,0.15)] rounded-[14px] bg-[linear-gradient(145deg,rgba(7,20,30,0.94),rgba(4,12,19,0.96))]">
                    <div className="flex items-center gap-[10px] text-[#8299a6] text-[13px]">
                      <span className="flex items-center justify-center w-[30px] h-[30px] rounded-[8px] text-[#16d9ff] bg-[rgba(0,190,240,0.09)]">
                        ≋
                      </span>
                      <span>Signal Quality</span>
                    </div>
                    <strong className="mt-[14px] text-[#24e6a0] text-[21px]">
                      Good
                    </strong>
                    <div className="flex gap-[5px] mt-[11px]">
                      <span className="w-[30px] h-[5px] rounded-[5px] bg-[#16d9ff] shadow-[0_0_8px_rgba(22,217,255,0.2)]"></span>
                      <span className="w-[30px] h-[5px] rounded-[5px] bg-[#16d9ff] shadow-[0_0_8px_rgba(22,217,255,0.2)]"></span>
                      <span className="w-[30px] h-[5px] rounded-[5px] bg-[#16d9ff] shadow-[0_0_8px_rgba(22,217,255,0.2)]"></span>
                      <span className="w-[30px] h-[5px] rounded-[5px] bg-[#16d9ff] shadow-[0_0_8px_rgba(22,217,255,0.2)]"></span>
                      <span className="w-[30px] h-[5px] rounded-[5px] bg-[#172833]"></span>
                    </div>
                    <small className="mt-[8px] text-[#5e7886] text-[11px]">
                      Sensor ready
                    </small>
                  </div>

                  <div className="flex flex-col justify-center min-h-0 px-[20px] py-[19px] border border-[rgba(55,155,193,0.15)] rounded-[14px] bg-[linear-gradient(145deg,rgba(7,20,30,0.94),rgba(4,12,19,0.96))]">
                    <div className="flex items-center gap-[10px] text-[#8299a6] text-[13px]">
                      <span className="flex items-center justify-center w-[30px] h-[30px] rounded-[8px] text-[#16d9ff] bg-[rgba(0,190,240,0.09)]">
                        ≋
                      </span>
                      <span>Reading Stability</span>
                    </div>
                    <strong className="mt-[14px] text-[#b8ced8] text-[21px]">
                      Waiting
                    </strong>
                    <div className="flex gap-[5px] mt-[11px]">
                      <span className="w-[30px] h-[5px] rounded-[5px] bg-[#16d9ff]"></span>
                      <span className="w-[30px] h-[5px] rounded-[5px] bg-[#16d9ff]"></span>
                      <span className="w-[30px] h-[5px] rounded-[5px] bg-[#172833]"></span>
                      <span className="w-[30px] h-[5px] rounded-[5px] bg-[#172833]"></span>
                      <span className="w-[30px] h-[5px] rounded-[5px] bg-[#172833]"></span>
                    </div>
                    <small className="mt-[8px] text-[#5e7886] text-[11px]">
                      Awaiting contact
                    </small>
                  </div>

                  <div className="flex flex-col justify-center min-h-0 px-[20px] py-[19px] border border-[rgba(55,155,193,0.15)] rounded-[14px] bg-[linear-gradient(145deg,rgba(7,20,30,0.94),rgba(4,12,19,0.96))]">
                    <div className="flex items-center gap-[10px] text-[#8299a6] text-[13px]">
                      <span className="flex items-center justify-center w-[30px] h-[30px] rounded-[8px] text-[#16d9ff] bg-[rgba(0,190,240,0.09)]">
                        ◉
                      </span>
                      <span>Device Status</span>
                    </div>
                    <strong className="mt-[14px] text-[#24e6a0] text-[21px]">
                      Online
                    </strong>
                    <small className="mt-[8px] text-[#5e7886] text-[11px]">
                      ESP32 connected
                    </small>
                  </div>

                  <div className="flex flex-col justify-center min-h-0 px-[20px] py-[19px] border border-[rgba(55,155,193,0.15)] rounded-[14px] bg-[linear-gradient(145deg,rgba(7,20,30,0.94),rgba(4,12,19,0.96))]">
                    <div className="flex items-center gap-[10px] text-[#8299a6] text-[13px]">
                      <span className="flex items-center justify-center w-[30px] h-[30px] rounded-[8px] text-[#16d9ff] bg-[rgba(0,190,240,0.09)]">
                        ◷
                      </span>
                      <span>Last Measurement</span>
                    </div>
                    <strong className="mt-[14px] text-[#b8ced8] text-[21px]">
                      --
                    </strong>
                    <small className="mt-[8px] text-[#5e7886] text-[11px]">
                      No previous reading
                    </small>
                  </div>
                </aside>
              </section>
            )}

            {measurementState === 'stabilizing' && (
              <Stabilizing signalProgress={signalProgress} />
            )}

            {measurementState === 'live' && (
              <LiveMeasurement
                heartRate={heartRate}
                spo2={spo2}
                measurementTime={measurementTime}
                onNewMeasurement={resetMeasurement}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  )
}