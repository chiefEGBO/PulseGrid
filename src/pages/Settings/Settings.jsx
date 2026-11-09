import { useState } from 'react'
import Sidebar from '../../components/Sidebar'

export default function Settings() {
  const [settings, setSettings] = useState({
    deviceIp: '192.168.56.1',
    samplingRate: '100Hz',
    enableNotifications: true,
    soundAlerts: true,
    autoExportCsv: false,
    dataRetentionDays: '30',
    theme: 'Neon Dark (Default)',
    webSocketStream: true,
    highHrThreshold: '120',
    lowSpO2Threshold: '92',
  })

  const [savedMsg, setSavedMsg] = useState('')

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSavedMsg('Settings saved successfully!')
    setTimeout(() => setSavedMsg(''), 3000)
  }

  return (
    <div className="flex min-h-screen w-full bg-[radial-gradient(circle_at_50%_42%,rgba(14,36,66,0.5)_0%,rgba(5,13,27,0.8)_42%,rgba(2,5,14,0.96)_78%,#010208_100%)] text-[#9ed3fe] font-['Inter','Nunito_Sans',sans-serif]">
      <Sidebar />

      <main className="flex-1 relative p-4 sm:p-8 overflow-y-auto ml-[0px] max-[1050px]:ml-[180px] max-[700px]:ml-5">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 -right-[200px] top-[15%] bg-[#00aeff]" />
          <div className="absolute w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 -left-[200px] bottom-[15%] bg-[#a62dff]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="border-b border-[rgba(94,145,194,0.2)] pb-4">
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#b1d6ff]">
              Settings
            </h1>
            <p className="text-xs sm:text-sm text-[rgba(150,199,255,0.8)] mt-1">
              webapp configurations
            </p>
          </div>

          {savedMsg && (
            <div className="p-3 rounded-lg bg-[rgba(0,200,255,0.1)] border border-[rgba(0,200,255,0.3)] text-[#00c8ff] text-xs sm:text-sm text-center">
              {savedMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Hardware & Communication */}
            <div className="p-6 bg-[linear-gradient(145deg,rgba(9,24,39,0.85),rgba(3,9,19,0.9))] border border-[rgba(94,145,194,0.28)] rounded-2xl backdrop-blur-md shadow-[0_15px_40px_rgba(0,0,0,0.6)] space-y-4">
              <h2 className="text-base sm:text-lg font-semibold text-[#9dc0fe] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00c8ff] shadow-[0_0_8px_#00c8ff]" />
                ESP32 & MAX30102 Hardware Communication
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[rgba(139,197,255,0.9)]">ESP32 IP / Hostname Endpoint</label>
                  <input
                    type="text"
                    name="deviceIp"
                    value={settings.deviceIp}
                    onChange={handleInputChange}
                    className="w-full h-11 px-3.5 rounded-lg bg-[rgba(2,10,19,0.84)] border border-[rgba(95,133,168,0.24)] text-[#bbdbff] text-xs sm:text-sm outline-none focus:border-[rgba(0,194,255,0.65)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[rgba(139,197,255,0.9)]">Sampling Frequency</label>
                  <select
                    name="samplingRate"
                    value={settings.samplingRate}
                    onChange={handleInputChange}
                    className="w-full h-11 px-3.5 rounded-lg bg-[rgba(2,10,19,0.84)] border border-[rgba(95,133,168,0.24)] text-[#bbdbff] text-xs sm:text-sm outline-none focus:border-[rgba(0,194,255,0.65)]"
                  >
                    <option value="50Hz">50 Hz</option>
                    <option value="100Hz">100 Hz (Recommended)</option>
                    <option value="200Hz">200 Hz</option>
                    <option value="400Hz">400 Hz</option>
                  </select>
                </div>
              </div>

              {/* Realtime Stream Switch */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-[rgba(2,10,19,0.6)] border border-[rgba(95,133,168,0.18)]">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-[#bbdbff]">WebSocket Low-Latency Streaming</p>
                  <p className="text-[11px] text-[rgba(150,199,255,0.6)]">Stream PPG signals instantly instead of polling</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('webSocketStream')}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                    settings.webSocketStream ? 'bg-[#00c8ff]' : 'bg-[rgba(95,133,168,0.3)]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                      settings.webSocketStream ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Custom Alert Thresholds & Notifications */}
            <div className="p-6 bg-[linear-gradient(145deg,rgba(9,24,39,0.85),rgba(3,9,19,0.9))] border border-[rgba(94,145,194,0.28)] rounded-2xl backdrop-blur-md shadow-[0_15px_40px_rgba(0,0,0,0.6)] space-y-4">
              <h2 className="text-base sm:text-lg font-semibold text-[#9dc0fe] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#bd3cff] shadow-[0_0_8px_#bd3cff]" />
                Alerts & Health Thresholds
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[rgba(139,197,255,0.9)]">High HR Warning Trigger (BPM)</label>
                  <input
                    type="number"
                    name="highHrThreshold"
                    value={settings.highHrThreshold}
                    onChange={handleInputChange}
                    className="w-full h-11 px-3.5 rounded-lg bg-[rgba(2,10,19,0.84)] border border-[rgba(95,133,168,0.24)] text-[#bbdbff] text-xs sm:text-sm outline-none focus:border-[rgba(0,194,255,0.65)]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[rgba(139,197,255,0.9)]">Low SpO₂ Warning Trigger (%)</label>
                  <input
                    type="number"
                    name="lowSpO2Threshold"
                    value={settings.lowSpO2Threshold}
                    onChange={handleInputChange}
                    className="w-full h-11 px-3.5 rounded-lg bg-[rgba(2,10,19,0.84)] border border-[rgba(95,133,168,0.24)] text-[#bbdbff] text-xs sm:text-sm outline-none focus:border-[rgba(0,194,255,0.65)]"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[rgba(2,10,19,0.6)] border border-[rgba(95,133,168,0.18)]">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-[#bbdbff]">Visual Alerts</p>
                    <p className="text-[11px] text-[rgba(150,199,255,0.6)]">Display warning banners when irregular readings occur</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle('enableNotifications')}
                    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                      settings.enableNotifications ? 'bg-[#00c8ff]' : 'bg-[rgba(95,133,168,0.3)]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                        settings.enableNotifications ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[rgba(2,10,19,0.6)] border border-[rgba(95,133,168,0.18)]">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-[#bbdbff]">Audio Beep Alerts</p>
                    <p className="text-[11px] text-[rgba(150,199,255,0.6)]">Play sound tone during dangerous SpO₂ drops</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggle('soundAlerts')}
                    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                      settings.soundAlerts ? 'bg-[#bd3cff]' : 'bg-[rgba(95,133,168,0.3)]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                        settings.soundAlerts ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Interface Preferences & Data Retention */}
            <div className="p-6 bg-[linear-gradient(145deg,rgba(9,24,39,0.85),rgba(3,9,19,0.9))] border border-[rgba(94,145,194,0.28)] rounded-2xl backdrop-blur-md shadow-[0_15px_40px_rgba(0,0,0,0.6)] space-y-4">
              <h2 className="text-base sm:text-lg font-semibold text-[#9dc0fe]">Web Application Preferences</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[rgba(139,197,255,0.9)]">Dashboard Theme</label>
                  <select
                    name="theme"
                    value={settings.theme}
                    onChange={handleInputChange}
                    className="w-full h-11 px-3.5 rounded-lg bg-[rgba(2,10,19,0.84)] border border-[rgba(95,133,168,0.24)] text-[#bbdbff] text-xs sm:text-sm outline-none focus:border-[rgba(0,194,255,0.65)]"
                  >
                    <option value="Neon Dark (Default)">Neon Dark (Default)</option>
                    <option value="Cyber Cyan">Cyber Cyan Accent</option>
                    <option value="High Contrast Dark">High Contrast Dark</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[rgba(139,197,255,0.9)]">Data History Retention</label>
                  <select
                    name="dataRetentionDays"
                    value={settings.dataRetentionDays}
                    onChange={handleInputChange}
                    className="w-full h-11 px-3.5 rounded-lg bg-[rgba(2,10,19,0.84)] border border-[rgba(95,133,168,0.24)] text-[#bbdbff] text-xs sm:text-sm outline-none focus:border-[rgba(0,194,255,0.65)]"
                  >
                    <option value="7">7 Days</option>
                    <option value="30">30 Days</option>
                    <option value="90">90 Days</option>
                    <option value="365">1 Year</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[rgba(2,10,19,0.6)] border border-[rgba(95,133,168,0.18)]">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-[#bbdbff]">Auto CSV Export</p>
                  <p className="text-[11px] text-[rgba(150,199,255,0.6)]">Save session logs locally after every measurement</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle('autoExportCsv')}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                    settings.autoExportCsv ? 'bg-[#00c8ff]' : 'bg-[rgba(95,133,168,0.3)]'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
                      settings.autoExportCsv ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-[linear-gradient(100deg,#08baf2_0%,#357cf4_46%,#9a32ed_100%)] text-[#c7e5ff] text-xs sm:text-sm font-semibold shadow-[0_8px_24px_rgba(48,105,239,0.25)] hover:brightness-[1.08] transition-all"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}