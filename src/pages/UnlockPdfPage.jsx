import { useState } from 'react'
import Spinner from '../components/Spinner'
import ToolPageLayout from '../components/ToolPageLayout'
import { downloadBlob } from '../utils/fileUtils'
import { unlockPdf } from '../utils/pdfUtils'

function UnlockPdfPage() {
  const [files, setFiles] = useState([])
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isUnlocking, setIsUnlocking] = useState(false)

  const selectedFile = files[0] ?? null

  const handleUnlock = async () => {
    if (!selectedFile) {
      setErrorMessage('Please upload one protected PDF file.')
      return
    }

    if (!password.trim()) {
      setErrorMessage('Please enter the PDF password.')
      return
    }

    try {
      setIsUnlocking(true)
      setErrorMessage('')

      const result = await unlockPdf(selectedFile, {
        password,
        fileName: 'unlocked.pdf',
      })

      downloadBlob(result.blob, result.fileName)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to unlock PDF.')
    } finally {
      setIsUnlocking(false)
    }
  }

  return (
    <ToolPageLayout
      title="Unlock PDF"
      description="Open a protected PDF with password and save a new unlocked copy."
      uploadAreaProps={{
        title: 'Upload Protected PDF',
        description: 'Drop one password-protected PDF, enter password, and download unlocked output.',
        accept: ['.pdf', 'application/pdf'],
        multiple: false,
        maxFileSizeMB: 80,
        files,
        onFilesChange: (nextFiles) => {
          setFiles(nextFiles)
          if (nextFiles.length > 0) {
            setErrorMessage('')
          }
        },
        errorMessage,
        onErrorChange: setErrorMessage,
      }}
    >
      <section className="surface-soft p-4">
        <label htmlFor="unlock-password" className="block text-sm font-medium text-textPrimary">
          Password
        </label>
        <input
          id="unlock-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter PDF password"
          className="field-input mt-2"
        />
        <p className="mt-2 text-xs text-textSecondary">
          Wrong password is detected and shown before creating the unlocked file.
        </p>
      </section>

      <button
        type="button"
        onClick={handleUnlock}
        disabled={!selectedFile || !password.trim() || isUnlocking}
        className="gradient-action min-w-[190px] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isUnlocking ? (
          <>
            <Spinner />
            Processing...
          </>
        ) : (
          'Unlock & Download'
        )}
      </button>
    </ToolPageLayout>
  )
}

export default UnlockPdfPage
