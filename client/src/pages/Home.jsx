import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { GridProductCard, SectionHeader, SkeletonCard } from '../components/UI'

// ── Constants ─────────────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    tag: 'New Collection · 2025',
    title: 'Eternal\nElegance',
    sub: 'Handcrafted 925 silver with timeless designs',
    img: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1600&auto=format&fit=crop&q=90',
    cat: 'Necklaces',
    cta: 'Shop Necklaces',
    light: true,
  },
  {
    tag: 'Bestseller',
    title: 'Golden\nMoments',
    sub: 'Rings that tell your love story',
    img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1600&auto=format&fit=crop&q=90',
    cat: 'Rings',
    cta: 'Shop Rings',
    light: true,
  },
  {
    tag: 'Fine Jewellery',
    title: 'Crafted\nWith Love',
    sub: 'Rose gold earrings for every occasion',
    img: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=1600&auto=format&fit=crop&q=90',
    cat: 'Earrings',
    cta: 'Shop Earrings',
    light: true,
  },
]

const CATEGORIES = [
  { label: 'Rings',     img: 'https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&auto=format&fit=crop&q=80' },
  { label: 'Necklaces', img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&auto=format&fit=crop&q=80' },
  { label: 'Earrings',  img: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=500&auto=format&fit=crop&q=80' },
  { label: 'Bracelets', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=500&auto=format&fit=crop&q=80' },
  { label: 'Pendants',  img: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=500&auto=format&fit=crop&q=80' },
]

const MATERIALS = [
  {
    label: 'Gold',
    sub: '18K & 22K',
    img: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=600&auto=format&fit=crop&q=80',
    filter: 'Gold',
  },
  {
    label: 'Silver',
    sub: '925 Sterling',
    img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&auto=format&fit=crop&q=80',
    filter: 'Silver',
  },
  {
    label: 'Platinum',
    sub: '950 Pure',
    img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80',
    filter: 'Platinum',
  },
  {
    label: 'Diamond',
    sub: 'IGI Certified',
    img: 'https://images.unsplash.com/photo-1603561596112-0a132b757442?w=600&auto=format&fit=crop&q=80',
    filter: 'Diamond',
  },
]

const TRUST_ITEMS = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
    label: 'BIS Hallmarked',
    desc: 'Government certified gold & silver purity on every piece',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/>
      </svg>
    ),
    label: 'IGI Certified',
    desc: 'International Gemological Institute certified diamonds',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
        <polyline points="17 6 23 6 23 12"/>
      </svg>
    ),
    label: '30-Day Returns',
    desc: 'Hassle-free returns & exchanges, no questions asked',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1"/>
        <path d="M16 8h4l3 3v5h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    label: 'Free Shipping',
    desc: 'Complimentary insured delivery on every order',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0110 0v4"/>
      </svg>
    ),
    label: 'Secure Payments',
    desc: 'Bank-grade 256-bit SSL encryption on all transactions',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    ),
    label: '24/7 Support',
    desc: 'Expert jewellery consultants available round the clock',
  },
]

const CERTIFICATIONS = [
  { name: 'BIS Hallmark',   detail: 'Bureau of Indian Standards',         color: '#1B5E20' },
  { name: 'IGI Certified',  detail: 'International Gemological Institute', color: '#4A148C' },
  { name: '18K / 22K Gold', detail: 'Tested & Verified Purity',            color: '#B8860B' },
  { name: '925 Silver',     detail: 'Sterling Silver Standard',            color: '#546E7A' },
]

// ── Countdown Timer ────────────────────────────────────────────────────────
function useCountdown(targetDate) {
  const calc = () => {
    const diff = new Date(targetDate) - Date.now()
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 }
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    }
  }
  const [time, setTime] = useState(calc)
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000)
    return () => clearInterval(id)
  }, [targetDate])
  return time
}

function CountdownBox({ value, label }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 52 }}>
      <div style={{
        background: '#fff',
        border: '1px solid #F48FB1',
        borderRadius: 4,
        padding: '8px 12px',
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 28,
        fontWeight: 700,
        color: '#C2185B',
        minWidth: 52,
        textAlign: 'center',
        lineHeight: 1,
      }}>
        {String(value).padStart(2, '0')}
      </div>
      <span style={{ fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', color: '#AD5070', fontWeight: 600 }}>{label}</span>
    </div>
  )
}

// ── Live Rates Ticker ────────────────────────────────────────────────────────
function LiveRatesTicker({ navigate }) {
  const [rates, setRates] = useState({ gold: 8940, silver: 97, platinum: 3050 }) // per gram INR
  const [live, setLive] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [fxRes, goldRes, silverRes, platRes] = await Promise.allSettled([
          fetch('https://open.er-api.com/v6/latest/USD'),
          fetch('https://api.gold-api.com/price/XAU'),
          fetch('https://api.gold-api.com/price/XAG'),
          fetch('https://api.gold-api.com/price/XPT'),
        ])
        const usdToInr = fxRes.status === 'fulfilled' ? ((await fxRes.value.json()).rates?.INR ?? 83.5) : 83.5
        const gUsd = goldRes.status === 'fulfilled'   ? ((await goldRes.value.json()).price ?? 3300) : 3300
        const sUsd = silverRes.status === 'fulfilled' ? ((await silverRes.value.json()).price ?? 33) : 33
        const pUsd = platRes.status === 'fulfilled'   ? ((await platRes.value.json()).price ?? 990) : 990
        const toINRperG = (usdOz) => (usdOz / 31.1035) * usdToInr
        setRates({ gold: toINRperG(gUsd), silver: toINRperG(sUsd), platinum: toINRperG(pUsd) })
        setLive(true)
      } catch { /* keep defaults */ }
    }
    load()
    const t = setInterval(load, 120000)
    return () => clearInterval(t)
  }, [])

  const fmt = n => `₹${Number(Math.round(n)).toLocaleString('en-IN')}`
  const items = [
    { label: 'Gold 24K / g',    value: fmt(rates.gold),     color: '#F59E0B' },
    { label: 'Silver / g',      value: fmt(rates.silver),   color: '#94A3B8' },
    { label: 'Platinum / g',    value: fmt(rates.platinum), color: '#A78BFA' },
  ]
  return (
    <div
      onClick={() => navigate('/metal-rates')}
      style={{
        background: '#FCE4EC', borderBottom: '1px solid #F48FB1',
        padding: '7px 5%', display: 'flex', alignItems: 'center',
        gap: 'clamp(12px,3vw,32px)', cursor: 'pointer', overflowX: 'auto',
        scrollbarWidth: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: live ? '#16A34A' : '#F59E0B',
          display: 'inline-block',
          boxShadow: `0 0 5px ${live ? '#16A34A' : '#F59E0B'}`,
        }} />
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#AD1457', opacity: .7 }}>
          {live ? 'Live' : 'Est.'} Rates
        </span>
      </div>
      {items.map(it => (
        <div key={it.label} style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
          <span style={{ fontSize: 10, letterSpacing: '.06em', textTransform: 'uppercase', color: '#AD1457', fontWeight: 600, opacity: .6 }}>{it.label}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#880E4F' }}>{it.value}</span>
        </div>
      ))}
      <div style={{ marginLeft: 'auto', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4, color: '#C2185B', fontSize: 10, opacity: .6 }}>
        View all
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { showToast } = useToast()

  const [slide, setSlide] = useState(0)
  const [products, setProducts] = useState([])
  const [trending, setTrending] = useState([])
  const [festive, setFestive] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [cmsConfig, setCmsConfig] = useState({
    newArrivalsCount: 8,
    trendingCount: 8,
    banners: HERO_SLIDES,
    sectionImages: [],
    marqueeItems: [],
    homeStats: [],
    commitmentText: null
  })
  const slideTimer = useRef(null)
  const activeBanners = useMemo(() => (cmsConfig.banners || HERO_SLIDES).filter(b => b.active !== false), [cmsConfig.banners])

  const festiveTarget = useMemo(() => {
    try {
      const stored = sessionStorage.getItem('adore_festive_target')
      if (stored) {
        const t = parseInt(stored)
        if (t > Date.now()) return new Date(t)
      }
    } catch {}
    const t = Date.now() + 3 * 86400000 + 8 * 3600000 + 22 * 60000
    try { sessionStorage.setItem('adore_festive_target', String(t)) } catch {}
    return new Date(t)
  }, [])
  const countdown = useCountdown(festiveTarget)

  const resetSlideTimer = useCallback(() => {
    clearInterval(slideTimer.current)
    slideTimer.current = setInterval(() => setSlide(s => (s + 1) % activeBanners.length), 5000)
  }, [])

  useEffect(() => {
    resetSlideTimer()
    return () => clearInterval(slideTimer.current)
  }, [resetSlideTimer])

  useEffect(() => {
    HERO_SLIDES.forEach(s => { const img = new Image(); img.src = s.img })
  }, [])

  useEffect(() => {
    try {
      const saved = localStorage.getItem('adore_cms_config')
      if (saved) {
        const p = JSON.parse(saved)
        setCmsConfig({
          newArrivalsCount: p.newArrivalsCount || 8,
          trendingCount: p.trendingCount || 8,
          banners: p.banners || HERO_SLIDES,
          sectionImages: p.sectionImages || [],
          marqueeItems: p.marqueeItems || [],
          homeStats: p.homeStats || [],
          commitmentText: p.commitmentText || null
        })
      }
    } catch {}
  }, [])

  useEffect(() => {
    Promise.all([
      api.get(`/products?limit=${cmsConfig.newArrivalsCount}&sort=createdAt&order=desc`),
      api.get(`/products?limit=${cmsConfig.trendingCount}&sort=rating&order=desc`),
      api.get('/products?limit=6&sort=price&order=desc'),
    ]).then(([n, t, f]) => {
      setProducts(n.data.products || [])
      setTrending(t.data.products || [])
      setFestive(f.data.products || [])
    }).catch(() => {}).finally(() => setLoading(false))

    if (user) {
      api.get('/wishlist').then(r => setWishlist((r.data || []).map(w => w.productId))).catch(() => {})
    }
  }, [user, cmsConfig])

  const handleSlide = (idx) => { setSlide(idx); resetSlideTimer() }
  const prevSlide = () => { setSlide(s => (s - 1 + activeBanners.length) % activeBanners.length); resetSlideTimer() }
  const nextSlide = () => { setSlide(s => (s + 1) % activeBanners.length); resetSlideTimer() }

  const handleCart = async (p) => {
    if (!user) { navigate('/login'); throw new Error('not_logged_in') }
    await addToCart(p.id)
    showToast(`${p.name} added to cart`)
  }

  const handleWishlist = async (p) => {
    if (!user) { navigate('/login'); return }
    try {
      await api.post('/wishlist/toggle', { productId: p.id })
      const inWl = wishlist.includes(p.id)
      setWishlist(prev => inWl ? prev.filter(id => id !== p.id) : [...prev, p.id])
      showToast(inWl ? 'Removed from wishlist' : 'Added to wishlist')
    } catch {}
  }

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email) return
    setSubscribed(true)
    showToast('Subscribed successfully!')
  }

  const s = activeBanners[slide] || activeBanners[0] || HERO_SLIDES[0]

  return (
    <div>
      {/* ── SEARCH + JEWELLERY TABS ──────────────────────────────────── */}
      <div style={{ background: '#fff', padding: '14px 5% 12px', borderBottom: '1px solid #FCE4EC' }}>
        {/* Search pill */}
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#bbb', pointerEvents: 'none' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <input
            type="text"
            placeholder='Search "Rings, Pendants, Bracelets..."'
            onFocus={() => navigate('/shop')}
            readOnly
            style={{
              width: '100%', padding: '11px 48px 11px 40px',
              border: '1.5px solid #F0B8CC', borderRadius: 24,
              fontSize: 14, color: '#C2185B', background: '#FFF8FB',
              outline: 'none', cursor: 'pointer', fontFamily: "'Jost', sans-serif",
              boxSizing: 'border-box', letterSpacing: '.01em',
            }}
          />
          <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#C2185B' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
        </div>
        {/* Category tabs — pill style like GIVA */}
        <div style={{ display: 'flex', gap: 8, borderRadius: 24, overflow: 'hidden', border: '1.5px solid #C2185B' }}>
          <button
            onClick={() => navigate('/shop?material=Silver')}
            style={{
              flex: 1, padding: '10px 8px', background: '#C2185B', color: '#fff',
              border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
              fontFamily: "'Jost', sans-serif", letterSpacing: '.02em',
              borderRight: '1px solid rgba(255,255,255,.25)',
              transition: 'background .2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#AD1457'}
            onMouseLeave={e => e.currentTarget.style.background = '#C2185B'}
          >
            Silver Jewellery 925
          </button>
          <button
            onClick={() => navigate('/shop?material=Silver+Coated')}
            style={{
              flex: 1, padding: '10px 8px', background: '#fff', color: '#C2185B',
              border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
              fontFamily: "'Jost', sans-serif", letterSpacing: '.02em',
              transition: 'background .2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FCE4EC' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
          >
            Silver Coated Jewellery 925
          </button>
        </div>
      </div>

      {/* ── 1. HERO SLIDER ─────────────────────────────────────────────── */}
      <section className="hero-section" style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg,#FFF0F5 0%,#FCE4EC 60%,#F8BBD0 100%)', height: 'clamp(420px, 75vw, 680px)' }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          {activeBanners.map((sl, i) => (
            <div key={i} style={{
              position: 'absolute', inset: 0,
              opacity: i === slide ? 1 : 0,
              transition: 'opacity .7s ease',
              pointerEvents: i === slide ? 'auto' : 'none',
            }}>
              <img
                src={sl.img} alt={sl.title}
                loading="eager"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=1600&auto=format&fit=crop&q=90' }}
              />
            </div>
          ))}
        </div>
        {/* Pink-tinted gradient overlay — left side for text readability */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(100deg, rgba(255,240,245,0.88) 0%, rgba(252,228,236,0.70) 40%, rgba(252,228,236,0) 72%)' }} />

        <div style={{
          position: 'relative', zIndex: 2, height: '100%',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '0 max(5%, 20px)',
        }}>
          <div key={slide} className="animate-fade-up" style={{ maxWidth: 480 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FCE4EC', border: '1px solid #F48FB1', borderRadius: 20, padding: '4px 14px', marginBottom: 16 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#C2185B', flexShrink: 0 }} />
              <span style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: '#880E4F', fontWeight: 700 }}>{s.tag}</span>
            </div>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(38px, 6vw, 72px)',
              fontWeight: 600, color: '#880E4F', lineHeight: 1.05,
              fontStyle: 'italic', whiteSpace: 'pre-line',
              marginBottom: 14,
              textShadow: '0 1px 2px rgba(255,255,255,.4)',
            }}>{s.title}</h1>
            <p style={{ fontSize: 14, color: '#AD1457', letterSpacing: '.02em', marginBottom: 28, lineHeight: 1.6, maxWidth: 340 }}>{s.sub}</p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button className="btn-pink" style={{ borderRadius: 6, padding: '13px 28px' }} onClick={() => navigate(`/shop?category=${s.cat}`)}>{s.cta}</button>
              <button
                onClick={() => navigate('/shop')}
                style={{
                  background: '#fff', color: '#C2185B',
                  border: '1.5px solid #F48FB1',
                  padding: '12px 24px', fontSize: 12, fontWeight: 700,
                  letterSpacing: '.08em', textTransform: 'uppercase',
                  cursor: 'pointer', borderRadius: 6, fontFamily: "'Jost', sans-serif",
                  transition: 'all .2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#FCE4EC'; e.currentTarget.style.borderColor = '#C2185B' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#F48FB1' }}
              >
                View All
              </button>
            </div>
          </div>
        </div>

        {[{ fn: prevSlide, dir: 'left', pts: '15 18 9 12 15 6' }, { fn: nextSlide, dir: 'right', pts: '9 18 15 12 9 6' }].map(({ fn, dir, pts }) => (
          <button
            key={dir}
            onClick={fn}
            style={{
              position: 'absolute', top: '50%', [dir]: 16,
              transform: 'translateY(-50%)',
              width: 38, height: 38, borderRadius: '50%',
              background: 'rgba(255,255,255,.80)', border: '1px solid #F48FB1',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#C2185B', backdropFilter: 'blur(4px)', zIndex: 3,
              transition: 'background .2s', boxShadow: '0 2px 10px rgba(194,24,91,.15)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#FCE4EC'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.80)'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points={pts} />
            </svg>
          </button>
        ))}

        <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8, zIndex: 3 }}>
          {activeBanners.map((_, i) => (
            <button
              key={i} onClick={() => handleSlide(i)}
              style={{
                width: slide === i ? 24 : 6, height: 6,
                borderRadius: 3, background: slide === i ? '#C2185B' : 'rgba(194,24,91,.25)',
                border: 'none', cursor: 'pointer', padding: 0,
                transition: 'all .3s',
              }}
            />
          ))}
        </div>
      </section>

      {/* Marquee removed */}

      {/* ── CUSTOMIZE NOW CTA ──────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg,#FFF0F5 0%,#FCE4EC 50%,#FFF0F5 100%)',
        padding: 'clamp(32px, 5vw, 56px) 5%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 14,
        position: 'relative',
        overflow: 'hidden',
        borderTop: '1px solid #F8BBD0',
        borderBottom: '1px solid #F8BBD0',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: .04, backgroundImage: 'radial-gradient(circle, #C2185B 1px, transparent 1px)', backgroundSize: '24px 24px', pointerEvents: 'none' }} />
        <span style={{ fontSize: 10, letterSpacing: '.22em', textTransform: 'uppercase', color: '#C2185B', fontWeight: 700, position: 'relative', zIndex: 1 }}>
          ✦ Bespoke Jewellery
        </span>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 600, color: '#880E4F', lineHeight: 1.1, margin: 0, position: 'relative', zIndex: 1 }}>
          Craft Your Own Piece
        </h2>
        <p style={{ fontSize: 14, color: '#AD1457', maxWidth: 400, lineHeight: 1.7, margin: 0, position: 'relative', zIndex: 1, opacity: .85 }}>
          Tell us your vision — we'll handcraft it in gold, silver, or platinum
        </p>
        <button className="btn-pink" onClick={() => navigate('/custom-jewellery')} style={{ marginTop: 8, position: 'relative', zIndex: 1, borderRadius: 6 }}>
          Customize Now →
        </button>
        <div style={{ height: 1, width: 60, background: '#F48FB1', marginTop: 8, position: 'relative', zIndex: 1 }} />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginTop: 8, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          {[{ val: '3–6 weeks', lbl: 'Delivery Time' }, { val: '100%', lbl: 'Certified' }, { val: '₹5k+', lbl: 'Starting Budget' }].map(st => (
            <div key={st.lbl} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 700, color: '#C2185B', marginBottom: 4 }}>{st.val}</div>
              <div style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: '#AD1457', fontWeight: 600, opacity: .7 }}>{st.lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. CATEGORIES ──────────────────────────────────────────────── */}
      <section style={{ background: '#FFF0F5', padding: 'clamp(40px,5vw,64px) 5%' }}>
        <SectionHeader title="Shop by Category" onViewAll={() => navigate('/shop')} />
        <div style={{ overflowX: 'auto', paddingBottom: 8, marginBottom: -8 }}>
          <div style={{ display: 'flex', gap: 24, padding: '4px 0' }}>
            {CATEGORIES.map(cat => (
              <div
                key={cat.label}
                onClick={() => navigate(`/shop?category=${cat.label}`)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }}
              >
                <div style={{
                  width: 'clamp(100px,12vw,140px)', height: 'clamp(100px,12vw,140px)',
                  borderRadius: '50%', overflow: 'hidden',
                  border: '2.5px solid #F48FB1',
                  background: '#FCE4EC', transition: 'border-color .2s, transform .2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#E91E8C'; e.currentTarget.style.transform = 'scale(1.05)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#F48FB1'; e.currentTarget.style.transform = 'scale(1)' }}
                >
                  <img src={cat.img} alt={cat.label} loading="lazy" crossOrigin="anonymous"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&auto=format&fit=crop&q=80' }}
                  />
                </div>
                <span style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', fontWeight: 700, color: '#880E4F', textAlign: 'center', maxWidth: 110 }}>{cat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHOP BY BUDGET ───────────────────────────────────────────── */}
      <section style={{ background: '#FFF5F8', padding: 'clamp(28px,4vw,48px) 5%' }}>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(22px,3vw,32px)', fontWeight: 600, color: '#880E4F', margin: 0 }}>
            Shubh Prices, Stunning Picks
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'Under', price: '₹999', min: 0, max: 999 },
            { label: '₹1,000 –', price: '₹1,999', min: 1000, max: 1999 },
            { label: '₹2,000 –', price: '₹4,999', min: 2000, max: 4999 },
            { label: '₹5,000 –', price: '₹9,999', min: 5000, max: 9999 },
          ].map(b => (
            <button key={b.price}
              onClick={() => navigate(`/shop?minPrice=${b.min}&maxPrice=${b.max}`)}
              style={{
                padding: '18px 12px', background: '#880E4F', color: '#fff',
                border: 'none', borderRadius: 10, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                fontFamily: "'Jost', sans-serif", transition: 'background .2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#C2185B'}
              onMouseLeave={e => e.currentTarget.style.background = '#880E4F'}
            >
              <span style={{ fontSize: 12, fontWeight: 600, opacity: .85, letterSpacing: '.06em' }}>{b.label}</span>
              <span style={{ fontSize: 22, fontWeight: 700 }}>{b.price}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── 4. FESTIVAL SALE ───────────────────────────────────────────── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 40%, #FCE4EC 100%)',
        padding: 'clamp(40px,5vw,64px) 5%',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: .06,
          backgroundImage: `repeating-linear-gradient(45deg, #FFB6C1 0, #FFB6C1 1px, transparent 0, transparent 50%)`,
          backgroundSize: '20px 20px',
        }} />
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,182,193,.08)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -40, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,105,180,.06)' }} />

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 20 }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '.22em', textTransform: 'uppercase', color: '#C2185B', fontWeight: 600, marginBottom: 10 }}>
                ✦ Limited Time Offer ✦
              </div>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 600, fontStyle: 'italic', color: '#880E4F', lineHeight: 1.1, marginBottom: 8 }}>
                Diwali Jewellery Sale
              </h2>
              <p style={{ fontSize: 13, color: '#AD5070', letterSpacing: '.03em' }}>Up to 20% off on premium collections</p>
            </div>

            <div>
              <div style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: '#AD5070', marginBottom: 10, textAlign: 'center' }}>Sale ends in</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <CountdownBox value={countdown.d} label="Days" />
                <span style={{ color: '#C2185B', fontSize: 24, fontWeight: 700, marginTop: 6, lineHeight: 1 }}>:</span>
                <CountdownBox value={countdown.h} label="Hours" />
                <span style={{ color: '#C2185B', fontSize: 24, fontWeight: 700, marginTop: 6, lineHeight: 1 }}>:</span>
                <CountdownBox value={countdown.m} label="Mins" />
                <span style={{ color: '#C2185B', fontSize: 24, fontWeight: 700, marginTop: 6, lineHeight: 1 }}>:</span>
                <CountdownBox value={countdown.s} label="Secs" />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
            {[{ code: 'ADORE10', off: '10% OFF', min: 'Min. ₹5,000' }, { code: 'WELCOME500', off: '₹500 OFF', min: 'Min. ₹3,000' }, { code: 'LUXURY20', off: '20% OFF', min: 'Min. ₹50,000' }].map(c => (
              <div key={c.code} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: '#fff',
                border: '1px dashed #F48FB1',
                borderRadius: 4, padding: '10px 16px',
              }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#C2185B', letterSpacing: '.04em' }}>{c.off}</div>
                  <div style={{ fontSize: 10, color: '#AD5070', letterSpacing: '.08em' }}>{c.min}</div>
                </div>
                <div style={{ width: 1, height: 32, background: '#F48FB1' }} />
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.14em', color: '#880E4F', fontFamily: 'monospace' }}>{c.code}</div>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="grid-2-col-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : festive.length > 0 ? (
            <div className="grid-2-col-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {festive.slice(0, 6).map(p => (
                <div key={p.id} onClick={() => navigate(`/product/${p.id}`)} style={{ background: 'rgba(255,255,255,.96)', borderRadius: 3, overflow: 'hidden', cursor: 'pointer' }}>
                  <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', background: '#FCE4EC' }}>
                    <img src={p.images?.[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" crossOrigin="anonymous" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&auto=format&fit=crop&q=80' }} />
                    <span className="badge-festive" style={{ position: 'absolute', top: 8, left: 8, background: '#C2185B', color: '#fff', fontSize: 9, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', padding: '3px 8px', borderRadius: 2 }}>Diwali Pick</span>
                  </div>
                  <div style={{ padding: '10px 12px 12px' }}>
                    <div style={{ fontSize: 11, color: '#C2185B', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 4 }}>{p.category}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
                      <span style={{ fontSize: 15, fontWeight: 700 }}>₹{Number(p.price).toLocaleString('en-IN')}</span>
                      {p.originalPrice && <span style={{ fontSize: 12, color: '#aaa', textDecoration: 'line-through' }}>₹{Number(p.originalPrice).toLocaleString('en-IN')}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={e => { e.stopPropagation(); handleCart(p) }}
                        style={{
                          flex: 1, padding: '9px 0',
                          background: 'transparent', color: '#C2185B',
                          border: '1.5px solid #C2185B', cursor: 'pointer', borderRadius: 2,
                          fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
                          fontFamily: "'Jost', sans-serif",
                        }}
                      >
                        + Cart
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); handleCart(p).then(() => navigate('/checkout')).catch(() => {}) }}
                        style={{
                          flex: 1, padding: '9px 0',
                          background: '#C2185B', color: '#fff',
                          border: '1.5px solid #C2185B', cursor: 'pointer', borderRadius: 2,
                          fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase',
                          fontFamily: "'Jost', sans-serif",
                        }}
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <button
              onClick={() => navigate('/shop')}
              style={{
                background: 'transparent', color: '#FFB6C1',
                border: '1.5px solid rgba(255,182,193,.5)',
                padding: '14px 40px', fontSize: 12, fontWeight: 700,
                letterSpacing: '.12em', textTransform: 'uppercase',
                cursor: 'pointer', borderRadius: 2, fontFamily: "'Jost', sans-serif",
                transition: 'all .2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,182,193,.1)'; e.currentTarget.style.borderColor = '#FFB6C1' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,182,193,.5)' }}
            >
              Shop All Festive Picks →
            </button>
          </div>
        </div>
      </section>

      {/* ── 3b. SHOP BY MATERIAL ──────────────────────────────────────── */}
      <section style={{ background: '#fff', padding: 'clamp(40px,5vw,64px) 5%' }}>
        <SectionHeader title="Shop by Material" subtitle="Find your metal" onViewAll={() => navigate('/shop')} />
        <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8, scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
          {MATERIALS.map(mat => (
            <div
              key={mat.label}
              onClick={() => navigate(`/shop?material=${mat.filter}`)}
              style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', cursor: 'pointer', height: 220, width: 'calc(50vw - 28px)', maxWidth: 220, minWidth: 160, flexShrink: 0, background: '#111', scrollSnapAlign: 'start' }}
              onMouseEnter={e => {
                const img = e.currentTarget.querySelector('img')
                if (img) { img.style.transform = 'scale(1.06)'; img.style.opacity = '.45' }
              }}
              onMouseLeave={e => {
                const img = e.currentTarget.querySelector('img')
                if (img) { img.style.transform = 'scale(1)'; img.style.opacity = '.6' }
              }}
            >
              <img
                src={mat.img} alt={mat.label}
                loading="lazy" crossOrigin="anonymous"
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .6, transition: 'transform .5s ease, opacity .3s' }}
                onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80' }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(136,14,79,.85) 0%, rgba(0,0,0,.08) 60%)',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                padding: '20px 18px',
              }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 600, fontStyle: 'italic', color: '#fff', lineHeight: 1.1, marginBottom: 4 }}>{mat.label}</div>
                <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: '#F8BBD0', fontWeight: 600, marginBottom: 12 }}>{mat.sub}</div>
                <span style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, color: '#FFB6C1', display: 'flex', alignItems: 'center', gap: 5 }}>
                  Shop Now
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. NEW ARRIVALS ─────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(40px,5vw,64px) 5%', background: '#FFF5F8' }}>
        <SectionHeader title="New Arrivals" subtitle="Just landed" onViewAll={() => navigate('/shop')} />
        {loading ? (
          <div className="grid-2-col-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid-2-col-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {products.map(p => (
              <GridProductCard
                key={p.id} product={p}
                onPress={() => navigate(`/product/${p.id}`)}
                onAddToCart={() => handleCart(p)}
                onBuyNow={() => { handleCart(p).then(() => navigate("/checkout")).catch(() => {}) }}
                onWishlist={() => handleWishlist(p)}
                wishlisted={wishlist.includes(p.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── 5b. SHOP BY GENDER ──────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(40px,5vw,64px) clamp(16px,5%,80px)', background: '#fff', overflowX: 'hidden' }}>
        <SectionHeader title="Shop by Style" subtitle="Curated for you" onViewAll={() => navigate('/shop')} />
        <div className="home-two-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[
            {
              label: 'For Her',
              sub: 'Rings, Necklaces, Earrings & more',
              img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80',
              filter: 'Women',
            },
            {
              label: 'For Him',
              sub: 'Chains, Bracelets, Rings & more',
              img: 'https://images.unsplash.com/photo-1603518418367-25a6ea43d00b?w=800&auto=format&fit=crop&q=80',
              filter: 'Men',
            },
          ].map(g => (
            <div key={g.label} onClick={() => navigate(`/shop?gender=${g.filter}`)}
              style={{ position: 'relative', borderRadius: 3, overflow: 'hidden', cursor: 'pointer',
                height: 'clamp(200px, 35vw, 420px)', background: '#111' }}>
              <img src={g.img} alt={g.label} loading="lazy" crossOrigin="anonymous"
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .65,
                  transition: 'transform .5s ease', display: 'block' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80' }}
              />
              <div style={{ position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(45,10,30,.85) 0%, transparent 55%)',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                padding: 'clamp(16px,3vw,32px)' }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(24px,3vw,38px)',
                  fontWeight: 600, fontStyle: 'italic', color: '#fff', marginBottom: 8 }}>{g.label}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', marginBottom: 16 }}>{g.sub}</div>
                <span className="btn-pink" style={{ alignSelf: 'flex-start', padding: '10px 24px', fontSize: 11 }}>
                  Explore →
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5c. SHOP BY BOND ────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(40px,5vw,64px) clamp(16px,5%,80px)', background: '#FFF0F5', overflowX: 'hidden' }}>
        <SectionHeader title="Shop by Bond" subtitle="Gifts that go beyond jewellery" onViewAll={() => navigate('/shop/bond/all')} />
        <div style={{ overflowX: 'auto', paddingBottom: 8, marginBottom: -8 }}>
          <div style={{ display: 'flex', gap: 16, width: 'max-content', padding: '4px 0' }}>
            {[
              { label: 'For Mother',     img: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400&auto=format&fit=crop&q=80', tag: 'mother' },
              { label: 'For Father',     img: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80', tag: 'father' },
              { label: 'For Wife',       img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400&auto=format&fit=crop&q=80', tag: 'wife' },
              { label: 'For Girlfriend', img: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80', tag: 'girlfriend' },
              { label: 'For Boyfriend',  img: 'https://images.unsplash.com/photo-1601455763557-db1bea8a9a5a?w=400&auto=format&fit=crop&q=80', tag: 'boyfriend' },
              { label: 'For Sister',     img: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&auto=format&fit=crop&q=80', tag: 'sister' },
              { label: 'For Brother',    img: 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=400&auto=format&fit=crop&q=80', tag: 'brother' },
              { label: 'For Son',        img: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400&auto=format&fit=crop&q=80', tag: 'son' },
              { label: 'For Daughter',   img: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80', tag: 'daughter' },
              { label: 'For Friend',     img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&auto=format&fit=crop&q=80', tag: 'friend' },
            ].map(b => (
              <div key={b.tag} onClick={() => navigate(`/shop/bond/${b.tag}`)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 }}>
                <div style={{
                  width: 'clamp(100px,12vw,140px)', height: 'clamp(100px,12vw,140px)',
                  borderRadius: '50%', overflow: 'hidden',
                  border: '2.5px solid #F48FB1',
                  background: '#FCE4EC', transition: 'border-color .2s, transform .2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#E91E8C'; e.currentTarget.style.transform = 'scale(1.05)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#F48FB1'; e.currentTarget.style.transform = 'scale(1)' }}
                >
                  <img src={b.img} alt={b.label} loading="lazy" crossOrigin="anonymous"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&auto=format&fit=crop&q=80' }}
                  />
                </div>
                <span style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', fontWeight: 700, color: '#880E4F', textAlign: 'center', maxWidth: 110 }}>{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. PROMO BANNER ─────────────────────────────────────────────── */}
      <section className="promo-banners" style={{ padding: '0 5% clamp(40px,5vw,64px)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[
          {
            img: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&auto=format&fit=crop&q=80',
            tag: 'New Brides', title: 'Bridal\nCollection',
            cta: 'Explore', cat: 'Necklaces',
          },
          {
            img: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&auto=format&fit=crop&q=80',
            tag: 'Best Seller', title: 'Solitaire\nRings',
            cta: 'Shop Now', cat: 'Rings',
          },
        ].map((b, i) => (
          <div
            key={i}
            onClick={() => navigate(`/shop?category=${b.cat}`)}
            style={{
              position: 'relative', overflow: 'hidden', cursor: 'pointer',
              borderRadius: 3, height: 'clamp(200px, 30vw, 340px)',
              background: '#111',
            }}
          >
            <img src={b.img} alt={b.title} loading="lazy" crossOrigin="anonymous"
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .6, transition: 'transform .5s ease, opacity .3s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.opacity = '.5' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '.6' }}
              onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(45,10,30,.78) 0%, transparent 60%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 28 }}>
              <div style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', color: '#F8BBD0', marginBottom: 8, fontWeight: 600 }}>{b.tag}</div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(22px, 3vw, 34px)', fontWeight: 600, fontStyle: 'italic', color: '#fff', whiteSpace: 'pre-line', lineHeight: 1.15, marginBottom: 16 }}>{b.title}</div>
              <span style={{ fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, color: '#F8BBD0', display: 'flex', alignItems: 'center', gap: 6 }}>
                {b.cta}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* ── 8. TRENDING NOW ─────────────────────────────────────────────── */}
      <section style={{ padding: '0 5% clamp(40px,5vw,64px)', background: '#FFF0F5' }}>
        <SectionHeader title="Trending Now" subtitle="Most loved" onViewAll={() => navigate('/shop?sort=rating')} />
        {loading ? (
          <div className="grid-2-col-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid-2-col-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {trending.map(p => (
              <GridProductCard
                key={p.id} product={p}
                onPress={() => navigate(`/product/${p.id}`)}
                onAddToCart={() => handleCart(p)}
                onBuyNow={() => { handleCart(p).then(() => navigate("/checkout")).catch(() => {}) }}
                onWishlist={() => handleWishlist(p)}
                wishlisted={wishlist.includes(p.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── 9. TRUST & CERTIFICATION ────────────────────────────────────── */}
      <section style={{ padding: 'clamp(40px,5vw,64px) 5%', borderTop: '1px solid rgba(194,24,91,.08)', background: '#FFF5F8' }}>
        <SectionHeader title="Certified & Trusted" subtitle="Our guarantees" centered />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 48 }}>
          {CERTIFICATIONS.map((cert, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '18px 20px',
              border: '1.5px solid',
              borderColor: cert.color + '30',
              borderRadius: 4,
              background: cert.color + '08',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                background: cert.color + '15',
                border: `1.5px solid ${cert.color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={cert.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <polyline points="9 12 11 14 15 10"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: cert.color, letterSpacing: '.02em', marginBottom: 3 }}>{cert.name}</div>
                <div style={{ fontSize: 11, color: '#888', lineHeight: 1.4 }}>{cert.detail}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="commitment-grid" style={{
          background: 'linear-gradient(135deg, #1A0010 0%, #2D0A1E 100%)',
          borderRadius: 4, padding: 'clamp(32px, 5vw, 56px)',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 32, alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: '#F8BBD0', marginBottom: 12, fontWeight: 600 }}>Our Commitment</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(24px, 3.5vw, 40px)', fontWeight: 600, color: '#fff', lineHeight: 1.2, marginBottom: 16, fontStyle: 'italic' }}>
              Every piece is tested,<br />certified & guaranteed
            </h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', lineHeight: 1.8, maxWidth: 380 }}>
              Each ADORE piece undergoes rigorous quality testing at government-approved labs. Our gold is BIS hallmarked, our diamonds are IGI/GIA certified, and every gemstone is lab-verified for authenticity.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { val: '100%', lbl: 'BIS Certified' },
              { val: '18K+', lbl: 'Gold Standard' },
              { val: '50,000+', lbl: 'Happy Customers' },
              { val: '5★', lbl: 'Avg Rating' },
            ].map((stat, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,.06)',
                border: '1px solid rgba(255,182,193,.15)',
                borderRadius: 4, padding: '20px 16px', textAlign: 'center',
              }}>
                <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: '#F8BBD0', marginBottom: 6 }}>{stat.val}</div>
                <div style={{ fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.45)', fontWeight: 600 }}>{stat.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9b. SHOP BY COLOR ───────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(40px,5vw,64px) 5%', background: '#FFF5F8' }}>
        <SectionHeader title="Shop by Color" subtitle="Find your shade" onViewAll={() => navigate('/shop')} />
        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8, marginBottom: -8 }}>
          {[
            { label: 'Yellow Gold', color: '#D4AF37', hex: 'Yellow Gold', img: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400&auto=format&fit=crop&q=80' },
            { label: 'Rose Gold',   color: '#B76E79', hex: 'Rose Gold',   img: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&auto=format&fit=crop&q=80' },
            { label: 'White Gold',  color: '#E8E8E8', hex: 'White Gold',  img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&auto=format&fit=crop&q=80' },
            { label: 'Silver',      color: '#C0C0C0', hex: 'Silver',      img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&auto=format&fit=crop&q=80' },
            { label: 'Diamond',     color: '#B9F2FF', hex: 'Diamond',     img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&auto=format&fit=crop&q=80' },
            { label: 'Ruby Red',    color: '#9B111E', hex: 'Ruby',        img: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&auto=format&fit=crop&q=80' },
            { label: 'Emerald',     color: '#50C878', hex: 'Emerald',     img: 'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=400&auto=format&fit=crop&q=80' },
            { label: 'Sapphire',    color: '#0F52BA', hex: 'Sapphire',    img: 'https://images.unsplash.com/photo-1603561596112-0a132b757442?w=400&auto=format&fit=crop&q=80' },
          ].map(c => (
            <div
              key={c.label}
              onClick={() => navigate(`/shop?color=${encodeURIComponent(c.hex)}`)}
              style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer', width: 90 }}
            >
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                overflow: 'hidden', position: 'relative',
                border: '3px solid transparent',
                boxShadow: '0 2px 12px rgba(0,0,0,.12)',
                transition: 'transform .25s, box-shadow .25s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = `0 4px 20px ${c.color}55` }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.12)' }}
              >
                <img src={c.img} alt={c.label} loading="lazy" crossOrigin="anonymous"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.currentTarget.onerror = null; e.currentTarget.style.display = 'none' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: c.color, opacity: 0.45, mixBlendMode: 'color' }} />
              </div>
              <span style={{ fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 700, color: '#880E4F', textAlign: 'center', lineHeight: 1.3 }}>{c.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 9c. RING SIZER CTA ──────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(32px,4vw,48px) 5%', background: '#FFF0F5', borderTop: '1px solid #F48FB1', borderBottom: '1px solid #F48FB1' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fff', border: '1.5px solid #F48FB1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>💍</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: '#880E4F' }}>Not sure about your ring size?</div>
              <div style={{ fontSize: 13, color: '#888', lineHeight: 1.5 }}>Use our free Ring Sizer tool — get your exact size in seconds.</div>
            </div>
          </div>
          <button className="btn-pink" onClick={() => navigate('/profile')} style={{ flexShrink: 0 }}>
            Open Ring Sizer →
          </button>
        </div>
      </section>

      {/* ── GIFTING SECTION TEASER ───────────────────────────────────────── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, #1A0010 0%, #2D0A1E 60%, #0D001A 100%)',
        padding: 'clamp(48px,6vw,80px) 0',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: .04, backgroundImage: 'radial-gradient(circle, #FFB6C1 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36, padding: '0 5%', position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: 11, letterSpacing: '.24em', textTransform: 'uppercase', color: '#F8BBD0', fontWeight: 700, marginBottom: 12, opacity: .8 }}>✦ Premium Gifting ✦</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px,4.5vw,52px)', fontWeight: 600, fontStyle: 'italic', color: '#fff', lineHeight: 1.1, marginBottom: 12 }}>
            Gift Something Unforgettable
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', maxWidth: 460, margin: '0 auto', lineHeight: 1.8 }}>
            Curated luxury gift sets — jewellery, flowers, chocolates & VIP packaging delivered with love.
          </p>
        </div>

        {/* Image Slider */}
        <div style={{ position: 'relative', overflow: 'hidden', marginBottom: 36 }}>
          <div style={{ display: 'flex', gap: 16, padding: '4px 5%', overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', scrollSnapType: 'x mandatory' }}>
            {[
              {
                img: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=700&auto=format&fit=crop&q=85',
                tag: 'Most Popular',
                title: 'VIP Gift Box',
                desc: 'Luxury velvet-lined keepsake with ribbon & authenticity card',
              },
              {
                img: 'https://images.unsplash.com/photo-1548532928-b34e3be62062?w=700&auto=format&fit=crop&q=85',
                tag: 'Most Romantic',
                title: 'Flowers & Chocolates',
                desc: 'Premium roses + Belgian chocolates with your jewellery piece',
              },
              {
                img: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=700&auto=format&fit=crop&q=85',
                tag: 'Premium',
                title: 'Complete Hamper',
                desc: 'Everything together — jewellery, box, flowers & surprise add-on',
              },
              {
                img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=700&auto=format&fit=crop&q=85',
                tag: 'Bestseller',
                title: 'Jewellery Gift Set',
                desc: 'Certified 925 silver pieces beautifully packed for gifting',
              },
              {
                img: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=700&auto=format&fit=crop&q=85',
                tag: 'Exclusive',
                title: 'Gold Jewellery Gifts',
                desc: 'BIS hallmarked gold pieces — the most timeless gift of all',
              },
            ].map((card, i) => (
              <div
                key={i}
                onClick={() => navigate('/gifting')}
                style={{
                  position: 'relative', flexShrink: 0, cursor: 'pointer',
                  width: 'clamp(260px, 38vw, 340px)', height: 420,
                  borderRadius: 12, overflow: 'hidden', background: '#111',
                  scrollSnapAlign: 'start',
                  transition: 'transform .3s',
                  border: '1px solid rgba(255,255,255,.08)',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <img
                  src={card.img} alt={card.title} loading="lazy" crossOrigin="anonymous"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .7, transition: 'transform .5s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=700&auto=format&fit=crop&q=80' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,0,26,.95) 0%, rgba(45,10,30,.4) 55%, transparent 100%)' }} />
                <div style={{ position: 'absolute', top: 14, left: 14, background: '#C2185B', color: '#fff', fontSize: 9, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: 20 }}>
                  {card.tag}
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 20px' }}>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 600, fontStyle: 'italic', color: '#fff', marginBottom: 6 }}>{card.title}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', lineHeight: 1.5, marginBottom: 14 }}>{card.desc}</div>
                  <span style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', fontWeight: 700, color: '#F8BBD0', display: 'flex', alignItems: 'center', gap: 5 }}>
                    Explore →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', padding: '0 5%', position: 'relative', zIndex: 2 }}>
          <button className="btn-pink" style={{ padding: '14px 40px', fontSize: 13, borderRadius: 6 }} onClick={() => navigate('/gifting')}>
            Explore All Gift Sets →
          </button>
          <button onClick={() => navigate('/gifting')} style={{ background: 'transparent', color: '#F8BBD0', border: '1.5px solid rgba(248,187,208,.3)', padding: '13px 32px', fontSize: 12, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: 6, fontFamily: "'Jost',sans-serif", transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,187,208,.08)'; e.currentTarget.style.borderColor = 'rgba(248,187,208,.6)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(248,187,208,.3)' }}
          >
            Custom Gift Piece
          </button>
        </div>
      </section>

      {/* ── ADORE PROMISE ────────────────────────────────────────────────── */}
      <section style={{ background: '#FFF0F5', padding: 'clamp(40px,5vw,64px) 5%' }}>
        <SectionHeader title="The ADORE Promise" subtitle="Why choose us" centered />
        <div className="home-trust" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 1, background: '#F48FB1',
          border: '1px solid #F48FB1',
        }}>
          {TRUST_ITEMS.map((item, i) => (
            <div key={i} style={{
              background: '#fff', padding: '28px 24px',
              display: 'flex', alignItems: 'flex-start', gap: 16,
              transition: 'background .2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#FFF0F5'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: '#FCE4EC', border: '1px solid #F48FB1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#C2185B', flexShrink: 0,
              }}>
                {item.icon}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#880E4F', marginBottom: 6, letterSpacing: '.02em' }}>{item.label}</div>
                <div style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 10. NEWSLETTER ──────────────────────────────────────────────── */}
      <section style={{
        background: '#1A0010', padding: 'clamp(48px,6vw,72px) 5%',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ fontSize: 11, letterSpacing: '.22em', textTransform: 'uppercase', color: '#E91E8C', fontWeight: 600, marginBottom: 14 }}>Stay in the loop</div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 600, fontStyle: 'italic', color: '#fff', lineHeight: 1.15, marginBottom: 12 }}>
            Exclusive offers &<br />new arrivals first
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', marginBottom: 28, lineHeight: 1.6 }}>
            Subscribe and get ₹500 off on your first order.
          </p>
          {subscribed ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: '#E91E8C', fontSize: 15 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              You're subscribed! Check your inbox for ₹500 off.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: 0, maxWidth: 440, margin: '0 auto', border: '1.5px solid rgba(255,255,255,.15)', borderRadius: 2, overflow: 'hidden' }}>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Your email address"
                style={{
                  flex: 1, padding: '14px 18px', background: 'rgba(255,255,255,.07)',
                  border: 'none', color: '#fff', fontSize: 14, outline: 'none',
                  fontFamily: "'Jost', sans-serif",
                }}
              />
              <button type="submit" className="btn-pink" style={{ borderRadius: 0, flexShrink: 0 }}>Subscribe</button>
            </form>
          )}
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,.25)', marginTop: 14, letterSpacing: '.04em' }}>No spam, unsubscribe anytime.</p>
        </div>
      </section>

      <style>{`
        .btn-pink {
          background: #C2185B;
          color: #fff;
          border: none;
          padding: 13px 28px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          cursor: pointer;
          border-radius: 6px;
          font-family: 'Jost', sans-serif;
          transition: background .2s, transform .15s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .btn-pink:hover { background: #AD1457; transform: translateY(-1px); }
        .btn-pink:active { transform: translateY(0); }
        @media (max-width: 600px) {
          .home-two-col { grid-template-columns: 1fr !important; }
          .promo-banners { grid-template-columns: 1fr !important; }
          .commitment-grid { grid-template-columns: 1fr !important; }
          .commitment-grid > div:last-child { grid-template-columns: 1fr 1fr !important; }
          .home-cats { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 380px) {
          .home-cats { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-up { animation: fadeUp .5s ease forwards; }
      `}</style>
    </div>
  )
}
