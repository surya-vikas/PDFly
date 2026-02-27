function PolicyPage() {
  return (
    <section className="surface-panel page-enter mx-auto w-full max-w-5xl p-6 sm:p-8">
      <h1 className="text-2xl font-extrabold tracking-tight text-textPrimary">PDFly Policy</h1>
      <p className="mt-2 text-sm text-textSecondary">Effective Date: February 27, 2026</p>

      <div className="mt-6 space-y-6 text-sm leading-7 text-textSecondary">
        <section>
          <h2 className="text-base font-bold text-textPrimary">Local Browser Processing</h2>
          <p className="mt-2">
            PDFly processes files locally inside your browser. We do not upload your files to our servers
            for tool execution.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-textPrimary">Data Storage and Access</h2>
          <p className="mt-2">
            We do not store, transmit, or access your document content during normal tool usage.
            Your files remain on your device unless you explicitly choose to share them elsewhere.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-textPrimary">Security and Responsibility</h2>
          <p className="mt-2">
            PDFly is provided as-is. While we implement secure client-side processing patterns,
            users are responsible for keeping local devices and browsers secure.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-textPrimary">Service Disclaimer</h2>
          <p className="mt-2">
            PDFly does not guarantee uninterrupted availability, specific results, or data retention.
            Always keep original backups of important files before processing.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold text-textPrimary">Contact</h2>
          <p className="mt-2">
            For policy questions, contact: support@pdfly.app
          </p>
        </section>
      </div>
    </section>
  )
}

export default PolicyPage
