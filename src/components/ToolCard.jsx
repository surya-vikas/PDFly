import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const CARD_TONES = {
  '/merge-pdf': {
    badgeBg: 'bg-[#fde7de]',
    badgeText: 'text-[#f66f43]',
    glow: 'from-[#fff3ed]',
  },
  '/split-pdf': {
    badgeBg: 'bg-[#fde7de]',
    badgeText: 'text-[#f66f43]',
    glow: 'from-[#fff3ed]',
  },
  '/compress-pdf': {
    badgeBg: 'bg-[#e7f5df]',
    badgeText: 'text-[#6baa59]',
    glow: 'from-[#f2faee]',
  },
  '/pdf-to-jpg': {
    badgeBg: 'bg-[#f7efc6]',
    badgeText: 'text-[#d7b61f]',
    glow: 'from-[#fdf7de]',
  },
  '/jpg-to-pdf': {
    badgeBg: 'bg-[#f7efc6]',
    badgeText: 'text-[#d7b61f]',
    glow: 'from-[#fdf7de]',
  },
  '/rotate-pdf': {
    badgeBg: 'bg-[#efe3f3]',
    badgeText: 'text-[#b072aa]',
    glow: 'from-[#f7eff9]',
  },
  '/rearrange-pdf': {
    badgeBg: 'bg-[#e8ecf8]',
    badgeText: 'text-[#5d80c9]',
    glow: 'from-[#f4f6fc]',
  },
  '/pdf-to-word': {
    badgeBg: 'bg-[#e8ecf8]',
    badgeText: 'text-[#5d80c9]',
    glow: 'from-[#f4f6fc]',
  },
  '/word-to-pdf': {
    badgeBg: 'bg-[#e8ecf8]',
    badgeText: 'text-[#5d80c9]',
    glow: 'from-[#f4f6fc]',
  },
  '/lock-pdf': {
    badgeBg: 'bg-[#e7f5df]',
    badgeText: 'text-[#6baa59]',
    glow: 'from-[#f2faee]',
  },
  '/unlock-pdf': {
    badgeBg: 'bg-[#e7f5df]',
    badgeText: 'text-[#6baa59]',
    glow: 'from-[#f2faee]',
  },
  '/crop-pdf': {
    badgeBg: 'bg-[#efe3f3]',
    badgeText: 'text-[#b072aa]',
    glow: 'from-[#f7eff9]',
  },
}

function ToolCard({ title, description, icon: Icon, route }) {
  const tone = CARD_TONES[route] || {
    badgeBg: 'bg-[#e8ecf8]',
    badgeText: 'text-[#5d80c9]',
    glow: 'from-[#f4f6fc]',
  }

  return (
    <Link to={route} className="group block h-full page-enter">
      <article className="surface-panel relative h-full overflow-hidden p-6 transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_18px_34px_rgba(58,67,96,0.16)]">
        <div className={`pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b ${tone.glow} to-transparent`} />

        <div className="relative z-10">
          <div className="relative inline-flex">
            <span className={`absolute -left-3 -top-3 inline-flex h-7 w-7 items-center justify-center rounded-md ${tone.badgeBg} ${tone.badgeText}/70`}>
              <ArrowRight className="h-3.5 w-3.5 rotate-45" />
            </span>
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${tone.badgeBg} ${tone.badgeText}`}>
              {Icon ? <Icon className="h-5 w-5" /> : null}
            </span>
          </div>

          <h2 className="mt-7 text-2xl font-extrabold leading-tight tracking-[-0.02em] text-textPrimary md:text-[34px]">
            {title}
          </h2>
          <p className="mt-3 text-[15px] leading-7 text-textSecondary">{description}</p>

          <div className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-[#f27f50]">
            Open Tool
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </article>
    </Link>
  )
}

export default ToolCard
