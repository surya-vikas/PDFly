import { useState } from 'react'
import Spinner from '../components/Spinner'
import ToolPageLayout from '../components/ToolPageLayout'
import { downloadBlob } from '../utils/fileUtils'
import { splitPdfPages } from '../utils/pdfUtils'

function SplitPdfPage() {
  const [files, setFiles] = useState([])
  const [pageRangeInput, setPageRangeInput] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSplitting, setIsSplitting] = useState(false)

  const selectedFile = files[0] ?? null

  const handleSplit = async () => {
    if (!selectedFile) {
      setErrorMessage('Please upload one PDF file.')
      return
    }

    if (!pageRangeInput.trim()) {
      setErrorMessage('Please enter a page range (example: 1-3,5).')
      return
    }

    try {
      setIsSplitting(true)
      setErrorMessage('')

      const result = await splitPdfPages(selectedFile, {
        pageRange: pageRangeInput,
        fileName: 'split.pdf',
      })

      downloadBlob(result.blob, result.fileName)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to split PDF.')
    } finally {
      setIsSplitting(false)
    }
  }

  return (
    <ToolPageLayout
      title="Split PDF"
      description="Extract selected pages or split a large PDF into smaller files without uploading data."
      uploadAreaProps={{
        title: 'Upload PDF',
        description: 'Drop one PDF to split into selected page ranges.',
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
        <label htmlFor="page-range" className="block text-sm font-medium text-textPrimary">
          Page Range
        </label>
        <input
          id="page-range"
          type="text"
          value={pageRangeInput}
          onChange={(event) => setPageRangeInput(event.target.value)}
          placeholder="Example: 1-3,5,8-10"
          className="field-input mt-2"
        />
        <p className="mt-2 text-xs text-textSecondary">
          Use comma-separated ranges or page numbers. Example: 2-4,7,9-11
        </p>
      </section>

      <button
        type="button"
        onClick={handleSplit}
        disabled={!selectedFile || isSplitting}
        className="gradient-action mt-4 inline-flex min-w-[180px] items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSplitting ? (
          <>
            <Spinner />
            Processing...
          </>
        ) : (
          'Split & Download'
        )}
      </button>
    </ToolPageLayout>
  )
}

export default SplitPdfPage
