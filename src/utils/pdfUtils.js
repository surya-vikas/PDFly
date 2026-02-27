const PDF_WORKER_SRC = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()

let jsPdfCtorPromise
let pdfLibModulePromise
let pdfLibEncryptModulePromise
let pdfJsModulePromise
let docxModulePromise
let mammothModulePromise

// Load heavy PDF libraries only when a tool is actually executed.
async function getJsPdfCtor() {
  if (!jsPdfCtorPromise) {
    jsPdfCtorPromise = import('jspdf').then((module) => module.jsPDF)
  }
  return jsPdfCtorPromise
}

async function getPdfLibModule() {
  if (!pdfLibModulePromise) {
    pdfLibModulePromise = import('pdf-lib')
  }
  return pdfLibModulePromise
}

async function getPdfLibEncryptModule() {
  if (!pdfLibEncryptModulePromise) {
    pdfLibEncryptModulePromise = import('pdf-lib-with-encrypt')
  }
  return pdfLibEncryptModulePromise
}

async function getPdfJsModule() {
  if (!pdfJsModulePromise) {
    pdfJsModulePromise = import('pdfjs-dist/build/pdf.min.mjs')
  }
  return pdfJsModulePromise
}

async function getDocxModule() {
  if (!docxModulePromise) {
    docxModulePromise = import('docx')
  }
  return docxModulePromise
}

async function getMammothModule() {
  if (!mammothModulePromise) {
    mammothModulePromise = import('mammoth')
  }
  return mammothModulePromise
}

async function ensurePdfWorker() {
  const { GlobalWorkerOptions } = await getPdfJsModule()
  if (!GlobalWorkerOptions.workerSrc) {
    GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC
  }
}

function isFileList(value) {
  return typeof FileList !== 'undefined' && value instanceof FileList
}

function toArray(value) {
  if (Array.isArray(value)) {
    return value
  }

  if (isFileList(value)) {
    return Array.from(value)
  }

  if (value == null) {
    return []
  }

  return [value]
}

function toInt(value) {
  const parsed = Number(value)
  return Number.isInteger(parsed) ? parsed : null
}

function normalizePageNumbers(pageNumbers, totalPages) {
  if (!Array.isArray(pageNumbers) || pageNumbers.length === 0) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const normalized = Array.from(new Set(pageNumbers.map(toInt)))
    .filter((page) => page && page >= 1 && page <= totalPages)
    .sort((first, second) => first - second)

  if (normalized.length === 0) {
    throw new Error('No valid page numbers were provided.')
  }

  return normalized
}

function parseRange(range) {
  if (typeof range === 'number') {
    return { start: range, end: range }
  }

  if (typeof range === 'string') {
    const cleaned = range.trim()
    if (!cleaned) {
      return null
    }

    const singlePage = cleaned.match(/^\d+$/)
    if (singlePage) {
      const page = Number(cleaned)
      return { start: page, end: page }
    }

    const span = cleaned.match(/^(\d+)\s*-\s*(\d+)$/)
    if (span) {
      return { start: Number(span[1]), end: Number(span[2]) }
    }

    return null
  }

  if (range && typeof range === 'object') {
    return { start: Number(range.start), end: Number(range.end ?? range.start) }
  }

  return null
}

function normalizePageRanges(pageRanges, totalPages) {
  if (!Array.isArray(pageRanges) || pageRanges.length === 0) {
    return Array.from({ length: totalPages }, (_, index) => ({ start: index + 1, end: index + 1 }))
  }

  const normalized = pageRanges
    .map(parseRange)
    .filter(Boolean)
    .map((range) => ({
      start: Math.max(1, Math.min(totalPages, Math.trunc(range.start))),
      end: Math.max(1, Math.min(totalPages, Math.trunc(range.end))),
    }))
    .map((range) => ({
      start: Math.min(range.start, range.end),
      end: Math.max(range.start, range.end),
    }))
    .filter((range) => Number.isInteger(range.start) && Number.isInteger(range.end))

  if (normalized.length === 0) {
    throw new Error('No valid page ranges were provided.')
  }

  return normalized
}

function parsePageRangeInput(pageRangeInput) {
  if (typeof pageRangeInput !== 'string') {
    return []
  }

  return pageRangeInput
    .split(',')
    .map((segment) => segment.trim())
    .filter(Boolean)
}

function isPdfFile(file) {
  const type = (file?.type || '').toLowerCase()
  const name = (file?.name || '').toLowerCase()
  return type === 'application/pdf' || name.endsWith('.pdf')
}

function isJpgFile(file) {
  const type = (file?.type || '').toLowerCase()
  const name = (file?.name || '').toLowerCase()
  return type === 'image/jpeg' || type === 'image/jpg' || name.endsWith('.jpg') || name.endsWith('.jpeg')
}

function isDocxFile(file) {
  const type = (file?.type || '').toLowerCase()
  const name = (file?.name || '').toLowerCase()
  return (
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx')
  )
}

function errorMessage(error) {
  if (error instanceof Error && error.message) {
    return error.message
  }
  return 'Unexpected processing error.'
}

function utilityError(action, error) {
  return new Error(`${action} failed: ${errorMessage(error)}`)
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Unable to read file data.'))
    reader.readAsDataURL(blob)
  })
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(image)
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error(`Unable to read image: ${file?.name || 'Unknown file'}`))
    }

    image.src = objectUrl
  })
}

async function toUint8Array(input) {
  if (input instanceof Uint8Array) {
    return input
  }

  if (input instanceof ArrayBuffer) {
    return new Uint8Array(input)
  }

  if (input instanceof Blob) {
    const buffer = await input.arrayBuffer()
    return new Uint8Array(buffer)
  }

  throw new Error('Expected a File, Blob, Uint8Array, or ArrayBuffer.')
}

function blobFromPdfBytes(pdfBytes) {
  return new Blob([pdfBytes], { type: 'application/pdf' })
}

function canvasToBlob(canvas, imageType, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Unable to export canvas to image blob.'))
          return
        }
        resolve(blob)
      },
      imageType,
      quality,
    )
  })
}

function normalizeInlineText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractPdfTextLines(textItems) {
  const lines = []
  let currentLine = ''

  textItems.forEach((item) => {
    const normalizedText = normalizeInlineText(item?.str)
    if (!normalizedText) {
      return
    }

    currentLine = currentLine ? `${currentLine} ${normalizedText}` : normalizedText
    if (item?.hasEOL) {
      lines.push(currentLine)
      currentLine = ''
    }
  })

  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

export async function convertJpgToPdf(imageFiles, options = {}) {
  try {
    const { fileName = 'converted.pdf', margin = 24 } = options
    const JsPdf = await getJsPdfCtor()
    const files = toArray(imageFiles)

    if (files.length === 0) {
      throw new Error('Please select at least one JPG image.')
    }

    const invalidFile = files.find((file) => !isJpgFile(file))
    if (invalidFile) {
      throw new Error(`Unsupported file type. Only JPG/JPEG is allowed: ${invalidFile.name}`)
    }

    let pdfDoc = null

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index]
      const image = await loadImage(file)
      const imageDataUrl = await blobToDataUrl(file)

      const width = image.naturalWidth || image.width
      const height = image.naturalHeight || image.height

      if (width <= 0 || height <= 0) {
        throw new Error(`Invalid image dimensions: ${file.name}`)
      }

      const orientation = width >= height ? 'landscape' : 'portrait'

      if (!pdfDoc) {
        pdfDoc = new JsPdf({
          orientation,
          unit: 'pt',
          format: 'a4',
          compress: true,
        })
      } else {
        pdfDoc.addPage('a4', orientation)
      }

      const pageWidth = pdfDoc.internal.pageSize.getWidth()
      const pageHeight = pdfDoc.internal.pageSize.getHeight()
      const maxWidth = Math.max(1, pageWidth - margin * 2)
      const maxHeight = Math.max(1, pageHeight - margin * 2)
      const scale = Math.min(maxWidth / width, maxHeight / height)
      const renderWidth = width * scale
      const renderHeight = height * scale
      const x = (pageWidth - renderWidth) / 2
      const y = (pageHeight - renderHeight) / 2

      pdfDoc.addImage(imageDataUrl, 'JPEG', x, y, renderWidth, renderHeight, undefined, 'FAST')
    }

    const pdfBuffer = pdfDoc.output('arraybuffer')
    return {
      fileName,
      blob: new Blob([pdfBuffer], { type: 'application/pdf' }),
    }
  } catch (error) {
    throw utilityError('JPG to PDF conversion', error)
  }
}

export async function mergePdfFiles(pdfFiles, options = {}) {
  try {
    const { fileName = 'merged.pdf' } = options
    const { PDFDocument } = await getPdfLibModule()
    const files = toArray(pdfFiles)

    if (files.length < 2) {
      throw new Error('Please provide at least two PDF files to merge.')
    }

    const invalidFile = files.find((file) => !isPdfFile(file))
    if (invalidFile) {
      throw new Error(`Unsupported file type. Only PDF is allowed: ${invalidFile.name}`)
    }

    const mergedPdf = await PDFDocument.create()

    for (const file of files) {
      const bytes = await toUint8Array(file)
      const sourcePdf = await PDFDocument.load(bytes)
      const pageIndexes = sourcePdf.getPageIndices()
      const copiedPages = await mergedPdf.copyPages(sourcePdf, pageIndexes)
      copiedPages.forEach((page) => mergedPdf.addPage(page))
    }

    const mergedBytes = await mergedPdf.save({ useObjectStreams: true })
    return {
      fileName,
      blob: blobFromPdfBytes(mergedBytes),
    }
  } catch (error) {
    throw utilityError('PDF merge', error)
  }
}

export async function rearrangePdfPages(pdfFile, pageOrder, options = {}) {
  try {
    const { fileName = 'rearranged.pdf' } = options
    const { PDFDocument } = await getPdfLibModule()

    if (!pdfFile) {
      throw new Error('Please provide a PDF file to rearrange.')
    }

    if (!isPdfFile(pdfFile)) {
      throw new Error(`Unsupported file type. Only PDF is allowed: ${pdfFile.name || 'Unknown file'}`)
    }

    const sourceBytes = await toUint8Array(pdfFile)
    const sourcePdf = await PDFDocument.load(sourceBytes)
    const totalPages = sourcePdf.getPageCount()

    const normalizedOrder =
      Array.isArray(pageOrder) && pageOrder.length > 0
        ? pageOrder.map(toInt)
        : Array.from({ length: totalPages }, (_, index) => index + 1)

    if (normalizedOrder.some((pageNumber) => !pageNumber || pageNumber < 1 || pageNumber > totalPages)) {
      throw new Error('Page order contains invalid page numbers.')
    }

    if (new Set(normalizedOrder).size !== totalPages || normalizedOrder.length !== totalPages) {
      throw new Error('Page order must include each page exactly once.')
    }

    const rebuiltPdf = await PDFDocument.create()
    const orderedPageIndexes = normalizedOrder.map((pageNumber) => pageNumber - 1)
    const copiedPages = await rebuiltPdf.copyPages(sourcePdf, orderedPageIndexes)
    copiedPages.forEach((page) => rebuiltPdf.addPage(page))

    const rebuiltBytes = await rebuiltPdf.save({ useObjectStreams: true })
    return {
      fileName,
      pageOrder: normalizedOrder,
      blob: blobFromPdfBytes(rebuiltBytes),
    }
  } catch (error) {
    throw utilityError('PDF rearrange', error)
  }
}

export async function splitPdfPages(pdfFile, options = {}) {
  try {
    const { pageRange = '', pageRanges = [], fileName = 'split.pdf' } = options
    const { PDFDocument } = await getPdfLibModule()

    if (!pdfFile) {
      throw new Error('Please provide a PDF file to split.')
    }

    if (!isPdfFile(pdfFile)) {
      throw new Error(`Unsupported file type. Only PDF is allowed: ${pdfFile.name || 'Unknown file'}`)
    }

    const sourceBytes = await toUint8Array(pdfFile)
    const sourcePdf = await PDFDocument.load(sourceBytes)
    const rangesInput = pageRanges.length > 0 ? pageRanges : parsePageRangeInput(pageRange)
    const ranges = normalizePageRanges(rangesInput, sourcePdf.getPageCount())
    const splitPdf = await PDFDocument.create()

    for (const range of ranges) {
      const pageIndexes = Array.from({ length: range.end - range.start + 1 }, (_, offset) => range.start - 1 + offset)
      const copiedPages = await splitPdf.copyPages(sourcePdf, pageIndexes)
      copiedPages.forEach((page) => splitPdf.addPage(page))
    }

    const splitBytes = await splitPdf.save({ useObjectStreams: true })

    return {
      fileName,
      ranges,
      blob: blobFromPdfBytes(splitBytes),
    }
  } catch (error) {
    throw utilityError('PDF split', error)
  }
}

export async function rotatePdfPages(pdfFile, options = {}) {
  try {
    const { fileName = 'rotated.pdf', rotation = 90, pageNumbers = [] } = options
    const { PDFDocument, degrees } = await getPdfLibModule()

    if (!pdfFile) {
      throw new Error('Please provide a PDF file to rotate.')
    }

    if (!isPdfFile(pdfFile)) {
      throw new Error(`Unsupported file type. Only PDF is allowed: ${pdfFile.name || 'Unknown file'}`)
    }

    const sourceBytes = await toUint8Array(pdfFile)
    const pdfDoc = await PDFDocument.load(sourceBytes)
    const pages = pdfDoc.getPages()
    const targetPages = normalizePageNumbers(pageNumbers, pages.length)

    targetPages.forEach((pageNumber) => {
      const page = pages[pageNumber - 1]
      const currentRotation = page.getRotation().angle || 0
      const nextRotation = ((currentRotation + rotation) % 360 + 360) % 360
      page.setRotation(degrees(nextRotation))
    })

    const rotatedBytes = await pdfDoc.save({ useObjectStreams: true })
    return {
      fileName,
      blob: blobFromPdfBytes(rotatedBytes),
    }
  } catch (error) {
    throw utilityError('PDF rotation', error)
  }
}

export async function compressPdfFile(pdfFile, options = {}) {
  let loadingTask
  let pdf

  try {
    const { fileName = 'compressed.pdf', quality = 0.65, scale = 1.25 } = options
    const JsPdf = await getJsPdfCtor()

    if (!pdfFile) {
      throw new Error('Please provide a PDF file to compress.')
    }

    if (!isPdfFile(pdfFile)) {
      throw new Error(`Unsupported file type. Only PDF is allowed: ${pdfFile.name || 'Unknown file'}`)
    }

    await ensurePdfWorker()
    const { getDocument } = await getPdfJsModule()

    const jpegQuality = Math.min(1, Math.max(0.1, Number(quality) || 0.65))
    const renderScale = Math.min(3, Math.max(0.5, Number(scale) || 1.25))
    const sourceBytes = await toUint8Array(pdfFile)
    loadingTask = getDocument({ data: sourceBytes })
    pdf = await loadingTask.promise

    let compressedDoc = null

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber)
      const viewport = page.getViewport({ scale: renderScale })
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.ceil(viewport.width))
      canvas.height = Math.max(1, Math.ceil(viewport.height))

      const context = canvas.getContext('2d', { alpha: false })
      if (!context) {
        throw new Error('Unable to render PDF page for compression.')
      }

      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, canvas.width, canvas.height)
      await page.render({ canvasContext: context, viewport }).promise

      const jpegDataUrl = canvas.toDataURL('image/jpeg', jpegQuality)
      const orientation = canvas.width >= canvas.height ? 'landscape' : 'portrait'

      if (!compressedDoc) {
        compressedDoc = new JsPdf({
          orientation,
          unit: 'px',
          format: [canvas.width, canvas.height],
          compress: true,
        })
      } else {
        compressedDoc.addPage([canvas.width, canvas.height], orientation)
      }

      compressedDoc.addImage(
        jpegDataUrl,
        'JPEG',
        0,
        0,
        canvas.width,
        canvas.height,
        undefined,
        'FAST',
      )

      page.cleanup()
      canvas.width = 0
      canvas.height = 0
    }

    if (!compressedDoc) {
      throw new Error('No pages were found in the PDF.')
    }

    const compressedBuffer = compressedDoc.output('arraybuffer')
    return {
      fileName,
      blob: new Blob([compressedBuffer], { type: 'application/pdf' }),
    }
  } catch (error) {
    throw utilityError('PDF compression', error)
  } finally {
    // Always release PDF.js resources to avoid memory buildup on repeated runs.
    if (loadingTask) {
      await loadingTask.destroy().catch(() => {})
    }
    if (pdf) {
      await pdf.destroy().catch(() => {})
    }
  }
}

export async function convertPdfToWord(pdfFile, options = {}) {
  let loadingTask
  let pdf

  try {
    const { fileName = 'converted.docx' } = options
    const { getDocument } = await getPdfJsModule()
    const { Document, Packer, Paragraph, TextRun } = await getDocxModule()

    if (!pdfFile) {
      throw new Error('Please provide a PDF file to convert.')
    }

    if (!isPdfFile(pdfFile)) {
      throw new Error(`Unsupported file type. Only PDF is allowed: ${pdfFile.name || 'Unknown file'}`)
    }

    await ensurePdfWorker()

    const sourceBytes = await toUint8Array(pdfFile)
    loadingTask = getDocument({ data: sourceBytes })
    pdf = await loadingTask.promise

    const docChildren = []

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber)
      const textContent = await page.getTextContent()
      const lines = extractPdfTextLines(textContent?.items || [])

      if (docChildren.length > 0) {
        docChildren.push(new Paragraph({ text: '' }))
      }

      docChildren.push(
        new Paragraph({
          children: [new TextRun({ text: `Page ${pageNumber}`, bold: true })],
        }),
      )

      if (lines.length === 0) {
        docChildren.push(new Paragraph({ text: '' }))
      } else {
        lines.forEach((line) => {
          docChildren.push(new Paragraph({ text: line }))
        })
      }

      page.cleanup()
    }

    if (docChildren.length === 0) {
      docChildren.push(new Paragraph({ text: 'No extractable text found.' }))
    }

    const document = new Document({
      sections: [{ properties: {}, children: docChildren }],
    })
    const blob = await Packer.toBlob(document)

    return {
      fileName,
      blob,
    }
  } catch (error) {
    throw utilityError('PDF to Word conversion', error)
  } finally {
    // Always release PDF.js resources to avoid memory buildup on repeated runs.
    if (loadingTask) {
      await loadingTask.destroy().catch(() => {})
    }
    if (pdf) {
      await pdf.destroy().catch(() => {})
    }
  }
}

export async function convertWordToPdf(wordFile, options = {}) {
  try {
    const { fileName = 'converted.pdf', margin = 42, lineHeight = 18, fontSize = 12 } = options
    const JsPdf = await getJsPdfCtor()
    const mammoth = await getMammothModule()

    if (!wordFile) {
      throw new Error('Please provide a DOCX file to convert.')
    }

    if (!isDocxFile(wordFile)) {
      throw new Error(`Unsupported file type. Only DOCX is allowed: ${wordFile.name || 'Unknown file'}`)
    }

    const sourceBuffer = await wordFile.arrayBuffer()
    const extraction = await mammoth.extractRawText({ arrayBuffer: sourceBuffer })
    const extractedText = String(extraction?.value || '').replace(/\r/g, '')
    const paragraphs = extractedText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    const pdfDoc = new JsPdf({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
      compress: true,
    })

    const pageWidth = pdfDoc.internal.pageSize.getWidth()
    const pageHeight = pdfDoc.internal.pageSize.getHeight()
    const maxWidth = Math.max(1, pageWidth - margin * 2)
    const resolvedLineHeight = Math.max(12, Number(lineHeight) || 18)
    const resolvedFontSize = Math.max(10, Number(fontSize) || 12)

    pdfDoc.setFontSize(resolvedFontSize)

    const linesToRender = paragraphs.length > 0 ? paragraphs : ['No extractable text found in DOCX file.']
    let y = margin

    linesToRender.forEach((paragraph, paragraphIndex) => {
      const wrappedLines = pdfDoc.splitTextToSize(paragraph, maxWidth)

      wrappedLines.forEach((line) => {
        if (y + resolvedLineHeight > pageHeight - margin) {
          pdfDoc.addPage('a4', 'portrait')
          y = margin
        }

        pdfDoc.text(line, margin, y)
        y += resolvedLineHeight
      })

      if (paragraphIndex < linesToRender.length - 1) {
        y += resolvedLineHeight * 0.35
      }
    })

    const pdfBuffer = pdfDoc.output('arraybuffer')
    return {
      fileName,
      blob: new Blob([pdfBuffer], { type: 'application/pdf' }),
    }
  } catch (error) {
    throw utilityError('Word to PDF conversion', error)
  }
}

export async function lockPdf(pdfFile, options = {}) {
  try {
    const { fileName = 'locked.pdf', password = '' } = options
    const { PDFDocument } = await getPdfLibEncryptModule()

    if (!pdfFile) {
      throw new Error('Please provide a PDF file to lock.')
    }

    if (!isPdfFile(pdfFile)) {
      throw new Error(`Unsupported file type. Only PDF is allowed: ${pdfFile.name || 'Unknown file'}`)
    }

    if (!String(password).trim()) {
      throw new Error('Please provide a password to lock the PDF.')
    }

    const sourceBytes = await toUint8Array(pdfFile)
    const pdfDoc = await PDFDocument.load(sourceBytes)

    await pdfDoc.encrypt({
      userPassword: String(password),
      ownerPassword: String(password),
      permissions: {
        printing: 'highResolution',
        modifying: false,
      },
    })

    const lockedBytes = await pdfDoc.save({ useObjectStreams: false })
    return {
      fileName,
      blob: blobFromPdfBytes(lockedBytes),
    }
  } catch (error) {
    throw utilityError('PDF lock', error)
  }
}

export async function unlockPdf(pdfFile, options = {}) {
  try {
    const { fileName = 'unlocked.pdf', password = '' } = options
    const { PDFDocument } = await getPdfLibEncryptModule()

    if (!pdfFile) {
      throw new Error('Please provide a PDF file to unlock.')
    }

    if (!isPdfFile(pdfFile)) {
      throw new Error(`Unsupported file type. Only PDF is allowed: ${pdfFile.name || 'Unknown file'}`)
    }

    if (!String(password).trim()) {
      throw new Error('Please provide the password to unlock this PDF.')
    }

    const sourceBytes = await toUint8Array(pdfFile)
    let pdfDoc

    try {
      pdfDoc = await PDFDocument.load(sourceBytes, { password: String(password) })
    } catch (error) {
      const message = errorMessage(error).toLowerCase()
      if (message.includes('password') || message.includes('encrypt') || message.includes('cipher')) {
        throw new Error('Wrong password. Please check the password and try again.')
      }
      throw error
    }

    // Saving without calling `encrypt` produces an unlocked document.
    const unlockedBytes = await pdfDoc.save({ useObjectStreams: false })
    return {
      fileName,
      blob: blobFromPdfBytes(unlockedBytes),
    }
  } catch (error) {
    throw utilityError('PDF unlock', error)
  }
}

export async function cropPdfPages(pdfFile, options = {}) {
  try {
    const {
      fileName = 'cropped.pdf',
      margins = {},
      top = margins.top ?? 0,
      bottom = margins.bottom ?? 0,
      left = margins.left ?? 0,
      right = margins.right ?? 0,
    } = options
    const { PDFDocument } = await getPdfLibModule()

    if (!pdfFile) {
      throw new Error('Please provide a PDF file to crop.')
    }

    if (!isPdfFile(pdfFile)) {
      throw new Error(`Unsupported file type. Only PDF is allowed: ${pdfFile.name || 'Unknown file'}`)
    }

    const marginTop = Math.max(0, Number(top) || 0)
    const marginBottom = Math.max(0, Number(bottom) || 0)
    const marginLeft = Math.max(0, Number(left) || 0)
    const marginRight = Math.max(0, Number(right) || 0)

    const sourceBytes = await toUint8Array(pdfFile)
    const pdfDoc = await PDFDocument.load(sourceBytes)
    const pages = pdfDoc.getPages()

    pages.forEach((page) => {
      const pageWidth = page.getWidth()
      const pageHeight = page.getHeight()
      const nextWidth = pageWidth - marginLeft - marginRight
      const nextHeight = pageHeight - marginTop - marginBottom

      if (nextWidth <= 1 || nextHeight <= 1) {
        throw new Error('Crop margins are too large for at least one page.')
      }

      // Crop from all four sides while preserving PDF bottom-left coordinate space.
      page.setCropBox(marginLeft, marginBottom, nextWidth, nextHeight)
      page.setTrimBox(marginLeft, marginBottom, nextWidth, nextHeight)
    })

    const croppedBytes = await pdfDoc.save({ useObjectStreams: true })
    return {
      fileName,
      blob: blobFromPdfBytes(croppedBytes),
    }
  } catch (error) {
    throw utilityError('PDF crop', error)
  }
}

export async function convertPdfToImages(pdfFile, options = {}) {
  let loadingTask
  let pdf

  try {
    const { pageNumbers = [], scale = 2, imageType = 'image/jpeg', quality = 0.92 } = options

    if (!pdfFile) {
      throw new Error('Please provide a PDF file to convert.')
    }

    if (!isPdfFile(pdfFile)) {
      throw new Error(`Unsupported file type. Only PDF is allowed: ${pdfFile.name || 'Unknown file'}`)
    }

    await ensurePdfWorker()
    const { getDocument } = await getPdfJsModule()

    const sourceBytes = await toUint8Array(pdfFile)
    loadingTask = getDocument({ data: sourceBytes })
    pdf = await loadingTask.promise
    const targetPages = normalizePageNumbers(pageNumbers, pdf.numPages)
    const outputs = []

    for (const pageNumber of targetPages) {
      const page = await pdf.getPage(pageNumber)
      const viewport = page.getViewport({ scale })
      const canvas = document.createElement('canvas')
      canvas.width = Math.ceil(viewport.width)
      canvas.height = Math.ceil(viewport.height)

      const context = canvas.getContext('2d', { alpha: false })
      if (!context) {
        throw new Error('Unable to render PDF page.')
      }

      await page.render({ canvasContext: context, viewport }).promise
      const blob = await canvasToBlob(canvas, imageType, quality)

      outputs.push({
        pageNumber,
        width: canvas.width,
        height: canvas.height,
        blob,
      })

      page.cleanup()
      canvas.width = 0
      canvas.height = 0
    }

    return outputs
  } catch (error) {
    throw utilityError('PDF to image conversion', error)
  } finally {
    // Always release PDF.js resources to avoid memory buildup on repeated runs.
    if (loadingTask) {
      await loadingTask.destroy().catch(() => {})
    }
    if (pdf) {
      await pdf.destroy().catch(() => {})
    }
  }
}
