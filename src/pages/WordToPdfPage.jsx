import { useState } from 'react'
import Spinner from '../components/Spinner'
import ToolPageLayout from '../components/ToolPageLayout'
import { downloadBlob } from '../utils/fileUtils'
import { convertWordToPdf } from '../utils/pdfUtils'

function WordToPdfPage() {
  const [files, setFiles] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isConverting, setIsConverting] = useState(false)

  const selectedFile = files[0] ?? null

  const handleConvert = async () => {
    if (!selectedFile) {
      setErrorMessage('Please upload one DOCX file.')
      return
    }

    try {
      setIsConverting(true)
      setErrorMessage('')

      const result = await convertWordToPdf(selectedFile, {
        fileName: 'converted.pdf',
      })

      downloadBlob(result.blob, result.fileName)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to convert Word to PDF.')
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <ToolPageLayout
      title="Word to PDF"
      description="Upload DOCX and convert extracted text into a PDF document directly in your browser."
      uploadAreaProps={{
        title: 'Upload DOCX',
        description: 'Drop one DOCX file for text-based conversion into PDF.',
        accept: ['.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        multiple: false,
        maxFileSizeMB: 50,
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
          This is a text-only conversion using Mammoth and jsPDF. Complex layout, tables, and images are not preserved.
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

export default WordToPdfPage
