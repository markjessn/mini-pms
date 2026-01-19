import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={
          <div className="p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Mini PMS</h1>
            <p className="mt-2 text-gray-600">Project setup complete. Ready for Phase 2.</p>
          </div>
        } />
      </Routes>
    </div>
  )
}

export default App
