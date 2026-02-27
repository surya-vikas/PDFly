import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { TOOL_LINKS } from '../utils/routes'

const DRAWER_ICON_TONES = {
  '/merge-pdf': 'bg-[#fde7de] text-[#f66f43]',
  '/split-pdf': 'bg-[#fde7de] text-[#f66f43]',
  '/compress-pdf': 'bg-[#e7f5df] text-[#6baa59]',
  '/pdf-to-jpg': 'bg-[#f7efc6] text-[#d7b61f]',
  '/jpg-to-pdf': 'bg-[#f7efc6] text-[#d7b61f]',
  '/rotate-pdf': 'bg-[#efe3f3] text-[#b072aa]',
  '/rearrange-pdf': 'bg-[#e8ecf8] text-[#5d80c9]',
  '/pdf-to-word': 'bg-[#e8ecf8] text-[#5d80c9]',
  '/word-to-pdf': 'bg-[#e8ecf8] text-[#5d80c9]',
  '/lock-pdf': 'bg-[#e7f5df] text-[#6baa59]',
  '/unlock-pdf': 'bg-[#e7f5df] text-[#6baa59]',
  '/crop-pdf': 'bg-[#efe3f3] text-[#b072aa]',
}

function Navbar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const logoSrc = '/PDFLY.jpeg'

  const closeDrawer = () => setIsDrawerOpen(false)

  useEffect(() => {
    const { style } = document.body
    const previousOverflow = style.overflow
    style.overflow = isDrawerOpen ? 'hidden' : previousOverflow || ''

    return () => {
      style.overflow = previousOverflow
    }
  }, [isDrawerOpen])

  const drawerLinkStyles = ({ isActive }) =>
    `flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
      isActive
        ? 'border-[#22D3EE] bg-[#0F1B33] text-white'
        : 'border-[#1E293B] bg-[#0F172A] text-[#94A3B8] hover:border-[#22D3EE] hover:text-[#E2E8F0]'
    }`

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#1E293B] bg-[#0B1120]">
        <div className="mx-auto flex w-full max-w-[1580px] items-center justify-between px-5 py-2 sm:px-7 lg:px-10">
          <Link to="/" onClick={closeDrawer} className="inline-flex items-center">
            <img src={logoSrc} alt="PDFly logo" className="h-14 w-auto object-contain sm:h-16" />
          </Link>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-[#334155] bg-[#0F172A] px-3 py-1 text-[11px] font-semibold text-[#94A3B8] sm:inline-flex">
              Private Browser Processing
            </span>
            <button
              type="button"
              aria-label={isDrawerOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isDrawerOpen}
              onClick={() => setIsDrawerOpen((open) => !open)}
              className="inline-flex items-center gap-2 rounded-lg border border-[#334155] bg-[#0F172A] px-3 py-2 text-sm font-semibold text-[#E2E8F0] transition-colors hover:border-[#22D3EE] hover:text-[#22D3EE]"
            >
              {isDrawerOpen ? <X size={18} /> : <Menu size={18} />}
              <span className="hidden sm:inline">Menu</span>
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-50 transition-opacity duration-200 ${
          isDrawerOpen ? 'pointer-events-auto bg-black/45 opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeDrawer}
      />

      <aside
        className={`fixed left-0 top-0 z-[60] h-full w-[320px] max-w-[90vw] overflow-y-auto overscroll-contain border-r border-[#1E293B] bg-[#0B1120] p-4 shadow-xl transition-transform duration-200 ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-5 flex items-center justify-between">
          <img src={logoSrc} alt="PDFly logo" className="h-12 w-auto object-contain" />
          <button
            type="button"
            aria-label="Close menu"
            onClick={closeDrawer}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#334155] bg-[#0F172A] text-[#94A3B8] hover:border-[#22D3EE] hover:text-[#E2E8F0]"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mb-3 rounded-xl border border-[#1E293B] bg-[#0F172A] px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#94A3B8]">Navigation</p>
        </div>

        <nav className="space-y-2">
          <NavLink to="/" end onClick={closeDrawer} className={drawerLinkStyles}>
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#e8ecf8] text-[#5d80c9]">D</span>
            <span>Dashboard</span>
          </NavLink>
          {TOOL_LINKS.map((tool) => {
            const Icon = tool.icon
            const tone = DRAWER_ICON_TONES[tool.path] || 'bg-[#e8ecf8] text-[#5d80c9]'

            return (
              <NavLink key={tool.path} to={tool.path} onClick={closeDrawer} className={drawerLinkStyles}>
                <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md ${tone}`}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span>{tool.title}</span>
              </NavLink>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

export default Navbar
