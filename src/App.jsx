import { Suspense, lazy } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import Layout from './components/Layout'

const HomePage = lazy(() => import('./pages/HomePage'))
const JpgToPdfPage = lazy(() => import('./pages/JpgToPdfPage'))
const MergePdfPage = lazy(() => import('./pages/MergePdfPage'))
const SplitPdfPage = lazy(() => import('./pages/SplitPdfPage'))
const CompressPdfPage = lazy(() => import('./pages/CompressPdfPage'))
const PdfToJpgPage = lazy(() => import('./pages/PdfToJpgPage'))
const RotatePdfPage = lazy(() => import('./pages/RotatePdfPage'))
const RearrangePdfPage = lazy(() => import('./pages/RearrangePdfPage'))
const PdfToWordPage = lazy(() => import('./pages/PdfToWordPage'))
const WordToPdfPage = lazy(() => import('./pages/WordToPdfPage'))
const LockPdfPage = lazy(() => import('./pages/LockPdfPage'))
const UnlockPdfPage = lazy(() => import('./pages/UnlockPdfPage'))
const CropPdfPage = lazy(() => import('./pages/CropPdfPage'))
const PolicyPage = lazy(() => import('./pages/PolicyPage'))

const appRoutes = [
  { path: 'jpg-to-pdf', element: <JpgToPdfPage /> },
  { path: 'merge-pdf', element: <MergePdfPage /> },
  { path: 'split-pdf', element: <SplitPdfPage /> },
  { path: 'compress-pdf', element: <CompressPdfPage /> },
  { path: 'pdf-to-jpg', element: <PdfToJpgPage /> },
  { path: 'rotate-pdf', element: <RotatePdfPage /> },
  { path: 'rearrange-pdf', element: <RearrangePdfPage /> },
  { path: 'pdf-to-word', element: <PdfToWordPage /> },
  { path: 'word-to-pdf', element: <WordToPdfPage /> },
  { path: 'lock-pdf', element: <LockPdfPage /> },
  { path: 'unlock-pdf', element: <UnlockPdfPage /> },
  { path: 'crop-pdf', element: <CropPdfPage /> },
  { path: 'policy', element: <PolicyPage /> },
]

function App() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center px-6">
            <div className="surface-soft rounded-xl px-5 py-3 text-sm text-textSecondary">Loading page...</div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            {appRoutes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
