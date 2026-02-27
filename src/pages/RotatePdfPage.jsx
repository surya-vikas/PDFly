import { useState } from 'react'
import Spinner from '../components/Spinner'
import ToolPageLayout from '../components/ToolPageLayout'
import { downloadBlob } from '../utils/fileUtils'
import { rotatePdfPages } from '../utils/pdfUtils'

function RotatePdfPage() {
  const rotationOptions = [90, 180, 270]
  const [files, setFiles] = useState([])
  const [selectedRotation, setSelectedRotation] = useState(90)
  const [errorMessage, setErrorMessage] = useState('')
  const [isRotating, setIsRotating] = useState(false)

  const selectedFile = files[0] ?? null

  const handleRotate = async () => {
    if (!selectedFile) {
      setErrorMessage('Please upload one PDF file.')
      return
    }

    try {
      setIsRotating(true)
      setErrorMessage('')

      const result = await rotatePdfPages(selectedFile, {
        rotation: selectedRotation,
        fileName: 'rotated.pdf',
      })

      downloadBlob(result.blob, result.fileName)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to rotate PDF.')
    } finally {
      setIsRotating(false)
    }
  }

  return (
    <ToolPageLayout
      title="Rotate PDF"
      description="Rotate all pages in your PDF and download the updated file instantly."
      uploadAreaProps={{
        title: 'Upload PDF',
        description: 'Drop a PDF and apply page rotation before downloading.',
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
        <h3 className="text-xs font-semibold uppercase tracking-wide text-[#f27f50]">Rotation Angle</h3>
        <p className="mt-1 text-xs text-textSecondary">
          Rotation is applied to all pages in the uploaded PDF.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {rotationOptions.map((angle) => (
            <button
              key={angle}
              type="button"
              onClick={() => setSelectedRotation(angle)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                selectedRotation === angle
                  ? 'border-[#f27f50] bg-[#fff3ed] text-textPrimary'
                  : 'border-borderColor bg-white text-textSecondary hover:border-[#f27f50]/70 hover:text-textPrimary'
              }`}
            >
              {angle} deg
            </button>
          ))}
        </div>
      </section>

      <button
        type="button"
        onClick={handleRotate}
        disabled={!selectedFile || isRotating}
        className="gradient-action mt-4 inline-flex min-w-[180px] items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isRotating ? (
          <>
            <Spinner />
            Processing...
          </>
        ) : (
          'Rotate & Download'
        )}
      </button>
    </ToolPageLayout>
  )
}

export default RotatePdfPage
