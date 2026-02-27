import { AlertCircle, FileText, GripVertical, UploadCloud, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

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

function getFileExtension(fileName) {
  const extension = fileName.split('.').pop()
  return extension ? extension.toUpperCase() : 'FILE'
}

function isImageFile(file) {
  const normalizedType = (file.type || '').toLowerCase()
  if (normalizedType.startsWith('image/')) {
    return true
  }

  const normalizedName = file.name.toLowerCase()
  return ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'].some((extension) =>
    normalizedName.endsWith(extension),
  )
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
  const [draggedFileId, setDraggedFileId] = useState('')
  const [dragOverFileId, setDragOverFileId] = useState('')
  const [internalFiles, setInternalFiles] = useState([])
  const [internalError, setInternalError] = useState('')
  const [previewUrls, setPreviewUrls] = useState({})
  const previewUrlsRef = useRef({})

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
  const canReorder = multiple && activeFiles.length > 1

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

  useEffect(() => {
    setPreviewUrls((currentUrls) => {
      const nextUrls = { ...currentUrls }
      const activeIds = new Set()
      let hasChanges = false

      activeFiles.forEach((file) => {
        const fileId = getFileId(file)
        activeIds.add(fileId)

        if (isImageFile(file) && !nextUrls[fileId]) {
          nextUrls[fileId] = URL.createObjectURL(file)
          hasChanges = true
        }
      })

      Object.entries(nextUrls).forEach(([fileId, url]) => {
        if (!activeIds.has(fileId)) {
          URL.revokeObjectURL(url)
          delete nextUrls[fileId]
          hasChanges = true
        }
      })

      if (hasChanges) {
        previewUrlsRef.current = nextUrls
      }

      return hasChanges ? nextUrls : currentUrls
    })
  }, [activeFiles])

  useEffect(
    () => () => {
      Object.values(previewUrlsRef.current).forEach((url) => URL.revokeObjectURL(url))
    },
    [],
  )

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
    const removedFileId = getFileId(fileToRemove)
    const nextFiles = activeFiles.filter((file) => getFileId(file) !== removedFileId)
    setFiles(nextFiles)
    if (draggedFileId === removedFileId) {
      setDraggedFileId('')
    }
    if (dragOverFileId === removedFileId) {
      setDragOverFileId('')
    }
  }

  const moveFile = (sourceFileId, targetFileId) => {
    if (!canReorder || !sourceFileId || !targetFileId || sourceFileId === targetFileId) {
      return
    }

    const sourceIndex = activeFiles.findIndex((file) => getFileId(file) === sourceFileId)
    const targetIndex = activeFiles.findIndex((file) => getFileId(file) === targetFileId)

    if (sourceIndex < 0 || targetIndex < 0) {
      return
    }

    const nextFiles = [...activeFiles]
    const [movedFile] = nextFiles.splice(sourceIndex, 1)
    nextFiles.splice(targetIndex, 0, movedFile)
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
        <>
          {canReorder ? (
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#f27f50]">
              Drag cards to rearrange sequence.
            </p>
          ) : null}
          <ul className={`${canReorder ? 'mt-2' : 'mt-4'} grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3`}>
            {activeFiles.map((file, index) => {
              const fileId = getFileId(file)
              const previewUrl = previewUrls[fileId]
              const hasPreview = Boolean(previewUrl)

              return (
                <li
                  key={fileId}
                  draggable={canReorder}
                  onDragStart={(event) => {
                    if (!canReorder) {
                      return
                    }

                    event.dataTransfer.effectAllowed = 'move'
                    event.dataTransfer.setData('text/plain', fileId)
                    setDraggedFileId(fileId)
                  }}
                  onDragOver={(event) => {
                    if (!canReorder) {
                      return
                    }

                    event.preventDefault()
                    event.dataTransfer.dropEffect = 'move'
                    if (dragOverFileId !== fileId) {
                      setDragOverFileId(fileId)
                    }
                  }}
                  onDragLeave={() => {
                    if (dragOverFileId === fileId) {
                      setDragOverFileId('')
                    }
                  }}
                  onDrop={(event) => {
                    if (!canReorder) {
                      return
                    }

                    event.preventDefault()
                    const droppedFileId = event.dataTransfer.getData('text/plain') || draggedFileId
                    moveFile(droppedFileId, fileId)
                    setDraggedFileId('')
                    setDragOverFileId('')
                  }}
                  onDragEnd={() => {
                    setDraggedFileId('')
                    setDragOverFileId('')
                  }}
                  className={`rounded-xl border bg-white p-3 transition-all duration-200 ${
                    draggedFileId === fileId
                      ? 'border-[#f27f50] shadow-[0_12px_24px_rgba(242,127,80,0.2)]'
                      : 'border-borderColor'
                  } ${dragOverFileId === fileId ? 'ring-2 ring-[#f27f50]/35' : ''}`}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {canReorder ? <GripVertical className="h-4 w-4 text-textSecondary" /> : null}
                      <span className="rounded-full bg-[#f8f9fc] px-2 py-0.5 text-xs font-semibold text-textPrimary">
                        #{index + 1}
                      </span>
                    </div>

                    <button type="button" onClick={() => removeFile(file)} className="secondary-action gap-1">
                      <X className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>

                  <div className="overflow-hidden rounded-lg border border-borderColor bg-[#f8f9fc]">
                    {hasPreview ? (
                      <img src={previewUrl} alt={file.name} className="h-32 w-full object-cover" />
                    ) : (
                      <div className="flex h-32 flex-col items-center justify-center gap-2 px-3 text-center">
                        <FileText className="h-6 w-6 text-[#f27f50]" />
                        <p className="text-xs font-semibold tracking-wide text-textSecondary">{getFileExtension(file.name)}</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-2 min-w-0">
                    <p className="truncate text-sm font-semibold text-textPrimary">{file.name}</p>
                    <p className="text-xs text-textSecondary">{formatFileSize(file.size)}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </>
      ) : null}
    </section>
  )
}

export default UploadArea
