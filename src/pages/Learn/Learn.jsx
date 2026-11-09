import { useEffect, useMemo, useState } from 'react'
import {
  FiArrowRight,
  FiBookOpen,
  FiCheckCircle,
  FiChevronLeft,
  FiClock,
  FiHeart,
  FiInfo,
  FiSearch,
  FiX,
  FiZap,
} from 'react-icons/fi'

import Sidebar from '../../components/Sidebar'

const dailyHeartTips = [
  "Aim for 7 to 9 hours of quality sleep. Deep sleep triggers a nocturnal heart rate dip, giving your arterial walls and cardiac muscle essential rest.",
  "Practice 5 minutes of deep box breathing (4s inhale, 4s hold, 4s exhale, 4s hold) to activate your vagus nerve and rapidly lower elevated stress levels.",
  "Stay hydrated! Proper fluid intake maintains blood plasma volume, preventing your heart from having to pump faster to move thicker blood.",
  "Incorporate Zone 2 cardio (like a brisk walk or easy jog) to strengthen your heart's stroke volume and lower your baseline resting heart rate.",
  "Watch your late-night caffeine intake. Stop consuming caffeine 6 to 8 hours before bedtime to avoid disrupting nighttime Heart Rate Variability (HRV).",
  "Take short movement breaks every hour. Sitting for prolonged periods reduces vascular flow and increases peripheral resistance in your arteries.",
  "Monitor your morning resting heart rate baseline. A sudden rise of 5-10 BPM over consecutive days can signal hidden fatigue, dehydration, or stress.",
  "Reduce excess dietary sodium to help maintain healthy blood pressure levels and reduce strain on your cardiovascular system."
]

function getDailyTipIndex() {
  const now = new Date()
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now - start
  const oneDay = 1000 * 60 * 60 * 24
  const dayOfYear = Math.floor(diff / oneDay)
  return dayOfYear % dailyHeartTips.length
}

const articles = [
  {
    id: 'blood-oxygen',
    title: 'Understanding Blood Oxygen',
    category: 'Heart & Oxygen',
    description:
      'Learn how SpO₂ delivers energy to your body, what normal levels mean, and what factors cause readings to drop.',
    readTime: '5 min read',
    image:
      'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=900&q=85',
    content: [
      'Blood oxygen saturation—commonly referred to as SpO₂—measures how much oxygen your red blood cells are carrying compared to their maximum capacity. Oxygen acts as fuel for your body. Every time you breathe in, your lungs transfer oxygen into your bloodstream, where red blood cells pick it up like tiny delivery trucks and carry it to your brain, muscles, and organs.',
      'For a healthy adult at sea level, a normal SpO₂ reading sits comfortably between 95% and 100%. If your levels consistently dip below 95%, it indicates that your body\'s tissues aren\'t receiving their ideal supply of oxygen.',
      'Smartwatches and pulse oximeters measure SpO₂ using light absorption (photoplethysmography). They shine small red and infrared lights through the tiny blood vessels in your skin. Oxygen-rich blood looks bright red and absorbs light differently than darker, oxygen-depleted blood. The sensor compares how much light passes through to estimate your oxygen levels.',
      'What affects your SpO₂ levels?',
      {
        type: 'list',
        items: [
          'Altitude: Higher elevations have thinner air with less oxygen pressure, which causes natural, temporary drops in your SpO₂ reading.',
          'Illness: Respiratory issues like a heavy cold, flu, asthma, or lung congestion make it harder for oxygen to transfer from your lungs into your blood.',
          'Sleep Apnea: If you snore heavily or stop breathing briefly during sleep, your SpO₂ can drop repeatedly throughout the night, leaving you feeling exhausted in the morning.',
        ],
      },
    ],
  },
  {
    id: 'caffeine',
    title: 'Caffeine and Your Heart',
    category: 'Lifestyle',
    description:
      'Discover how coffee blocks fatigue signals, releases adrenaline, and temporarily speeds up your pulse.',
    readTime: '4 min read',
    image:
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85',
    content: [
      'Ever wonder why a morning cup of coffee or an energy drink wakes you up so quickly? Caffeine is a natural central nervous system stimulant. Throughout the day, a chemical called adenosine builds up in your brain, signaling to your body that it\'s time to rest. Caffeine works by temporarily blocking adenosine from doing its job—essentially putting a mute button on your body\'s natural fatigue signal.',
      'When adenosine is blocked, your body responds by releasing a small wave of natural energy hormones, including adrenaline (epinephrine). This adrenaline surge causes a few distinct changes in your cardiovascular system:',
      {
        type: 'list',
        items: [
          'Temporary HR & Blood Pressure Spikes: Your heart may beat 5 to 10 beats faster per minute, and your blood vessels may tighten slightly, causing a temporary rise in blood pressure.',
          'Timing & Duration: Peak caffeine levels in your blood usually occur 30 to 60 minutes after drinking it. However, caffeine has a long half-life (around 3 to 6 hours), meaning half of the caffeine is still circulating in your body hours later.',
          'Finding Your Limit: Up to 400 mg of caffeine a day (roughly 3 to 4 standard 8 oz cups of coffee) is considered safe for most healthy adults. However, everyone processes caffeine at a different speed based on genetics. If you feel heart flutters, a racing pulse, or sudden jitteriness, your body is letting you know you’ve exceeded your personal comfort threshold.',
        ],
      },
    ],
  },
  {
    id: 'exercise',
    title: 'Heart Rate During Exercise',
    category: 'Exercise',
    description:
      'A practical guide to calculating your workout intensity zones and tracking post-exercise heart recovery.',
    readTime: '6 min read',
    image:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=85',
    content: [
      'When you start exercising, your active muscles demand more energy and oxygen. To meet this demand, your brain signals your heart to pump faster and harder, increasing total blood circulation. Tracking your heart rate during workouts ensures you are training at the right intensity for your specific health goals.',
      'To calculate your workout intensity, start with an estimate of your Maximum Heart Rate (HRmax)—the maximum speed your heart can safely reach during peak effort. The standard baseline formula is: HRmax = 220 - Your Age (for example, a 30-year-old has an estimated maximum heart rate of 190 BPM).',
      {
        type: 'table',
        headers: ['Exercise Zone', 'Intensity (% HRmax)', 'Workout Pace', 'Primary Health Benefit'],
        rows: [
          ['Zone 1: Warm-Up', '50% – 60%', 'Casual walking', 'Improves circulation & clears soreness'],
          ['Zone 2: Fat Burn', '60% – 70%', 'Conversational jog', 'Builds endurance base & burns fat'],
          ['Zone 3: Aerobic', '70% – 80%', 'Steady running', 'Strengthens heart muscle & lungs'],
          ['Zone 4: Hard Effort', '80% – 90%', 'Fast tempo pace', 'Elevates speed & anaerobic threshold'],
          ['Zone 5: Maximum', '90% – 100%', 'All-out sprints', 'Develops peak power (short bursts)'],
        ],
      },
      'Heart Rate Recovery (HRR): Pay attention to how fast your heart rate drops in the first 1 to 2 minutes after you stop moving. A healthy heart rate drops by at least 12 to 20 beats in the first minute post-exercise. The faster your pulse drops back toward baseline, the fitter and more resilient your heart is.',
    ],
  },
  {
    id: 'sleep',
    title: 'Sleep and Heart Health',
    category: 'Lifestyle',
    description:
      'Explore how deep sleep provides a nocturnal dip that rests your cardiovascular system and repairs blood vessels.',
    readTime: '5 min read',
    image:
      'https://images.unsplash.com/photo-1511295742362-92c96b1cf484?auto=format&fit=crop&w=900&q=85',
    content: [
      'Sleep isn\'t passive downtime; it is an active recovery window essential for long-term heart health. As you sleep, your body shifts through different stages, including deep sleep (slow-wave sleep) and REM (dreaming) sleep.',
      'During deep sleep, your body shifts tone from the alert "fight or flight" system to the relaxing parasympathetic system. This triggers a beneficial physiological process known as nocturnal dipping:',
      {
        type: 'list',
        items: [
          'What is Nocturnal Dipping? During a restful night, your resting heart rate drops to its lowest daily point, and your blood pressure decreases by 10% to 20%. This dip gives your arterial walls a rest, lowers the workload on your cardiac muscles, and lowers systemic inflammation.',
          'The Danger of Sleep Loss: If you only get 4 to 5 hours of sleep, or if your sleep is fragmented by noise, alcohol, late meals, or sleep apnea, your body misses out on deep sleep. Your heart stays on high alert all night.',
          'The Long-Term Impact: Chronically missing out on nocturnal dipping keeps stress hormones elevated during the day, which is linked to higher long-term risks for elevated blood pressure, arterial stiffness, daytime fatigue, and weaker metabolic recovery.',
        ],
      },
    ],
  },
  {
    id: 'stress',
    title: 'Stress and Your Heart',
    category: 'Wellness',
    description:
      'Understand the fight-or-flight mechanism, adrenaline release, and how Heart Rate Variability (HRV) measures recovery.',
    readTime: '5 min read',
    image:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=85',
    content: [
      'Whether you are dodging a close call on the highway, preparing for a nerve-wracking presentation, or arguing with a friend, your brain processes stress the same way: as a threat to your safety. This triggers your body’s built-in "fight or flight" response via the sympathetic nervous system.',
      'Your adrenal glands release a burst of stress hormones—primarily adrenaline and cortisol. This causes an immediate cardiac reaction: your heart rate speeds up, your blood pressure rises, and your blood vessels direct oxygen straight to your major muscle groups so you can react quickly.',
      'While short bursts of stress are normal and harmless, chronic daily stress keeps this alarm system active continuously without letting your body reset.',
      'Understanding Heart Rate Variability (HRV): HRV is one of the best metrics for measuring how stress impacts your body. It looks at the tiny millisecond differences in time between individual heartbeats (for example, 0.95 seconds between beat one and two, and 1.05 seconds between beat two and three).',
      {
        type: 'list',
        items: [
          'High HRV (Good): Means your heart is adaptable, resting well, and your parasympathetic "brake pedal" is working smoothly.',
          'Low HRV (Signal of Stress): Means your sympathetic "gas pedal" is stuck on, indicating your body is under physical, mental, or emotional strain and needs rest.',
        ],
      },
    ],
  },
  {
    id: 'abnormal-heart-rate',
    title: 'Recognizing Abnormal Heart Rates',
    category: 'Heart Health',
    description:
      'Learn how to identify unusually fast pulses, low heart rates, skipped beats, and when to seek medical advice.',
    readTime: '6 min read',
    image:
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=900&q=85',
    content: [
      'Your pulse naturally speeds up when you run, get excited, or drink coffee, and it drops when you relax or sleep. However, consistent deviations outside standard ranges can signal that your body needs attention:',
      {
        type: 'list',
        items: [
          'Tachycardia (Resting HR > 100 BPM): A high heart rate while sitting completely relaxed. While often caused by high fever, severe dehydration, anxiety, or too much caffeine, a high resting rate that persists without an obvious cause warrants checking out.',
          'Bradycardia (Resting HR < 60 BPM): A low heart rate. While normal and healthy for trained endurance athletes, for non-athletes a consistently low heart rate accompanied by fatigue, lightheadedness, or brain fog can mean blood isn\'t moving quickly enough to supply the brain.',
          'Irregular Rhythm & Ectopic Beats: Feeling like your heart suddenly "skipped a beat," fluttered, or delivered a heavy thud in your chest. Occasional flutters are common and usually benign, but frequent or sustained irregular rhythms should be evaluated by a healthcare professional.',
          'Low Blood Oxygen Warning: An SpO₂ reading that stays consistently below 95%, especially when paired with shortness of breath, chest tightness, or dizziness.',
        ],
      },
    ],
  },
  {
    id: 'faq',
    title: 'Frequently Asked Questions',
    category: 'PulseGrid Guide',
    description:
      'Everyday answers to popular questions about pulse readings, smartwatch PPG sensors, HRV, and deep breathing.',
    readTime: '6 min read',
    image:
      'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=900&q=85',
    content: [
      {
        type: 'faq',
        question: 'What is a normal resting heart rate, and when should I measure it?',
        answer:
          'For most adults, 60 to 100 BPM is normal, while trained athletes often range between 40 and 60 BPM. The most accurate time to measure your true baseline is immediately after waking up naturally in the morning, while still lying relaxed in bed before drinking coffee or moving around.',
      },
      {
        type: 'faq',
        question: 'How do smartwatches and wearables read my pulse through my skin?',
        answer:
          'They use photoplethysmography (PPG) technology. Green LED lights shine onto your skin, and photodiodes measure the light reflected back. Because blood absorbs green light, every time your heart contracts and pushes blood through your wrist, light absorption increases. The sensor detects these rhythmic pulses to calculate your BPM.',
      },
      {
        type: 'faq',
        question: 'Why does my optical heart rate monitor sometimes give weird or erratic readings?',
        answer:
          'Optical PPG sensors need clean skin contact and steady blood flow to read accurately. Loose wrist straps, excessive sweat, cold ambient temperatures (which reduce surface blood flow to your skin), heavy wrist motion during exercises like weightlifting, or placing the watch over tattoos can temporarily disrupt readings.',
      },
      {
        type: 'faq',
        question: 'What is the difference between Heart Rate (BPM) and Heart Rate Variability (HRV)?',
        answer:
          'Heart rate tells you the average speed of your heart (how many beats occurred in 60 seconds). HRV measures the microsecond variations between individual consecutive beats. Heart rate measures effort, while HRV measures nervous system recovery and stress.',
      },
      {
        type: 'faq',
        question: 'Why does my heart rate slow down when I breathe out deeply?',
        answer:
          'This is a natural biological reaction called Respiratory Sinus Arrhythmia (RSA). When you inhale, your heart speeds up slightly to move fresh oxygen. When you exhale deeply, your brain signals your vagus nerve to slow your heart rate down. Taking slow, deep exhales is one of the fastest ways to consciously calm down a racing heart.',
      },
    ],
  },
]

const featuredArticle = {
  id: 'heart-rate',
  title: 'Understanding Heart Rate',
  category: 'Featured Article',
  description:
    'Learn what resting heart rate means, why stroke volume matters, how baseline trends fluctuate, and how to spot changes in physical recovery.',
  readTime: '6 min read',
  image: '/1000300240.png',
  content: [
    'Your heart rate is simply the number of times your heart beats in one minute, measured in Beats Per Minute (BPM). Think of your heart as an engine: even when your car is parked at a red light, the engine is running. That baseline idle speed is your resting heart rate (RHR).',
    'For most adults, a typical resting heart rate falls between 60 and 100 BPM. However, if you exercise regularly, your resting rate might be lower—sometimes between 40 and 60 BPM. This happens because physical training strengthens your heart muscle, allowing it to pump a larger volume of blood with every single squeeze (this is called stroke volume). A stronger heart doesn\'t need to work as hard or beat as often to supply your body with the blood it needs.',
    'Your heart rate is dynamic and constantly adapts to what is happening around you. It naturally speeds up when you walk upstairs, get excited, drink a cup of coffee, or feel stressed. It slows down when you relax, meditate, or sleep.',
    'Why tracking trends matters:',
    {
      type: 'list',
      items: [
        'A single high reading isn\'t a reason to panic.',
        'If your resting heart rate is usually 65 BPM and suddenly jumps to 78 BPM for three days in a row, your body is dropping a hint.',
        'It often means you are under-recovered, dehydrated, dealing with hidden stress, or your immune system is fighting off a cold before you even feel the symptoms.',
      ],
    },
  ],
}

function Learn() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedArticle, setSelectedArticle] = useState(null)

  const filteredArticles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    if (!query) {
      return articles
    }

    return articles.filter((article) => {
      return (
        article.title.toLowerCase().includes(query) ||
        article.description.toLowerCase().includes(query) ||
        article.category.toLowerCase().includes(query)
      )
    })
  }, [searchQuery])

  useEffect(() => {
    if (!selectedArticle) {
      document.body.style.overflow = ''
      return undefined
    }

    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setSelectedArticle(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedArticle])

  const openArticle = (article) => {
    setSelectedArticle(article)
  }

  return (
    <div className="relative min-h-screen bg-[#020308] text-white">
      {/* Full Page Ambient Neon Glows (Cyan / Purple / Blue) */}
      <div className="pointer-events-none absolute -left-40 top-0 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-[#00c8ff]/15 via-[#7b4dff]/15 to-transparent blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-[700px] w-[700px] rounded-full bg-gradient-to-tl from-[#7b4dff]/15 via-[#ff3cac]/10 to-[#00c8ff]/10 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-[500px] w-[500px] rounded-full bg-[#00c8ff]/10 blur-[130px]" />

      <div className="relative z-10 flex min-h-screen">
        <Sidebar activePage="learn" />

        <main className="min-w-0 flex-1 px-5 py-5 sm:px-7 lg:px-8">
          {/* HEADER */}

          <header className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h1 className="pg-heading text-3xl font-bold tracking-tight text-[#b0cffe]">
                Learn
              </h1>

              <p className="mt-1 text-sm text-[#b0cffe]">
                Discover insights about your heart health
              </p>
            </div>

            <div className="relative w-full xl:w-[330px]">
              <FiSearch
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#687187]"
                size={17}
              />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search articles..."
                className="h-11 w-full rounded-xl border border-white/10 bg-[#080b14]/80 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-[#687187] focus:border-[#00c8ff]/40 focus:ring-2 focus:ring-[#00c8ff]/10"
                aria-label="Search articles"
              />
            </div>
          </header>

          {/* FEATURED ARTICLE (REBALANCED GRID WIDTHS) */}

          <section className="relative overflow-hidden rounded-2xl border border-[#1b3046] bg-[radial-gradient(circle_at_20%_50%,rgba(0,200,255,0.15),transparent_40%),radial-gradient(circle_at_55%_50%,rgba(123,77,255,0.18),transparent_45%),#040a13] shadow-[0_0_50px_rgba(0,200,255,0.15)]">
            <div className="grid min-h-[380px] lg:grid-cols-[0.8fr_1.2fr]">
              <div className="relative flex items-center justify-center overflow-hidden p-6 sm:p-8 lg:p-10">
                {/* Neon Cyan / Purple backdrop for featured heart */}
                <div className="absolute h-80 w-[500px] rounded-full bg-gradient-to-r from-[#00c8ff]/25 via-[#7b4dff]/30 to-[#ff3cac]/20 opacity-[0.03] blur-3xl" />

                {/* Image container with increased vertical height aspect-[4/3] */}
                <div className="relative z-10 aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl border border-[#00c8ff]/30 bg-[#000000] shadow-[0_0_40px_rgba(0,200,255,0.3)]">
                  <img
                    src={featuredArticle.image}
                    alt="2D Educational Human Heart Anatomy Cross-Section"
                    className="h-full w-full object-contain p-2 opacity-95"
                  />
                </div>

                <div className="absolute inset-x-8 bottom-6 h-px bg-gradient-to-r from-transparent via-[#00c8ff]/80 to-transparent" />
              </div>

              <div className="flex flex-col justify-center border-t border-white/10 p-7 sm:p-10 lg:border-l lg:border-t-0">
                <span className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#ff3cac]">
                  {featuredArticle.category}
                </span>

                <h2 className="pg-heading max-w-xl text-3xl font-bold leading-tight text-[#38bdf8] sm:text-4xl">
                  {featuredArticle.title}
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-[#a9b1c7]">
                  {featuredArticle.description}
                </p>

                <div className="mt-5 flex items-center gap-4 text-xs text-[#687187]">
                  <span className="flex items-center gap-1.5">
                    <FiClock size={14} />
                    {featuredArticle.readTime}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <FiBookOpen size={14} />
                    Health education
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => openArticle(featuredArticle)}
                  className="mt-7 flex w-fit items-center gap-3 rounded-lg border border-[#a855f7] px-5 py-3 text-sm font-semibold text-[#d08aff] transition hover:bg-[#a855f7]/10 hover:shadow-[0_0_20px_rgba(168,85,247,0.25)]"
                >
                  Read Article
                  <FiArrowRight size={17} />
                </button>
              </div>
            </div>
          </section>

          {/* EXPLORE ARTICLES */}

          <section className="mt-8">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h2 className="pg-heading text-2xl font-bold text-white">
                  Explore Articles
                </h2>

                <p className="mt-1 text-xs text-[#687187]">
                  Practical information for understanding your measurements
                </p>
              </div>

              {searchQuery && (
                <span className="text-xs text-[#687187]">
                  {filteredArticles.length} result
                  {filteredArticles.length === 1 ? '' : 's'}
                </span>
              )}
            </div>

            {filteredArticles.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#080b14]/90 px-6 py-14 text-center backdrop-blur-md">
                <FiSearch className="mx-auto text-[#687187]" size={30} />

                <h3 className="mt-4 font-semibold text-white">
                  No articles found
                </h3>

                <p className="mt-2 text-sm text-[#687187]">
                  Try a different search term.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onOpen={() => openArticle(article)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* HEART TIP OF THE DAY (DYNAMIC ROTATION) */}

          <section className="relative mt-10 overflow-hidden rounded-2xl border border-[#a855f7]/30 bg-[radial-gradient(ellipse_at_top_left,rgba(168,85,247,0.12),transparent_60%),radial-gradient(ellipse_at_bottom_right,rgba(0,200,255,0.1),transparent_60%),#050814] p-7 sm:p-9 shadow-[0_0_25px_rgba(168,85,247,0.12)]">
            <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#a855f7]/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#c084fc]/20 bg-[#a855f7]/15 text-[#e9d5ff] shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                <FiZap size={30} />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#00c8ff] animate-ping" />
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[#00c8ff]">
                    Heart Tip of the Day
                  </p>
                </div>

                <p className="mt-2 text-base font-bold leading-7 text-white sm:text-lg">
                  {dailyHeartTips[getDailyTipIndex()]}
                </p>
              </div>

              <div className="hidden text-[#ff3cac]/30 sm:block">
                <FiHeart size={48} />
              </div>
            </div>
          </section>

          <div className="h-8" />
        </main>
      </div>

      {/* ARTICLE MODAL */}

      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  )
}

function ArticleCard({ article, onOpen }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-[#1a2c40] bg-[#050b14]/90 backdrop-blur-md transition duration-200 hover:-translate-y-0.5 hover:border-[#00c8ff]/30 hover:shadow-[0_12px_35px_rgba(0,200,255,0.15)]">
      <div className="relative h-44 overflow-hidden bg-[#080f1b]">
        <img
          src={article.image}
          alt=""
          className="h-full w-full object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-85"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#050b14] via-transparent to-transparent" />

        <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#a9b1c7] backdrop-blur-md">
          {article.category}
        </div>
      </div>

      <div className="p-5">
        <h3 className="pg-heading text-base font-bold text-white">
          {article.title}
        </h3>

        <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#8993a9]">
          {article.description}
        </p>

        <div className="mt-5 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[11px] text-[#687187]">
            <FiClock size={13} />
            {article.readTime}
          </span>

          <button
            type="button"
            onClick={onOpen}
            className="flex items-center gap-2 text-xs font-semibold text-[#8fcfff] transition hover:text-[#00c8ff]"
          >
            Read More
            <FiArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        </div>
      </div>
    </article>
  )
}

function ArticleModal({ article, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
      role="presentation"
    >
      <article className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#263a51] bg-[#050a13] shadow-[0_0_60px_rgba(0,200,255,0.25)]">
        <div className="relative h-48 shrink-0 overflow-hidden sm:h-56">
          <img
            src={article.image}
            alt=""
            className="h-full w-full object-cover opacity-55"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#050a13] via-[#050a13]/20 to-transparent" />

          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-md transition hover:bg-white/10"
            aria-label="Close article"
          >
            <FiX size={18} />
          </button>

          <div className="absolute bottom-5 left-6 right-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#00c8ff]">
              {article.category}
            </span>

            <h2 className="pg-heading mt-2 text-2xl font-bold text-white sm:text-3xl">
              {article.title}
            </h2>
          </div>
        </div>

        <div className="overflow-y-auto px-6 py-6 sm:px-8 sm:py-7">
          <div className="mb-6 flex flex-wrap items-center gap-4 text-xs text-[#687187]">
            <span className="flex items-center gap-1.5">
              <FiClock size={14} />
              {article.readTime}
            </span>

            <span className="flex items-center gap-1.5">
              <FiCheckCircle size={14} className="text-[#24e6a0]" />
              PulseGrid educational content
            </span>
          </div>

          <p className="mb-6 text-sm font-medium leading-7 text-[#c8cede]">
            {article.description}
          </p>

          <div className="space-y-5">
            {article.content.map((item, index) => {
              if (typeof item === 'string') {
                return (
                  <p
                    key={`${article.id}-${index}`}
                    className="text-sm leading-7 text-[#929caf]"
                  >
                    {item}
                  </p>
                )
              }

              if (item.type === 'list') {
                return (
                  <ul
                    key={`${article.id}-${index}`}
                    className="space-y-2.5 pl-4 text-sm leading-7 text-[#929caf]"
                  >
                    {item.items.map((bullet, i) => (
                      <li key={i} className="list-disc">
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )
              }

              if (item.type === 'table') {
                return (
                  <div
                    key={`${article.id}-${index}`}
                    className="my-4 overflow-x-auto rounded-xl border border-white/10 bg-[#080d19] p-3"
                  >
                    <table className="w-full text-left text-xs text-[#a9b1c7]">
                      <thead>
                        <tr className="border-b border-white/10 text-white">
                          {item.headers.map((h, i) => (
                            <th key={i} className="pb-3 pt-1 px-3 font-semibold">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {item.rows.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="py-2.5 px-3">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              }

              if (item.type === 'faq') {
                return (
                  <div
                    key={`${article.id}-${index}`}
                    className="rounded-xl border border-white/5 bg-[#080d1a] p-4"
                  >
                    <h4 className="text-sm font-semibold text-white">
                      {item.question}
                    </h4>
                    <p className="mt-2 text-xs leading-6 text-[#929caf]">
                      {item.answer}
                    </p>
                  </div>
                )
              }

              return null
            })}
          </div>

          <div className="mt-7 flex gap-3 rounded-xl border border-[#00c8ff]/10 bg-[#00c8ff]/5 p-4">
            <FiInfo className="mt-0.5 shrink-0 text-[#00c8ff]" size={18} />

            <p className="text-xs leading-6 text-[#8993a9]">
              PulseGrid provides health monitoring and educational information.
              The information presented here is not intended to replace
              professional medical advice, diagnosis, or treatment.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-2 mt-7 text-sm font-semibold text-[#8fcfff] transition hover:text-[#00c8ff]"
          >
            <FiChevronLeft size={17} />
            Back to articles
          </button>
        </div>
      </article>
    </div>
  )
}

export default Learn