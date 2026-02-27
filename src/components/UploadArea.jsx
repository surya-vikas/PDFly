import { AlertCircle, FileText, UploadCloud, X } from 'lucide-react'
import { useRef, useState } from 'react'

const PERFORMANCE_WARNING_LIMIT_BYTES = 50 * 1024 * 1024

function parseAcceptedTypes(accept) {
  if (Array.isArray(accept)) {
    return accept.map((rule) => rule.trim()).filter(Boolean)
  }

  if (typeof accept === 'string') {
    return accept
      .split(',')
      .map((rule) => rule.trim())
      .filter(Boolean)
  }

  return []
}

function isFileTypeAllowed(file, acceptedTypes) {
  if (acceptedTypes.length === 0) {
    return true
  }

  const fileName = file.name.toLowerCase()
  const fileType = (file.type || '').toLowerCase()

  return acceptedTypes.some((rule) => {
    const normalizedRule = rule.toLowerCase()

    if (normalizedRule.startsWith('.')) {
      return fileName.endsWith(normalizedRule)
    }

    if (normalizedRule.endsWith('/*')) {
      const typePrefix = normalizedRule.replace('*', '')
      return fileType.startsWith(typePrefix)
    }

    return fileType === normalizedRule
  })
}

function getFileId(file) {
  return `${file.name}-${file.size}-${file.lastModified}`
}

function formatFileSize(sizeInBytes) {
  if (sizeInBytes === 0) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB', 'GB']
  const unitIndex = Math.min(Math.floor(Math.log(sizeInBytes) / Math.log(1024)), units.length - 1)
  const sizeValue = sizeInBytes / 1024 ** unitIndex

  return `${sizeValue.toFixed(sizeValue >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
}

function UploadArea({
  title = 'Upload Files',
  description = 'Drag and drop files here, or click to browse.',
  accept = [],
  multiple = true,
  maxFileSizeMB,
  files,
  onFilesChange,
  errorMessage,
  onErrorChange,
  className = '',
}) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [internalFiles, setInternalFiles] = useState([])
  const [internalError, setInternalError] = useState('')

  const activeFiles = Array.isArray(files) ? files : internalFiles
  const activeError = typeof errorMessage === 'string' ? errorMessage : internalError
  const acceptedTypes = parseAcceptedTypes(accept)
  const acceptAttr = acceptedTypes.join(',')
  const maxSizeInBytes = maxFileSizeMB ? maxFileSizeMB * 1024 * 1024 : null
  const largeFiles = activeFiles.filter((file) => file.size > PERFORMANCE_WARNING_LIMIT_BYTES)
  const largeFileWarning =
    largeFiles.length > 0
      ? `Performance warning: Files over 50 MB may process slowly: ${largeFiles
          .map((file) => file.name)
          .join(', ')}`
      : ''

  const setFiles = (nextFiles) => {
    if (!Array.isArray(files)) {
      setInternalFiles(nextFiles)
    }

    if (typeof onFilesChange === 'function') {
      onFilesChange(nextFiles)
    }
  }

  const setError = (nextError) => {
    if (typeof errorMessage !== 'string') {
      setInternalError(nextError)
    }

    if (typeof onErrorChange === 'function') {
      onErrorChange(nextError)
    }
  }

  const addFiles = (incomingFiles) => {
    const selectedFiles = Array.from(incomingFiles || [])
    if (selectedFiles.length === 0) {
      return
    }

    const validFiles = []
    const invalidTypeFiles = []
    const invalidSizeFiles = []

    selectedFiles.forEach((file) => {
      if (!isFileTypeAllowed(file, acceptedTypes)) {
        invalidTypeFiles.push(file.name)
        return
      }

      if (maxSizeInBytes && file.size > maxSizeInBytes) {
        invalidSizeFiles.push(file.name)
        return
      }

      validFiles.push(file)
    })

    if (validFiles.length > 0) {
      const mergedFiles = multiple ? [...activeFiles, ...validFiles] : [validFiles[0]]
      const uniqueFiles = mergedFiles.filter(
        (file, index, allFiles) =>
          index === allFiles.findIndex((currentFile) => getFileId(currentFile) === getFileId(file)),
      )
      setFiles(uniqueFiles)
    }

    const validationErrors = []

    if (invalidTypeFiles.length > 0) {
      validationErrors.push(`Wrong file type warning: ${invalidTypeFiles.join(', ')}`)
    }

    if (invalidSizeFiles.length > 0) {
      validationErrors.push(`File size limit warning (max ${maxFileSizeMB} MB): ${invalidSizeFiles.join(', ')}`)
    }

    setError(validationErrors.join('. '))
  }

  const handleInputChange = (event) => {
    addFiles(event.target.files)
    event.target.value = ''
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    addFiles(event.dataTransfer.files)
  }

  const removeFile = (fileToRemove) => {
    const nextFiles = activeFiles.filter((file) => getFileId(file) !== getFileId(fileToRemove))
    setFiles(nextFiles)
  }

  return (
    <section className={`surface-soft p-4 sm:p-5 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-textPrimary">{title}</h2>
          <p className="mt-1 text-sm text-textSecondary">{description}</p>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={acceptAttr}
        multiple={multiple}
        onChange={handleInputChange}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`mt-4 flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed px-4 py-10 text-center transition-all duration-200 ${
          isDragging
            ? 'border-[#f27f50] bg-[#fff3ed]'
            : 'border-borderColor bg-white hover:border-[#f27f50]/70 hover:bg-[#fff7f4]'
        }`}
      >
        <UploadCloud className="h-8 w-8 text-[#f27f50]" />
        <span className="mt-3 text-sm font-semibold text-textPrimary">Drag and drop files here</span>
        <span className="mt-1 text-xs text-textSecondary">or click to browse from your device</span>
      </button>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-textSecondary">
        {acceptedTypes.length > 0 ? <span>Accepted: {acceptedTypes.join(', ')}</span> : null}
        {maxFileSizeMB ? <span>Max size: {maxFileSizeMB} MB per file</span> : null}
      </div>

      {activeError ? (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{activeError}</p>
        </div>
      ) : null}

      {largeFileWarning ? (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{largeFileWarning}</p>
        </div>
      ) : null}

      {activeFiles.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {activeFiles.map((file) => (
            <li
              key={getFileId(file)}
              className="flex items-center justify-between gap-3 rounded-lg border border-borderColor bg-white px-3 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="h-4 w-4 shrink-0 text-[#f27f50]" />
                <div className="min-w-0">
                  <p className="truncate text-sm text-textPrimary">{file.name}</p>
                  <p className="text-xs text-textSecondary">{formatFileSize(file.size)}</p>
                </div>
              </div>

              <button type="button" onClick={() => removeFile(file)} className="secondary-action gap-1">
                <X className="h-3.5 w-3.5" />
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

export default UploadArea
