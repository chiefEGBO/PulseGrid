import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  onAuthStateChanged,
  signOut,
  updatePassword,
  updateProfile,
} from 'firebase/auth'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import {
  User,
  Mail,
  Pencil,
  Save,
  X,
  Lock,
  LogOut,
  HeartPulse,
  Activity,
  CalendarDays,
  Clock3,
} from 'lucide-react'
import { auth, db } from '../../firebase/firebase'
import Sidebar from '../../components/Sidebar'

const HEADER_BLUE = '#b1d6ff'

const ProfileBackground = () => (
  <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
    <div
      className="absolute -top-[10%] left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full opacity-20 blur-[120px]"
      style={{
        background:
          'radial-gradient(circle, rgba(0,217,255,0.4) 0%, rgba(71,124,255,0.2) 50%, transparent 80%)',
      }}
    />
  </div>
)

const StatCard = ({
  label,
  value,
  unit = '',
  description,
  icon,
  accent,
  valueSize = 'text-[28px]',
}) => (
  <div className="relative overflow-hidden rounded-[16px] border border-[rgba(177,214,255,0.12)] bg-[rgba(6,18,30,0.65)] p-5 backdrop-blur-md">
    <div className="flex items-center justify-between gap-3">
      <span className="text-[12px] font-bold text-[#7692a9]">{label}</span>
      <div
        className="flex h-8 w-8 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${accent}15`, color: accent }}
      >
        {icon}
      </div>
    </div>
    <div className="mt-3 flex items-baseline gap-1.5">
      <span className={`${valueSize} font-bold text-[#b1d6ff]`}>{value}</span>
      {unit && <span className="text-[14px] font-semibold text-[#7692a9]">{unit}</span>}
    </div>
    <p className="mt-1 text-[11px] text-[#55718a]">{description}</p>
  </div>
)

const SectionHeading = ({ title }) => (
  <div className="mb-4 flex items-center gap-3">
    <h2 className="text-[17px] font-bold" style={{ color: HEADER_BLUE }}>
      {title}
    </h2>
    <div className="h-px flex-1 bg-gradient-to-r from-[rgba(177,214,255,0.2)] to-transparent" />
  </div>
)

const InformationItem = ({ icon, label, value, accent }) => (
  <div className="flex items-center gap-3.5 rounded-[12px] border border-[rgba(177,214,255,0.08)] bg-[rgba(3,10,18,0.5)] p-3.5">
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
      style={{ backgroundColor: `${accent}15`, color: accent }}
    >
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <span className="block text-[10px] font-bold uppercase tracking-wider text-[#55718a]">
        {label}
      </span>
      <span className="truncate block text-[14px] font-semibold text-[#b1d6ff]">
        {value}
      </span>
    </div>
  </div>
)

// Convert Firebase timestamps and date strings into Date objects.
const toDate = (value) => {
  if (!value) {
    return null
  }
  if (typeof value?.toDate === 'function') {
    return value.toDate()
  }
  if (typeof value?.seconds === 'number') {
    return new Date(value.seconds * 1000)
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return date
}

// Format a date for display.
const formatDate = (value, includeTime = false) => {
  const date = toDate(value)
  if (!date) {
    return '—'
  }
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(includeTime
      ? {
          hour: 'numeric',
          minute: '2-digit',
        }
      : {}),
  })
}

// Support the heart-rate field names currently used by the project.
const getHeartRate = (measurement) => {
  const possibleValues = [
    measurement?.heartRate,
    measurement?.heart_rate,
    measurement?.bpm,
    measurement?.heart_rate_bpm,
  ]
  for (const value of possibleValues) {
    const number = Number(value)
    if (Number.isFinite(number) && number > 0) {
      return number
    }
  }
  return null
}

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [measurements, setMeasurements] = useState([])
  const [loadingUser, setLoadingUser] = useState(true)
  const [loadingMeasurements, setLoadingMeasurements] = useState(true)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [editName, setEditName] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  // Listen for the authenticated Firebase user.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (!currentUser) {
          navigate('/login', {
            replace: true,
          })
          return
        }
        setUser(currentUser)
        setEditName(currentUser.displayName || '')
        setLoadingUser(false)

        // Load the user's Firestore profile.
        try {
          const userRef = doc(
            db,
            'users',
            currentUser.uid
          )
          const userSnapshot = await getDoc(userRef)
          if (userSnapshot.exists()) {
            setProfile(userSnapshot.data())
          }
        } catch (error) {
          console.error(
            'Unable to load user profile:',
            error
          )
        }

        // Load measurements belonging to the authenticated user.
        try {
          const measurementsRef = collection(
            db,
            'measurements'
          )
          const measurementsQuery = query(
            measurementsRef,
            where(
              'userId',
              '==',
              currentUser.uid
            )
          )
          const snapshot = await getDocs(
            measurementsQuery
          )
          const measurementData =
            snapshot.docs.map((measurementDoc) => ({
              id: measurementDoc.id,
              ...measurementDoc.data(),
            }))
          setMeasurements(measurementData)
        } catch (error) {
          console.error(
            'Unable to load measurements:',
            error
          )
          setMeasurements([])
        } finally {
          setLoadingMeasurements(false)
        }
      }
    )
    return () => unsubscribe()
  }, [navigate])

  // Calculate measurement statistics from recorded readings.
  const statistics = useMemo(() => {
    const validHeartRates = measurements
      .map(getHeartRate)
      .filter(
        (value) =>
          value !== null &&
          value > 0
      )
    if (validHeartRates.length === 0) {
      return {
        measurementsTaken: measurements.length,
        averageHeartRate: null,
      }
    }
    const total = validHeartRates.reduce(
      (sum, value) => sum + value,
      0
    )
    const average =
      total / validHeartRates.length
    return {
      measurementsTaken: measurements.length,
      averageHeartRate: Math.round(average),
    }
  }, [measurements])

  if (loadingUser) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#02060c]">
        <ProfileBackground />
        <div className="relative z-10 flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div
              className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
              style={{
                borderColor: HEADER_BLUE,
                borderTopColor: 'transparent',
              }}
            />
            <p className="text-sm text-[#7892aa]">
              Loading profile...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const displayName =
    user.displayName ||
    profile?.displayName ||
    user.email?.split('@')[0] ||
    'PulseGrid User'
  const email =
    user.email ||
    profile?.email ||
    '—'
  const dateJoined =
    profile?.dateJoined ||
    profile?.createdAt ||
    user.metadata?.creationTime
  const lastLogin =
    profile?.lastLogin ||
    user.metadata?.lastSignInTime
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()

  // Open the profile editor.
  const openProfileEditor = () => {
    setEditName(displayName)
    setProfileError('')
    setProfileSuccess('')
    setIsEditingProfile(true)
  }

  // Close the profile editor without saving.
  const closeProfileEditor = () => {
    setEditName(displayName)
    setProfileError('')
    setProfileSuccess('')
    setIsEditingProfile(false)
  }

  // Save the updated display name.
  const handleSaveProfile = async (event) => {
    event.preventDefault()
    const trimmedName = editName.trim()
    if (!trimmedName) {
      setProfileError('Please enter your name.')
      return
    }
    try {
      setSavingProfile(true)
      setProfileError('')
      setProfileSuccess('')
      await updateProfile(auth.currentUser, {
        displayName: trimmedName,
      })

      // Keep the Firestore profile synchronized with Firebase Auth.
      try {
        const userRef = doc(
          db,
          'users',
          user.uid
        )
        await updateDoc(userRef, {
          displayName: trimmedName,
        })
      } catch (firestoreError) {
        console.warn(
          'Firestore profile document could not be updated:',
          firestoreError
        )
      }

      setUser({
        ...auth.currentUser,
        displayName: trimmedName,
      })
      setProfile((currentProfile) => ({
        ...(currentProfile || {}),
        displayName: trimmedName,
      }))
      setProfileSuccess(
        'Profile updated successfully.'
      )
      setTimeout(() => {
        setIsEditingProfile(false)
        setProfileSuccess('')
      }, 900)
    } catch (error) {
      console.error(
        'Unable to update profile:',
        error
      )
      setProfileError(
        'Unable to update your profile. Please try again.'
      )
    } finally {
      setSavingProfile(false)
    }
  }

  // Open the password editor.
  const openPasswordEditor = () => {
    setNewPassword('')
    setConfirmPassword('')
    setPasswordError('')
    setPasswordSuccess('')
    setIsChangingPassword(true)
  }

  // Close the password editor.
  const closePasswordEditor = () => {
    setNewPassword('')
    setConfirmPassword('')
    setPasswordError('')
    setPasswordSuccess('')
    setIsChangingPassword(false)
  }

  // Update the authenticated user's password.
  const handleChangePassword = async (event) => {
    event.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')
    if (newPassword.length < 6) {
      setPasswordError(
        'Your new password must contain at least 6 characters.'
      )
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(
        'The passwords do not match.'
      )
      return
    }
    try {
      setChangingPassword(true)
      await updatePassword(
        auth.currentUser,
        newPassword
      )
      setNewPassword('')
      setConfirmPassword('')
      setPasswordSuccess(
        'Password changed successfully.'
      )
      setTimeout(() => {
        setIsChangingPassword(false)
        setPasswordSuccess('')
      }, 1200)
    } catch (error) {
      console.error(
        'Unable to change password:',
        error
      )
      if (
        error.code ===
        'auth/requires-recent-login'
      ) {
        setPasswordError(
          'For security, please log out and sign in again before changing your password.'
        )
      } else if (
        error.code ===
        'auth/weak-password'
      ) {
        setPasswordError(
          'Please choose a stronger password.'
        )
      } else {
        setPasswordError(
          'Unable to change your password. Please try again.'
        )
      }
    } finally {
      setChangingPassword(false)
    }
  }

  // Sign out the current Firebase session.
  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      await signOut(auth)
      navigate('/login', {
        replace: true,
      })
    } catch (error) {
      console.error(
        'Logout failed:',
        error
      )
      setLoggingOut(false)
    }
  }

  return (
    <div className="flex relative min-h-screen overflow-x-hidden bg-[#02060c] text-[#8fb1c9]">
      <ProfileBackground />
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar activePage="profile" />
      </div>

      <main
        className="
          flex-1
          relative z-[1]
          min-h-screen
          ml-[300px]
          mr-8
          py-8
          max-[1050px]:ml-[180px]
          max-[1050px]:mr-5
          max-[700px]:ml-5
          max-[700px]:mr-5
          max-[700px]:pt-28
        "
      >
        <div className="mr-auto max-w-[1180px]">
          <header className="mb-8 flex items-start justify-between gap-5">
            <div>
              <p
                className="mb-2 text-[10px] font-bold uppercase tracking-[3px]"
                style={{
                  color: HEADER_BLUE,
                  textShadow:
                    '0 0 15px rgba(177,214,255,.3)',
                }}
              >
                ACCOUNT
              </p>
              <h1
                className="text-[40px] font-bold tracking-[-1px]"
                style={{
                  color: HEADER_BLUE,
                  textShadow:
                    '0 0 25px rgba(177,214,255,.18)',
                }}
              >
                Profile
              </h1>
              <p className="mt-2 text-[15px] text-[#b1d6ff]">
                View and manage your account information.
              </p>
            </div>
            <button
              type="button"
              onClick={openProfileEditor}
              className="
                flex shrink-0 items-center gap-2
                rounded-[10px]
                border border-[rgba(177,214,255,.24)]
                bg-[rgba(7,19,30,.78)]
                px-4 py-2.5
                text-[12px] font-bold
                text-[#b1d6ff]
                shadow-[0_0_20px_rgba(0,170,255,.04)]
                backdrop-blur-md
                transition-all duration-200
                hover:border-[rgba(177,214,255,.55)]
                hover:bg-[rgba(177,214,255,.07)]
                hover:shadow-[0_0_24px_rgba(177,214,255,.1)]
              "
            >
              <Pencil size={15} />
              Edit Profile
            </button>
          </header>

          <section
            className="
              relative mb-6 overflow-hidden
              rounded-[19px]
              border border-[rgba(177,214,255,.16)]
              bg-[linear-gradient(135deg,rgba(7,22,34,.94),rgba(5,11,21,.94),rgba(15,7,25,.9))]
              p-6
              shadow-[0_18px_50px_rgba(0,0,0,.3)]
              backdrop-blur-xl
            "
          >
            <div
              className="
                absolute -right-20 -top-28
                h-[300px] w-[300px]
                rounded-full
                opacity-20 blur-[100px]
              "
              style={{
                background:
                  'radial-gradient(circle,#00d9ff 0%,transparent 70%)',
              }}
            />
            <div
              className="
                absolute -bottom-28 left-[40%]
                h-[260px] w-[260px]
                rounded-full
                opacity-10 blur-[100px]
              "
              style={{
                background:
                  'radial-gradient(circle,#ec4899 0%,transparent 70%)',
              }}
            />
            <div className="relative flex items-center gap-5">
              <div className="relative shrink-0">
                <div
                  className="
                    absolute inset-[-5px]
                    rounded-full
                    opacity-70 blur-md
                  "
                  style={{
                    background:
                      'linear-gradient(135deg,#00d9ff,#477cff,#a855f7,#ec4899)',
                  }}
                />
                <div
                  className="
                    relative flex h-[82px] w-[82px]
                    items-center justify-center
                    rounded-full
                    border border-[rgba(177,214,255,.35)]
                    bg-[linear-gradient(135deg,rgba(0,217,255,.12),rgba(124,58,237,.18),rgba(236,72,153,.12))]
                    text-[24px] font-bold
                  "
                  style={{
                    color: HEADER_BLUE,
                  }}
                >
                  {initials}
                </div>
              </div>
              <div className="min-w-0">
                <p
                  className="mb-1 text-[9px] font-bold uppercase tracking-[2px]"
                  style={{
                    color: '#00d9ff',
                  }}
                >
                  AUTHENTICATED USER
                </p>
                <h2
                  className="truncate text-[25px] font-bold"
                  style={{
                    color: HEADER_BLUE,
                  }}
                >
                  {displayName}
                </h2>
                <div className="mt-2 flex items-center gap-2 text-[13px] text-[#7692a9]">
                  <Mail
                    size={14}
                    className="text-[#00d9ff]"
                  />
                  <span className="truncate">
                    {email}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-7">
            <div className="mb-4 flex items-center gap-3">
              <h2
                className="text-[17px] font-bold"
                style={{
                  color: HEADER_BLUE,
                }}
              >
                Account Overview
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-[rgba(177,214,255,.2)] to-transparent" />
            </div>
            <div className="grid grid-cols-2 gap-4 max-[700px]:grid-cols-1">
              <StatCard
                label="Measurements Taken"
                value={
                  loadingMeasurements
                    ? '...'
                    : statistics.measurementsTaken
                }
                description="Recorded measurements"
                icon={<Activity size={20} />}
                accent="#00d9ff"
                valueSize="text-[30px]"
              />
              <StatCard
                label="Average Heart Rate"
                value={
                  loadingMeasurements
                    ? '...'
                    : statistics.averageHeartRate ?? '—'
                }
                unit={
                  statistics.averageHeartRate !== null
                    ? 'BPM'
                    : ''
                }
                description="Calculated from recorded readings"
                icon={<HeartPulse size={20} />}
                accent="#ff63b0"
                valueSize="text-[30px]"
              />
              <StatCard
                label="Date Joined"
                value={formatDate(dateJoined)}
                description="Account creation date"
                icon={<CalendarDays size={20} />}
                accent={HEADER_BLUE}
                valueSize="text-[22px]"
              />
              <StatCard
                label="Last Login"
                value={formatDate(lastLogin, true)}
                description="Most recent authentication"
                icon={<Clock3 size={20} />}
                accent="#b58cff"
                valueSize="text-[22px]"
              />
            </div>
          </section>

          <section className="mb-7">
            <SectionHeading title="Personal Information" />
            <div
              className="
                rounded-[18px]
                border border-[rgba(177,214,255,.13)]
                bg-[rgba(5,14,24,.75)]
                p-5
                shadow-[0_15px_40px_rgba(0,0,0,.25)]
                backdrop-blur-xl
              "
            >
              {!isEditingProfile ? (
                <div className="grid grid-cols-2 gap-4 max-[700px]:grid-cols-1">
                  <InformationItem
                    icon={<User size={16} />}
                    label="Full Name"
                    value={displayName}
                    accent="#00d9ff"
                  />
                  <InformationItem
                    icon={<Mail size={16} />}
                    label="Email Address"
                    value={email}
                    accent="#a855f7"
                  />
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  {profileError && (
                    <p className="text-xs text-red-400">{profileError}</p>
                  )}
                  {profileSuccess && (
                    <p className="text-xs text-emerald-400">{profileSuccess}</p>
                  )}
                  <div>
                    <label className="block mb-1 text-xs font-medium text-[#7692a9]">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-lg border border-[rgba(177,214,255,0.2)] bg-[rgba(3,10,18,0.7)] px-3 py-2 text-sm text-[#b1d6ff] outline-none focus:border-[#00d9ff]"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="flex items-center gap-1.5 rounded-lg bg-[#00d9ff]/20 border border-[#00d9ff]/40 px-4 py-2 text-xs font-semibold text-[#00d9ff] hover:bg-[#00d9ff]/30"
                    >
                      <Save size={14} />
                      {savingProfile ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={closeProfileEditor}
                      className="flex items-center gap-1.5 rounded-lg border border-[rgba(177,214,255,0.2)] px-4 py-2 text-xs font-semibold text-[#7692a9] hover:bg-[rgba(177,214,255,0.05)]"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>

          <section className="mb-7">
            <SectionHeading title="Security & Settings" />
            <div className="rounded-[18px] border border-[rgba(177,214,255,.13)] bg-[rgba(5,14,24,.75)] p-5 shadow-[0_15px_40px_rgba(0,0,0,.25)] backdrop-blur-xl">
              {!isChangingPassword ? (
                <div className="flex items-center justify-between gap-4 max-[700px]:flex-col max-[700px]:items-start">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00d9ff]/10 text-[#00d9ff]">
                      <Lock size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#b1d6ff]">Password</h3>
                      <p className="text-xs text-[#55718a]">Update your account password</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={openPasswordEditor}
                    className="rounded-lg border border-[rgba(177,214,255,0.2)] bg-[rgba(7,19,30,0.5)] px-4 py-2 text-xs font-semibold text-[#b1d6ff] hover:border-[rgba(177,214,255,0.4)]"
                  >
                    Change Password
                  </button>
                </div>
              ) : (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  {passwordError && (
                    <p className="text-xs text-red-400">{passwordError}</p>
                  )}
                  {passwordSuccess && (
                    <p className="text-xs text-emerald-400">{passwordSuccess}</p>
                  )}
                  <div className="grid grid-cols-2 gap-4 max-[700px]:grid-cols-1">
                    <div>
                      <label className="block mb-1 text-xs font-medium text-[#7692a9]">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-lg border border-[rgba(177,214,255,0.2)] bg-[rgba(3,10,18,0.7)] px-3 py-2 text-sm text-[#b1d6ff] outline-none focus:border-[#00d9ff]"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-xs font-medium text-[#7692a9]">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-lg border border-[rgba(177,214,255,0.2)] bg-[rgba(3,10,18,0.7)] px-3 py-2 text-sm text-[#b1d6ff] outline-none focus:border-[#00d9ff]"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="flex items-center gap-1.5 rounded-lg bg-[#00d9ff]/20 border border-[#00d9ff]/40 px-4 py-2 text-xs font-semibold text-[#00d9ff] hover:bg-[#00d9ff]/30"
                    >
                      <Lock size={14} />
                      {changingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                    <button
                      type="button"
                      onClick={closePasswordEditor}
                      className="flex items-center gap-1.5 rounded-lg border border-[rgba(177,214,255,0.2)] px-4 py-2 text-xs font-semibold text-[#7692a9] hover:bg-[rgba(177,214,255,0.05)]"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>

          <section className="mb-10 flex justify-end">
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-xs font-bold text-red-400 transition-all hover:bg-red-500/20"
            >
              <LogOut size={16} />
              {loggingOut ? 'Logging out...' : 'Log Out Session'}
            </button>
          </section>
        </div>
      </main>
    </div>
  )
}