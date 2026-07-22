import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { defaultPath } from '@/domain/libraries'
import { AppLayout } from '@/shell/AppLayout'
import { LegacyLibraryRedirect, LibraryPage } from '@/shell/LibraryPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to={defaultPath()} replace />} />
          <Route path="libs/:framework/:libraryId" element={<LibraryPage />} />
          <Route path="libs/:libraryId" element={<LegacyLibraryRedirect />} />
          <Route path="*" element={<Navigate to={defaultPath()} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
