import { useState } from 'react'
import Spinner from '../components/Spinner'
import ToolPageLayout from '../components/ToolPageLayout'
import { downloadBlob } from '../utils/fileUtils'
import { lockPdf } from '../utils/pdfUtils'

function LockPdfPage() {
  const [files, setFiles] = useState([])
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isLocking, setIsLocking] = useState(false)

  const selectedFile = files[0] ?? null

  const handleLock = async () => {
    if (!selectedFile) {
      setErrorMessage('Please upload one PDF file.')
      return
    }

    if (!password.trim()) {
      setErrorMessage('Please enter a password.')
      return
    }

    try {
      setIsLocking(true)
      setErrorMessage('')

      const result = await lockPdf(selectedFile, {
        password,
        fileName: 'locked.pdf',
      })

      downloadBlob(result.blob, result.fileName)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to lock PDF.')
    } finally {
      setIsLocking(false)
    }
  }

  return (
    <ToolPageLayout
      title="Lock PDF"
      description="Add password protection to your PDF so only users with the password can open it."
      uploadAreaProps={{
        title: 'Upload PDF',
        description: 'Drop one PDF and set a password before downloading the protected file.',
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
        <label htmlFor="lock-password" className="block text-sm font-medium text-textPrimary">
          Password
        </label>
        <input
          id="lock-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter password"
          className="field-input mt-2"
        />
        <p className="mt-2 text-xs text-textSecondary">
          The same value is used as user and owner password with restricted modifying permissions.
        </p>
      </section>

      <button
        type="button"
        onClick={handleLock}
        disabled={!selectedFile || !password.trim() || isLocking}
        className="gradient-action min-w-[190px] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLocking ? (
          <>
            <Spinner />
            Processing...
          </>
        ) : (
          'Lock & Download'
        )}
      </button>
    </ToolPageLayout>
  )
}

export default LockPdfPage
