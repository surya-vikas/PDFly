import { Link } from 'react-router-dom'
import UploadArea from './UploadArea'

function ToolPageLayout({ title, description, uploadAreaProps, children }) {
  return (
    <section className="surface-panel page-enter mx-auto w-full max-w-5xl overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-[#f66f43] via-[#f9b24f] to-[#6baa59]" />
      <div className="border-b border-borderColor bg-[#f8f9fc] px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#f27f50]">PDF Tool</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-textPrimary">{title}</h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-full border border-[#e6eaef] bg-white px-3 py-1 text-[11px] font-semibold text-textSecondary">
              Browser Only
            </span>
            <Link to="/" className="secondary-action">
              Back To Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <p className="text-sm leading-7 text-textSecondary">{description}</p>
        {uploadAreaProps ? <UploadArea className="mt-0" {...uploadAreaProps} /> : null}
        {children ? <div className="space-y-4">{children}</div> : null}
      </div>
    </section>
  )
}

export default ToolPageLayout
