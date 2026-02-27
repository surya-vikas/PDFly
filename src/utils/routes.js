import { Archive, ArrowUpDown, Crop, FileImage, FileText, FileUp, Files, Image, Lock, LockOpen, RotateCw, Scissors } from 'lucide-react'

export const TOOL_LINKS = [
  {
    path: '/jpg-to-pdf',
    title: 'JPG to PDF',
    summary: 'Convert multiple JPG images into one PDF document.',
    icon: Image,
  },
  {
    path: '/merge-pdf',
    title: 'Merge PDF',
    summary: 'Combine multiple PDF files into a single output file.',
    icon: Files,
  },
  {
    path: '/split-pdf',
    title: 'Split PDF',
    summary: 'Split a PDF into separate pages or page ranges.',
    icon: Scissors,
  },
  {
    path: '/compress-pdf',
    title: 'Compress PDF',
    summary: 'Reduce file size while keeping content readable.',
    icon: Archive,
  },
  {
    path: '/pdf-to-jpg',
    title: 'PDF to JPG',
    summary: 'Export PDF pages into high-quality JPG images.',
    icon: FileImage,
  },
  {
    path: '/rotate-pdf',
    title: 'Rotate PDF',
    summary: 'Rotate pages in a PDF and download instantly.',
    icon: RotateCw,
  },
  {
    path: '/rearrange-pdf',
    title: 'Rearrange PDF',
    summary: 'Reorder pages by drag and drop, then export a new file.',
    icon: ArrowUpDown,
  },
  {
    path: '/pdf-to-word',
    title: 'PDF to Word',
    summary: 'Extract text from PDF pages into a DOCX document.',
    icon: FileText,
  },
  {
    path: '/word-to-pdf',
    title: 'Word to PDF',
    summary: 'Convert DOC and DOCX files into PDF format.',
    icon: FileUp,
  },
  {
    path: '/lock-pdf',
    title: 'Lock PDF',
    summary: 'Add password protection to your PDF files.',
    icon: Lock,
  },
  {
    path: '/unlock-pdf',
    title: 'Unlock PDF',
    summary: 'Remove password protection from supported PDFs.',
    icon: LockOpen,
  },
  {
    path: '/crop-pdf',
    title: 'Crop PDF',
    summary: 'Trim margins and crop page areas before export.',
    icon: Crop,
  },
]
