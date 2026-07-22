import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { DEFAULT_LIBRARY_ID } from '@/domain/libraries'
import { AppLayout } from '@/shell/AppLayout'
import { LibraryPage } from '@/shell/LibraryPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to={`/libs/${DEFAULT_LIBRARY_ID}`} replace />} />
          <Route path="libs/:libraryId" element={<LibraryPage />} />
          <Route path="*" element={<Navigate to={`/libs/${DEFAULT_LIBRARY_ID}`} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
