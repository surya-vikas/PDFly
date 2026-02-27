import { useEffect, useState } from 'react'
import Spinner from '../components/Spinner'
import ToolPageLayout from '../components/ToolPageLayout'
import { convertPdfToImages } from '../utils/pdfUtils'

function PdfToJpgPage() {
  const [files, setFiles] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isConverting, setIsConverting] = useState(false)
  const [imageResults, setImageResults] = useState([])

  const selectedFile = files[0] ?? null

  useEffect(() => {
    return () => {
      imageResults.forEach((item) => URL.revokeObjectURL(item.url))
    }
  }, [imageResults])

  const downloadImage = (image) => {
    const link = document.createElement('a')
    link.href = image.url
    link.download = image.fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  const handleConvert = async () => {
    if (!selectedFile) {
      setErrorMessage('Please upload one PDF file.')
      return
    }

    try {
      setIsConverting(true)
      setErrorMessage('')
      setImageResults([])

      const baseName = selectedFile.name.replace(/\.pdf$/i, '') || 'page'
      const converted = await convertPdfToImages(selectedFile, {
        imageType: 'image/jpeg',
        quality: 0.92,
        scale: 2,
      })

      const nextResults = converted.map((item) => ({
        ...item,
        url: URL.createObjectURL(item.blob),
        fileName: `${baseName}-page-${item.pageNumber}.jpg`,
      }))

      setImageResults(nextResults)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to convert PDF to JPG.')
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <ToolPageLayout
      title="PDF to JPG"
      description="Convert PDF pages into JPG images with private in-browser rendering."
      uploadAreaProps={{
        title: 'Upload PDF',
        description: 'Drop one PDF file, render every page, and download JPG images individually.',
        accept: ['.pdf', 'application/pdf'],
        multiple: false,
        maxFileSizeMB: 80,
        files,
        onFilesChange: (nextFiles) => {
          setFiles(nextFiles)
          setImageResults([])
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
        disabled={!selectedFile || isConverting}
        className="gradient-action inline-flex min-w-[180px] items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isConverting ? (
          <>
            <Spinner />
            Processing...
          </>
        ) : (
          'Convert To JPG'
        )}
      </button>

      {imageResults.length > 0 ? (
        <section className="surface-soft mt-6 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[#f27f50]">JPG Results</h3>
          <p className="mt-1 text-xs text-textSecondary">
            Download each converted page individually.
          </p>

          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {imageResults.map((image) => (
              <li
                key={image.pageNumber}
                className="rounded-lg border border-borderColor bg-white p-3"
              >
                <div className="aspect-[4/5] overflow-hidden rounded-lg border border-borderColor bg-[#f7f8fb]">
                  <img
                    src={image.url}
                    alt={`Page ${image.pageNumber}`}
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  <p className="text-xs text-textSecondary">Page {image.pageNumber}</p>
                  <button
                    type="button"
                    onClick={() => downloadImage(image)}
                    className="secondary-action"
                  >
                    Download JPG
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </ToolPageLayout>
  )
}

export default PdfToJpgPage
