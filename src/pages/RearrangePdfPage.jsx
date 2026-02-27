import { useEffect, useMemo, useState } from 'react'
import Spinner from '../components/Spinner'
import ToolPageLayout from '../components/ToolPageLayout'
import { downloadBlob } from '../utils/fileUtils'
import { convertPdfToImages, rearrangePdfPages } from '../utils/pdfUtils'

function RearrangePdfPage() {
  const [files, setFiles] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isPreparing, setIsPreparing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [draggingPageId, setDraggingPageId] = useState(null)
  const [pageItems, setPageItems] = useState([])

  const selectedFile = files[0] ?? null

  useEffect(() => {
    return () => {
      pageItems.forEach((item) => URL.revokeObjectURL(item.url))
    }
  }, [pageItems])

  const hasThumbnails = pageItems.length > 0
  const pageOrderSummary = useMemo(
    () => pageItems.map((item, index) => `${index + 1}:P${item.pageNumber}`).join(' | '),
    [pageItems],
  )

  const movePageByIndex = (fromIndex, toIndex) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || toIndex >= pageItems.length) {
      return
    }

    setPageItems((currentItems) => {
      const nextItems = [...currentItems]
      const [moved] = nextItems.splice(fromIndex, 1)
      nextItems.splice(toIndex, 0, moved)
      return nextItems
    })
  }

  const handleGenerateThumbnails = async () => {
    if (!selectedFile) {
      setErrorMessage('Please upload one PDF file.')
      return
    }

    try {
      setIsPreparing(true)
      setErrorMessage('')
      setPageItems([])

      const thumbnails = await convertPdfToImages(selectedFile, {
        imageType: 'image/jpeg',
        quality: 0.8,
        scale: 0.38,
      })

      const nextPages = thumbnails.map((item) => ({
        id: item.pageNumber,
        pageNumber: item.pageNumber,
        width: item.width,
        height: item.height,
        url: URL.createObjectURL(item.blob),
      }))

      setPageItems(nextPages)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to generate page thumbnails.')
    } finally {
      setIsPreparing(false)
    }
  }

  const handleDownloadRearranged = async () => {
    if (!selectedFile) {
      setErrorMessage('Please upload one PDF file.')
      return
    }

    if (!hasThumbnails) {
      setErrorMessage('Generate page thumbnails before rearranging.')
      return
    }

    try {
      setIsSaving(true)
      setErrorMessage('')

      const orderedPages = pageItems.map((item) => item.pageNumber)
      const result = await rearrangePdfPages(selectedFile, orderedPages, { fileName: 'rearranged.pdf' })
      downloadBlob(result.blob, result.fileName)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to rebuild rearranged PDF.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ToolPageLayout
      title="Rearrange PDF"
      description="Upload one PDF, drag page thumbnails to reorder, and download a newly rearranged document."
      uploadAreaProps={{
        title: 'Upload PDF',
        description: 'Drop one PDF file to load page thumbnails for drag-and-drop ordering.',
        accept: ['.pdf', 'application/pdf'],
        multiple: false,
        maxFileSizeMB: 80,
        files,
        onFilesChange: (nextFiles) => {
          setFiles(nextFiles)
          setPageItems([])
          setDraggingPageId(null)
          if (nextFiles.length > 0) {
            setErrorMessage('')
          }
        },
        errorMessage,
        onErrorChange: setErrorMessage,
      }}
    >
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleGenerateThumbnails}
          disabled={!selectedFile || isPreparing}
          className="gradient-action min-w-[190px] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPreparing ? (
            <>
              <Spinner />
              Processing...
            </>
          ) : (
            'Generate Thumbnails'
          )}
        </button>

        <button
          type="button"
          onClick={handleDownloadRearranged}
          disabled={!selectedFile || !hasThumbnails || isSaving}
          className="gradient-action min-w-[190px] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? (
            <>
              <Spinner />
              Processing...
            </>
          ) : (
            'Rearrange & Download'
          )}
        </button>
      </div>

      {hasThumbnails ? (
        <section className="surface-soft p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#f27f50]">Page Order</p>
          <p className="mt-1 text-xs text-textSecondary">{pageOrderSummary}</p>

          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {pageItems.map((item, index) => (
              <li
                key={item.id}
                draggable
                onDragStart={() => setDraggingPageId(item.id)}
                onDragEnd={() => setDraggingPageId(null)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault()
                  if (draggingPageId == null) {
                    return
                  }

                  const fromIndex = pageItems.findIndex((page) => page.id === draggingPageId)
                  const toIndex = pageItems.findIndex((page) => page.id === item.id)
                  movePageByIndex(fromIndex, toIndex)
                  setDraggingPageId(null)
                }}
                className={`rounded-lg border bg-white p-2.5 transition-shadow ${
                  draggingPageId === item.id
                    ? 'border-[#f27f50] shadow-[0_10px_18px_rgba(242,127,80,0.2)]'
                    : 'border-borderColor hover:shadow-[0_8px_14px_rgba(58,67,96,0.08)]'
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-2 text-xs text-textSecondary">
                  <span className="rounded-full bg-[#f8f9fc] px-2 py-0.5 font-semibold text-textPrimary">#{index + 1}</span>
                  <span>Page {item.pageNumber}</span>
                </div>

                <div className="overflow-hidden rounded-md border border-borderColor bg-[#f8f9fc]">
                  <img src={item.url} alt={`PDF page ${item.pageNumber}`} className="h-40 w-full object-contain" />
                </div>

                <div className="mt-2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => movePageByIndex(index, index - 1)}
                    disabled={index === 0}
                    className="secondary-action flex-1 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Left
                  </button>
                  <button
                    type="button"
                    onClick={() => movePageByIndex(index, index + 1)}
                    disabled={index === pageItems.length - 1}
                    className="secondary-action flex-1 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Right
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

export default RearrangePdfPage
