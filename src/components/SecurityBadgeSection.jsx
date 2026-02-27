import securityBadge from '../assets/security-badge.png'

function SecurityBadgeSection() {
  return (
    <section className="bg-[#E5E7EB] py-10 sm:py-12">
      <div className="mx-auto flex w-full max-w-[1580px] flex-col items-center px-5 text-center sm:px-7 lg:px-10">
        <img
          src={securityBadge}
          alt="Secure SSL Encryption badge"
          className="h-14 w-14 object-contain sm:h-16 sm:w-16"
        />
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-[#0F172A]">SECURE SSL ENCRYPTION</p>
        <p className="mt-2 max-w-2xl text-sm text-[#475569]">
          All files are processed securely inside your browser.
        </p>
      </div>
    </section>
  )
}

export default SecurityBadgeSection
