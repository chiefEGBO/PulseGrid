import signalWaveform from '../../assets/measurement/signal-waveform.png'

export default function Stabilizing({ signalProgress }) {
  return (
    <section className="w-full grid grid-cols-[minmax(0,1fr)_305px] max-lg:grid-cols-[minmax(0,1fr)_260px] max-md:grid-cols-[minmax(0,1fr)_225px] gap-[24px] max-md:gap-[14px] h-[calc(100vh-143px)] max-md:h-[calc(100vh-118px)] max-sm:h-[calc(100vh-103px)] pt-[22px] max-md:pt-[15px]">
      <div className="min-w-0 h-full flex flex-col p-[28px_34px_22px] max-md:pt-[21px] border border-[rgba(58,166,205,0.18)] rounded-[19px] bg-[radial-gradient(circle_at_48%_46%,rgba(10,111,151,0.10),transparent_32%),linear-gradient(145deg,rgba(7,23,34,0.96),rgba(3,12,20,0.97))] overflow-hidden">
        <div className="flex justify-between gap-[20px]">
          <div>
            <span className="block mb-[9px] text-[#16d9ff] text-[11px] font-extrabold tracking-[1.6px]">
              SENSOR ANALYSIS
            </span>
            <h2 className="m-0 text-[#a0d4f4] text-[25px] font-bold">
              Stabilizing Signal
            </h2>
            <p className="max-w-[620px] mt-[7px] m-0 text-[#7fcff8] text-[13px]">
              Keep your finger still while the sensor establishes a reliable reading.
            </p>
          </div>
          <div className="flex items-center self-start gap-[8px] px-3.5 py-[10px] border border-[rgba(20,213,255,0.22)] rounded-[9px] text-[#16d9ff] text-[10px] font-extrabold tracking-[1px]">
            <span className="w-[6px] h-[6px] rounded-full bg-[#16d9ff]"></span>
            ANALYZING
          </div>
        </div>

        <div className="relative flex-1 flex items-center justify-center min-h-0">
          <img
            src={signalWaveform}
            alt="Sensor signal waveform"
            className="w-[min(88%,760px)] h-[92%] object-contain opacity-100 filter drop-shadow-[0_0_0px_rgba(16,190,255,0.42)] drop-shadow-[0_0_0px_rgba(124,60,255,0.30)]"
          />
          <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-[#63818f] text-[10px] tracking-[2px]">SIGNAL</span>
            <strong className="mt-[2px] text-[#cfeaf3] text-[46px] leading-none font-bold">
              {signalProgress}%
            </strong>
            <small className="mt-[7px] text-[#16d9ff] text-[9px] tracking-[1.8px]">
              CALIBRATING
            </small>
          </div>
        </div>

        <div className="flex items-center min-h-[66px] px-[18px] py-[12px] border border-[rgba(40,158,197,0.17)] rounded-[11px] bg-[rgba(5,19,28,0.75)]">
          <div className="w-[8px] h-[8px] flex-none rounded-full bg-[#16d9ff] shadow-[0_0_10px_rgba(22,217,255,0.7)]"></div>
          <div className="flex flex-col gap-[4px] ml-[11px]">
            <strong className="text-[#b8d0db] text-[13px] font-bold">
              Establishing stable signal
            </strong>
            <span className="text-[#607c8b] text-[11px]">
              Analyzing pulse waveform and sensor contact
            </span>
          </div>
          <strong className="ml-auto text-[#16d9ff] text-[11px] font-bold">
            LIVE
          </strong>
        </div>

        <div className="mt-[18px]">
          <div className="w-full h-[6px] overflow-hidden rounded-[10px] bg-[#10212d]">
            <div
              className="h-full rounded-[inherit] bg-[linear-gradient(90deg,#16d9ff,#249cff,#8b4dff)] transition-all duration-200"
              style={{
                width: `${signalProgress}%`,
              }}
            />
          </div>
          <div className="flex justify-between mt-[8px] text-[#567280] text-[11px]">
            <span>Sensor signal</span>
            <strong className="text-[#16d9ff] text-[12px] font-bold">
              {signalProgress}%
            </strong>
          </div>
        </div>
      </div>

      <aside className="grid grid-rows-[repeat(4,1fr)_auto] gap-[13px] min-h-0">
        <div className="flex flex-col justify-center px-[19px] py-[17px] border border-[rgba(55,155,193,0.15)] rounded-[13px] bg-[linear-gradient(145deg,rgba(7,20,30,0.94),rgba(4,12,19,0.96))]">
          <span className="text-[#78929f] text-[12px]">Signal Quality</span>
          <strong className="mt-[10px] text-[#24e6a0] text-[18px] font-bold">Excellent</strong>
          <div className="flex gap-[5px] mt-[10px]">
            <span className="flex-1 h-[4px] rounded-[4px] bg-[#16d9ff]" />
            <span className="flex-1 h-[4px] rounded-[4px] bg-[#16d9ff]" />
            <span className="flex-1 h-[4px] rounded-[4px] bg-[#16d9ff]" />
            <span className="flex-1 h-[4px] rounded-[4px] bg-[#16d9ff]" />
            <span className="flex-1 h-[4px] rounded-[4px] bg-[#16d9ff]" />
            <span className="flex-1 h-[4px] rounded-[4px] bg-[#16d9ff]" />
          </div>
        </div>

        <div className="flex flex-col justify-center px-[19px] py-[17px] border border-[rgba(55,155,193,0.15)] rounded-[13px] bg-[linear-gradient(145deg,rgba(7,20,30,0.94),rgba(4,12,19,0.96))]">
          <span className="text-[#78929f] text-[12px]">Reading Stability</span>
          <strong className="mt-[10px] text-[#ffc857] text-[18px] font-bold">Improving</strong>
          <div className="flex gap-[5px] mt-[10px]">
            <span className="flex-1 h-[4px] rounded-[4px] bg-[#16d9ff]" />
            <span className="flex-1 h-[4px] rounded-[4px] bg-[#16d9ff]" />
            <span className="flex-1 h-[4px] rounded-[4px] bg-[#16d9ff]" />
            <span className="flex-1 h-[4px] rounded-[4px] bg-[#16d9ff]" />
            <span className="flex-1 h-[4px] rounded-[4px] bg-[#172933]" />
            <span className="flex-1 h-[4px] rounded-[4px] bg-[#172933]" />
          </div>
        </div>

        <div className="flex flex-col justify-center px-[19px] py-[17px] border border-[rgba(55,155,193,0.15)] rounded-[13px] bg-[linear-gradient(145deg,rgba(7,20,30,0.94),rgba(4,12,19,0.96))]">
          <span className="text-[#78929f] text-[12px]">Sensor Contact</span>
          <strong className="mt-[10px] text-[#bdd0d9] text-[18px] font-bold">Detected</strong>
          <small className="mt-[7px] text-[#526d7b] text-[10px]">Finger detected</small>
        </div>

        <div className="flex flex-col justify-center px-[19px] py-[17px] border border-[rgba(55,155,193,0.15)] rounded-[13px] bg-[linear-gradient(145deg,rgba(7,20,30,0.94),rgba(4,12,19,0.96))]">
          <span className="text-[#78929f] text-[12px]">Device Status</span>
          <strong className="mt-[10px] text-[#24e6a0] text-[18px] font-bold">Online</strong>
          <small className="mt-[7px] text-[#526d7b] text-[10px]">ESP32 connected</small>
        </div>

        <div className="flex items-start gap-[12px] p-[14px] border border-[rgba(255,200,87,0.13)] rounded-[12px] bg-[rgba(49,37,11,0.28)]">
          <span className="flex items-center justify-center w-[25px] h-[25px] flex-none rounded-full text-[#ffc857] bg-[rgba(255,200,87,0.08)] text-[12px] font-bold">
            i
          </span>
          <div>
            <strong className="text-[#c6d4da] text-[11px] font-bold">Keep your finger still</strong>
            <p className="m-0 mt-[4px] text-[#667b86] text-[10px] leading-[1.4]">
              Movement can affect signal quality.
            </p>
          </div>
        </div>
      </aside>
    </section>
  )
}