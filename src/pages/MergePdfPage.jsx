import { useState } from 'react'
import Spinner from '../components/Spinner'
import ToolPageLayout from '../components/ToolPageLayout'
import { downloadBlob } from '../utils/fileUtils'
import { mergePdfFiles } from '../utils/pdfUtils'

function MergePdfPage() {
  const [files, setFiles] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isMerging, setIsMerging] = useState(false)

  const formatFileSize = (sizeInBytes) => {
    if (sizeInBytes === 0) {
      return '0 B'
    }

    const units = ['B', 'KB', 'MB', 'GB']
    const unitIndex = Math.min(Math.floor(Math.log(sizeInBytes) / Math.log(1024)), units.length - 1)
    const sizeValue = sizeInBytes / 1024 ** unitIndex
    return `${sizeValue.toFixed(sizeValue >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
  }

  const moveFile = (fromIndex, toIndex) => {
    if (toIndex < 0 || toIndex >= files.length) {
      return
    }

    const nextFiles = [...files]
    const [movedFile] = nextFiles.splice(fromIndex, 1)
    nextFiles.splice(toIndex, 0, movedFile)
    setFiles(nextFiles)
  }

  const handleMerge = async () => {
    if (files.length < 2) {
      setErrorMessage('Please upload at least two PDF files.')
      return
    }

    try {
      setIsMerging(true)
      setErrorMessage('')
      const result = await mergePdfFiles(files, { fileName: 'merged.pdf' })
      downloadBlob(result.blob, result.fileName)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to merge PDF files.')
    } finally {
      setIsMerging(false)
    }
  }

  return (
    <ToolPageLayout
      title="Merge PDF"
      description="Combine multiple PDF files into one document instantly with client-side processing."
      uploadAreaProps={{
        title: 'Upload PDF Files',
        description: 'Drop at least two PDF files to merge in order.',
        accept: ['.pdf', 'application/pdf'],
        multiple: true,
        maxFileSizeMB: 50,
        files,
        onFilesChange: (nextFiles) => {
          setFiles(nextFiles)
          if (nextFiles.length > 1) {
            setErrorMessage('')
          }
        },
        errorMessage,
        onErrorChange: setErrorMessage,
      }}
    >
      {files.length > 1 ? (
        <section className="surface-soft p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[#f27f50]">Selected Order</h3>
          <p className="mt-1 text-xs text-textSecondary">
            Rearrange files before merging. The top file becomes the first pages in the output.
          </p>

          <ul className="mt-4 space-y-2">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${file.size}-${file.lastModified}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-borderColor bg-white px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-textPrimary">
                    {index + 1}. {file.name}
                  </p>
                  <p className="text-xs text-textSecondary">{formatFileSize(file.size)}</p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => moveFile(index, index - 1)}
                    disabled={index === 0 || isMerging}
                    className="secondary-action disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Move Up
                  </button>
                  <button
                    type="button"
                    onClick={() => moveFile(index, index + 1)}
                    disabled={index === files.length - 1 || isMerging}
                    className="secondary-action disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Move Down
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <button
        type="button"
        onClick={handleMerge}
        disabled={files.length < 2 || isMerging}
        className="gradient-action mt-4 inline-flex min-w-[180px] items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isMerging ? (
          <>
            <Spinner />
            Processing...
          </>
        ) : (
          'Merge & Download'
        )}
      </button>
    </ToolPageLayout>
  )
}

export default MergePdfPage
