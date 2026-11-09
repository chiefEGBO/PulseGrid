import ecgGraph from '../../assets/measurement/ecg-graph.png'
import spo2Graph from '../../assets/measurement/spo2-graph.png'

export default function LiveMeasurement({
  heartRate,
  spo2,
  measurementTime,
  onNewMeasurement,
}) {
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds
    ).padStart(2, '0')}`
  }

  const displaySpO2 =
    typeof spo2 === 'number' && Number.isFinite(spo2)
      ? spo2.toFixed(1)
      : '--'

  return (
    <section className="flex flex-col h-[calc(100vh-143px)] max-md:h-[calc(100vh-118px)] max-sm:h-[calc(100vh-103px)] pt-[17px] min-h-0">
      <div className="flex justify-between items-center h-[38px] max-md:h-[29px] mb-[10px] max-md:mb-[6px]">
        <div className="flex items-baseline gap-[9px]">
          <span className="text-[#8fd6fa] text-[15px] font-bold tracking-[1.2px]">
            LIVE BIOMETRIC STREAM
          </span>
          <strong className="text-[#9adaf6] text-[15px] font-bold">
            MAX30102 SENSOR DATA
          </strong>
        </div>
        <button
          className="flex items-center justify-center gap-[9px] h-[36px] px-[17px] border border-[rgba(22,217,255,0.28)] hover:border-[rgba(22,217,255,0.5)] rounded-[8px] bg-[linear-gradient(135deg,rgba(11,94,119,0.5),rgba(39,54,115,0.45))] text-[#bde4ee] hover:text-[#d8f5fb] text-[15px] font-bold cursor-pointer transition-colors"
          onClick={onNewMeasurement}
        >
          <span className="text-[#16d9ff] text-[17px]">+</span>
          New Measurement
        </button>
      </div>

      <div className="grid grid-cols-2 gap-[18px] min-h-0 flex-1">
        <div className="min-w-0 min-h-0 flex flex-col p-[20px_22px] max-md:p-4 border border-[rgba(54,157,196,0.17)] rounded-[17px] bg-[linear-gradient(145deg,rgba(7,21,31,0.96),rgba(3,11,18,0.97))]">
          <div className="flex items-center gap-[2px]">
            <div className="flex items-center justify-center w-[45px] h-[45px] rounded-[2px] text-[50px] text-[#dc1644] bg-[rgba(255,68,115,0.09)]">
              ♥
            </div>
            <div className="flex flex-col">
              <span className="text-[#33dafb] text-[24px] font-bold">
                Heart Rate
              </span>
              <small className="text-[#93c8e4] text-[15px]">
                Cardiac activity
              </small>
            </div>
          </div>
          <div className="flex items-baseline gap-[5px] mt-[5px]">
            <strong className="text-[#b8e9fc] text-[53px] max-md:text-[45px] max-sm:text-[39px] leading-[0.95] tracking-[-2px] font-bold">
              {heartRate}
            </strong>
            <span className="text-[#a9dcf7] text-[25px] font-bold">
              BPM
            </span>
          </div>
          <div className="flex items-center gap-[6px] mt-[5px] text-[#24e6a0] text-[12px] font-bold">
            <span className="w-[6px] h-[6px] rounded-full bg-[#24e6a0]"></span>
            Normal
          </div>
          <div className="relative flex-1 min-h-[130px] mt-[13px] overflow-hidden border border-[rgba(42,117,148,0.17)] rounded-[11px] bg-[#020a11]">
            <div className="absolute top-[9px] left-[11px] z-10 text-[#97d5f5] text-[10px] font-bold tracking-[0.5px]">
              ECG / LIVE
            </div>
            <img
              src={ecgGraph}
              alt="Live ECG graph"
              className="w-full h-full block object-cover"
            />
          </div>
        </div>

        <div className="min-w-0 min-h-0 flex flex-col p-[20px_22px] max-md:p-4 border border-[rgba(54,157,196,0.17)] rounded-[17px] bg-[linear-gradient(145deg,rgba(7,21,31,0.96),rgba(3,11,18,0.97))]">
          <div className="flex items-center gap-[2px]">
            <div className="flex items-center justify-center w-[45px] h-[45px] rounded-[2px] text-[50px] text-[#16d9ff] bg-[rgba(0,198,255,0.08)]">
              ◇
            </div>
            <div className="flex flex-col">
              <span className="text-[#33dafb] text-[24px] font-bold">
                Blood Oxygen
              </span>
              <small className="text-[#93c8e4] text-[15px]">
                Oxygen saturation
              </small>
            </div>
          </div>
          <div className="flex items-baseline gap-[5px] mt-[5px]">
            <strong className="text-[#b8e9fc] text-[53px] max-md:text-[45px] max-sm:text-[39px] leading-[0.95] tracking-[-2px] font-bold">
              {displaySpO2}
            </strong>
            <span className="text-[#a9dcf7] text-[25px] font-bold">
              %
            </span>
          </div>
          <div className="flex items-center gap-[6px] mt-[5px] text-[#24e6a0] text-[12px] font-bold">
            <span className="w-[6px] h-[6px] rounded-full bg-[#24e6a0]"></span>
            Excellent
          </div>
          <div className="relative flex-1 min-h-[130px] mt-[13px] overflow-hidden border border-[rgba(42,117,148,0.17)] rounded-[11px] bg-[#020a11]">
            <div className="absolute top-[9px] left-[11px] z-10 text-[#97d5f5] text-[10px] font-bold tracking-[0.5px]">
              SpO₂ / LIVE
            </div>
            <img
              src={spo2Graph}
              alt="Live blood oxygen graph"
              className="w-full h-full block object-cover"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-[14px] max-md:gap-[10px] h-[126px] max-md:h-[105px] max-sm:h-[92px] mt-[5px]">
        <div className="min-w-0 p-[15px_17px] border border-[rgba(53,148,187,0.15)] rounded-[13px] bg-[linear-gradient(145deg,rgba(7,20,30,0.94),rgba(4,12,19,0.96))]">
          <div className="flex items-center gap-[9px] text-[#a2dbf7] text-[13px]">
            <span className="flex items-center justify-center w-[27px] h-[27px] rounded-[7px] text-[#16d9ff] bg-[rgba(0,194,240,0.08)]">
              ≋
            </span>
            <span>Signal Quality</span>
          </div>
          <strong className="block mt-[9px] text-[#24e6a0] text-[18px] font-bold">
            Excellent
          </strong>
          <div className="flex gap-[5px] mt-[9px]">
            <span className="w-[25px] h-[4px] rounded-[5px] bg-[#16d9ff] shadow-[0_0_8px_rgba(22,217,255,0.2)]" />
            <span className="w-[25px] h-[4px] rounded-[5px] bg-[#16d9ff] shadow-[0_0_8px_rgba(22,217,255,0.2)]" />
            <span className="w-[25px] h-[4px] rounded-[5px] bg-[#16d9ff] shadow-[0_0_8px_rgba(22,217,255,0.2)]" />
            <span className="w-[25px] h-[4px] rounded-[5px] bg-[#16d9ff] shadow-[0_0_8px_rgba(22,217,255,0.2)]" />
            <span className="w-[25px] h-[4px] rounded-[5px] bg-[#16d9ff] shadow-[0_0_8px_rgba(22,217,255,0.2)]" />
          </div>
          <small className="block mt-[8px] text-[#98d6fa] text-[12px]">
            Clear sensor signal
          </small>
        </div>

        <div className="min-w-0 p-[15px_17px] border border-[rgba(53,148,187,0.15)] rounded-[13px] bg-[linear-gradient(145deg,rgba(7,20,30,0.94),rgba(4,12,19,0.96))]">
          <div className="flex items-center gap-[9px] text-[#a2dbf7] text-[13px]">
            <span className="flex items-center justify-center w-[27px] h-[27px] rounded-[7px] text-[#16d9ff] bg-[rgba(0,194,240,0.08)]">
              ≋
            </span>
            <span>Reading Stability</span>
          </div>
          <strong className="block mt-[9px] text-[#24e6a0] text-[18px] font-bold">
            Stable
          </strong>
          <div className="flex gap-[5px] mt-[9px]">
            <span className="w-[25px] h-[4px] rounded-[5px] bg-[#16d9ff] shadow-[0_0_8px_rgba(22,217,255,0.2)]" />
            <span className="w-[25px] h-[4px] rounded-[5px] bg-[#16d9ff] shadow-[0_0_8px_rgba(22,217,255,0.2)]" />
            <span className="w-[25px] h-[4px] rounded-[5px] bg-[#16d9ff] shadow-[0_0_8px_rgba(22,217,255,0.2)]" />
            <span className="w-[25px] h-[4px] rounded-[5px] bg-[#16d9ff] shadow-[0_0_8px_rgba(22,217,255,0.2)]" />
            <span className="w-[25px] h-[4px] rounded-[5px] bg-[#16d9ff] shadow-[0_0_8px_rgba(22,217,255,0.2)]" />
          </div>
          <small className="block mt-[8px] text-[#98d6fa] text-[12px]">
            Consistent reading
          </small>
        </div>

        <div className="min-w-0 p-[15px_17px] border border-[rgba(53,148,187,0.15)] rounded-[13px] bg-[linear-gradient(145deg,rgba(7,20,30,0.94),rgba(4,12,19,0.96))]">
          <div className="flex items-center gap-[9px] text-[#a2dbf7] text-[13px]">
            <span className="flex items-center justify-center w-[27px] h-[27px] rounded-[7px] text-[#16d9ff] bg-[rgba(0,194,240,0.08)]">
              ◷
            </span>
            <span>Measurement Time</span>
          </div>
          <strong className="block mt-[9px] text-[#beedff] text-[18px] font-bold">
            {formatTime(measurementTime)}
          </strong>
          <small className="block mt-[8px] text-[#98d6fa] text-[12px]">
            Session duration
          </small>
        </div>

        <div className="min-w-0 p-[15px_17px] border border-[rgba(53,148,187,0.15)] rounded-[13px] bg-[linear-gradient(145deg,rgba(7,20,30,0.94),rgba(4,12,19,0.96))]">
          <div className="flex items-center gap-[9px] text-[#a2dbf7] text-[13px]">
            <span className="flex items-center justify-center w-[27px] h-[27px] rounded-[7px] text-[#16d9ff] bg-[rgba(0,194,240,0.08)]">
              ◉
            </span>
            <span>Device Status</span>
          </div>
          <strong className="block mt-[9px] text-[#24e6a0] text-[18px] font-bold">
            Online
          </strong>
          <small className="block mt-[8px] text-[#98d6fa] text-[12px]">
            ESP32 / Wi-Fi connected
          </small>
        </div>
      </div>

      <div className="flex items-center justify-between h-[58px] max-md:h-[48px] max-sm:h-[42px] mt-[30px] px-[15px] pl-[19px] border border-[rgba(44,161,200,0.15)] rounded-[12px] bg-[linear-gradient(90deg,rgba(5,22,31,0.94),rgba(5,15,23,0.95))]">
        <div className="flex items-center gap-[9px]">
          <span className="w-[7px] h-[7px] rounded-full bg-[#24e6a0] shadow-[0_0_10px_rgba(36,230,160,0.75)]"></span>
          <strong className="text-[#24e6a0] text-[11px] font-bold">
            Recording
          </strong>
          <small className="text-[#57717f] text-[10px]">
            Sensor data is being captured
          </small>
        </div>
      </div>
    </section>
  )
}