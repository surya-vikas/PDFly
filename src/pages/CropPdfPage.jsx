import { useState } from 'react'
import Spinner from '../components/Spinner'
import ToolPageLayout from '../components/ToolPageLayout'
import { downloadBlob } from '../utils/fileUtils'
import { cropPdfPages } from '../utils/pdfUtils'

function CropPdfPage() {
  const [files, setFiles] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isCropping, setIsCropping] = useState(false)
  const [margins, setMargins] = useState({
    top: '12',
    bottom: '12',
    left: '12',
    right: '12',
  })

  const selectedFile = files[0] ?? null

  const updateMargin = (side, value) => {
    setMargins((current) => ({
      ...current,
      [side]: value,
    }))
  }

  const handleCrop = async () => {
    if (!selectedFile) {
      setErrorMessage('Please upload one PDF file.')
      return
    }

    const parsedMargins = {
      top: Math.max(0, Number(margins.top) || 0),
      bottom: Math.max(0, Number(margins.bottom) || 0),
      left: Math.max(0, Number(margins.left) || 0),
      right: Math.max(0, Number(margins.right) || 0),
    }

    try {
      setIsCropping(true)
      setErrorMessage('')

      const result = await cropPdfPages(selectedFile, {
        margins: parsedMargins,
        fileName: 'cropped.pdf',
      })

      downloadBlob(result.blob, result.fileName)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to crop PDF.')
    } finally {
      setIsCropping(false)
    }
  }

  return (
    <ToolPageLayout
      title="Crop PDF"
      description="Apply page crop margins to all PDF pages and export a cropped document."
      uploadAreaProps={{
        title: 'Upload PDF',
        description: 'Drop one PDF file and set crop margins for all pages.',
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
        <p className="text-xs font-semibold uppercase tracking-wide text-[#f27f50]">Crop Margins (points)</p>
        <p className="mt-1 text-xs text-textSecondary">Apply to all pages. 72 points = 1 inch.</p>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium text-textSecondary">
            Top
            <input
              type="number"
              min="0"
              value={margins.top}
              onChange={(event) => updateMargin('top', event.target.value)}
              className="field-input mt-1"
            />
          </label>
          <label className="text-xs font-medium text-textSecondary">
            Bottom
            <input
              type="number"
              min="0"
              value={margins.bottom}
              onChange={(event) => updateMargin('bottom', event.target.value)}
              className="field-input mt-1"
            />
          </label>
          <label className="text-xs font-medium text-textSecondary">
            Left
            <input
              type="number"
              min="0"
              value={margins.left}
              onChange={(event) => updateMargin('left', event.target.value)}
              className="field-input mt-1"
            />
          </label>
          <label className="text-xs font-medium text-textSecondary">
            Right
            <input
              type="number"
              min="0"
              value={margins.right}
              onChange={(event) => updateMargin('right', event.target.value)}
              className="field-input mt-1"
            />
          </label>
        </div>
      </section>

      <button
        type="button"
        onClick={handleCrop}
        disabled={!selectedFile || isCropping}
        className="gradient-action min-w-[190px] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isCropping ? (
          <>
            <Spinner />
            Processing...
          </>
        ) : (
          'Crop & Download'
        )}
      </button>
    </ToolPageLayout>
  )
}

export default CropPdfPage
