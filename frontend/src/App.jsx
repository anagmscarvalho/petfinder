import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ReportLost from './pages/ReportLost'
import ReportFound from './pages/ReportFound'
import Results from './pages/Results'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/perdi" element={<ReportLost />} />
        <Route path="/achei" element={<ReportFound />} />
        <Route path="/resultados" element={<Results />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
