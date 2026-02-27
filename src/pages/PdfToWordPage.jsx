import { useState } from 'react'
import Spinner from '../components/Spinner'
import ToolPageLayout from '../components/ToolPageLayout'
import { downloadBlob } from '../utils/fileUtils'
import { convertPdfToWord } from '../utils/pdfUtils'

function PdfToWordPage() {
  const [files, setFiles] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isConverting, setIsConverting] = useState(false)

  const selectedFile = files[0] ?? null

  const handleConvert = async () => {
    if (!selectedFile) {
      setErrorMessage('Please upload one PDF file.')
      return
    }

    try {
      setIsConverting(true)
      setErrorMessage('')

      const result = await convertPdfToWord(selectedFile, {
        fileName: 'converted.docx',
      })

      downloadBlob(result.blob, result.fileName)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to convert PDF to Word.')
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <ToolPageLayout
      title="PDF to Word"
      description="Client-side text extraction only. Layout-heavy PDFs may lose formatting in the generated DOCX."
      uploadAreaProps={{
        title: 'Upload PDF',
        description: 'Drop one PDF to extract text and build a simple DOCX document.',
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
        <p className="text-xs font-semibold uppercase tracking-wide text-[#f27f50]">Conversion Mode</p>
        <p className="mt-1 text-sm text-textSecondary">
          This browser-only converter extracts readable text content and writes it to DOCX.
          Tables, images, and exact layout are not preserved in this mode.
        </p>
      </section>

      <button
        type="button"
        onClick={handleConvert}
        disabled={!selectedFile || isConverting}
        className="gradient-action min-w-[190px] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isConverting ? (
          <>
            <Spinner />
            Processing...
          </>
        ) : (
          'Convert & Download'
        )}
      </button>
    </ToolPageLayout>
  )
}

export default PdfToWordPage
