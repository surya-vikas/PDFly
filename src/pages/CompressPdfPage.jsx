import { useState } from 'react'
import Spinner from '../components/Spinner'
import ToolPageLayout from '../components/ToolPageLayout'
import { downloadBlob } from '../utils/fileUtils'
import { compressPdfFile } from '../utils/pdfUtils'

function CompressPdfPage() {
  const [files, setFiles] = useState([])
  const [qualityPercent, setQualityPercent] = useState(65)
  const [errorMessage, setErrorMessage] = useState('')
  const [isCompressing, setIsCompressing] = useState(false)

  const selectedFile = files[0] ?? null

  const handleCompress = async () => {
    if (!selectedFile) {
      setErrorMessage('Please upload one PDF file.')
      return
    }

    try {
      setIsCompressing(true)
      setErrorMessage('')

      const result = await compressPdfFile(selectedFile, {
        fileName: 'compressed.pdf',
        quality: qualityPercent / 100,
        scale: 1.25,
      })

      downloadBlob(result.blob, result.fileName)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to compress PDF.')
    } finally {
      setIsCompressing(false)
    }
  }

  return (
    <ToolPageLayout
      title="Compress PDF"
      description="Compress a PDF by rendering pages as optimized JPG images and rebuilding a smaller file."
      uploadAreaProps={{
        title: 'Upload PDF',
        description: 'Drop one PDF file and choose an output quality level.',
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor="quality-range" className="text-xs font-semibold uppercase tracking-wide text-[#f27f50]">
            Image Quality
          </label>
          <span className="text-sm text-textPrimary">{qualityPercent}%</span>
        </div>

        <input
          id="quality-range"
          type="range"
          min="30"
          max="90"
          step="5"
          value={qualityPercent}
          onChange={(event) => setQualityPercent(Number(event.target.value))}
          className="mt-3 w-full accent-accentCyan"
        />

        <p className="mt-2 text-xs text-textSecondary">
          Lower quality usually means smaller files. Recommended range: 55% to 75%.
        </p>
      </section>

      <button
        type="button"
        onClick={handleCompress}
        disabled={!selectedFile || isCompressing}
        className="gradient-action mt-4 inline-flex min-w-[190px] items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isCompressing ? (
          <>
            <Spinner />
            Processing...
          </>
        ) : (
          'Compress & Download'
        )}
      </button>
    </ToolPageLayout>
  )
}

export default CompressPdfPage
