import { useState } from 'react'
import Spinner from '../components/Spinner'
import ToolPageLayout from '../components/ToolPageLayout'
import { downloadBlob } from '../utils/fileUtils'
import { convertJpgToPdf } from '../utils/pdfUtils'

function JpgToPdfPage() {
  const [files, setFiles] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isConverting, setIsConverting] = useState(false)

  const handleConvert = async () => {
    if (files.length === 0) {
      setErrorMessage('Please upload at least one JPG image.')
      return
    }

    try {
      setIsConverting(true)
      setErrorMessage('')

      const result = await convertJpgToPdf(files, { fileName: 'converted.pdf' })
      downloadBlob(result.blob, result.fileName)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to convert JPG to PDF.')
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <ToolPageLayout
      title="JPG to PDF"
      description="Upload JPG images and convert them into a clean, shareable PDF in your browser."
      uploadAreaProps={{
        title: 'Select Images',
        description: 'Drop one or more JPG/JPEG files to convert into a single PDF.',
        accept: ['.jpg', '.jpeg', 'image/jpeg', 'image/jpg'],
        multiple: true,
        maxFileSizeMB: 15,
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
      <button
        type="button"
        onClick={handleConvert}
        disabled={files.length === 0 || isConverting}
        className="gradient-action inline-flex min-w-[180px] items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
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

export default JpgToPdfPage
