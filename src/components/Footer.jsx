import { Link } from 'react-router-dom'

const footerLinkClass = 'text-sm text-[#94A3B8] transition-colors hover:text-[#22D3EE]'

function Footer() {
  return (
    <footer className="relative z-10 mt-8 bg-[#0B1120]">
      <div className="mx-auto w-full max-w-[1580px] px-5 pb-8 pt-14 sm:px-7 lg:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 xl:grid-cols-5">
          <section>
            <h3 className="text-base font-bold text-white">About Us</h3>
            <p className="mt-3 text-sm leading-7 text-[#94A3B8]">
              PDFly is a privacy-first online PDF toolkit built for students, professionals, and developers.
              All file processing happens locally in your browser without server uploads.
            </p>
          </section>

          <section>
            <h3 className="text-base font-bold text-white">Services</h3>
            <ul className="mt-3 space-y-2">
              <li><Link to="/jpg-to-pdf" className={footerLinkClass}>JPG to PDF</Link></li>
              <li><Link to="/merge-pdf" className={footerLinkClass}>Merge PDF</Link></li>
              <li><Link to="/split-pdf" className={footerLinkClass}>Split PDF</Link></li>
              <li><Link to="/compress-pdf" className={footerLinkClass}>Compress PDF</Link></li>
              <li><Link to="/pdf-to-word" className={footerLinkClass}>Convert PDF</Link></li>
              <li><Link to="/lock-pdf" className={footerLinkClass}>Secure PDF Tools</Link></li>
            </ul>
          </section>

          <section>
            <h3 className="text-base font-bold text-white">Contact Us</h3>
            <ul className="mt-3 space-y-2 text-sm text-[#94A3B8]">
              <li>Email: support@pdfly.app</li>
              <li>Location: India</li>
              <li>Response Time: Within 24 Hours</li>
            </ul>
          </section>

          <section>
            <h3 className="text-base font-bold text-white">Security</h3>
            <ul className="mt-3 space-y-2 text-sm text-[#94A3B8]">
              <li>100% Client-side Processing</li>
              <li>No File Storage</li>
              <li>No Data Tracking</li>
              <li>Encrypted Browser Processing</li>
            </ul>
          </section>

          <section>
            <h3 className="text-base font-bold text-white">Terms &amp; Conditions</h3>
            <p className="mt-3 text-sm leading-7 text-[#94A3B8]">
              By using PDFly, you agree that all file processing happens locally in your browser.
              We do not store, transmit, or access your files. PDFly is provided as-is without
              warranties of data retention.
            </p>
            <Link to="/policy" className={`${footerLinkClass} mt-3 inline-flex font-semibold`}>
              View Full Policy
            </Link>
          </section>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-[#22D3EE] to-transparent" />

      <div className="mx-auto flex w-full max-w-[1580px] flex-col gap-1 px-5 py-4 text-xs text-[#94A3B8] sm:flex-row sm:items-center sm:justify-between sm:px-7 lg:px-10">
        <p>&copy; 2026 PDFly. All rights reserved.</p>
        <p>Built with {'\u2764'} by Surya</p>
      </div>
    </footer>
  )
}

export default Footer
