import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/shell/AppLayout'
import { LibraryPage, LibraryRouteRedirect } from '@/shell/LibraryPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<LibraryRouteRedirect />} />
          <Route path="libs/:framework/:libraryId" element={<LibraryPage />} />
          <Route path="libs/:segment" element={<LibraryRouteRedirect />} />
          <Route path="*" element={<LibraryRouteRedirect />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
