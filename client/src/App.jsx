import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import './App.css'
import Upload from './pages/Upload/Upload'
import Dashboard from './pages/Dashboard/Dashboard'

function App() {

  return (
    <Router>
      <Routes>
        <Route path='/upload' element={<Upload/>}/>
        <Route path='/' element={<Dashboard/>}/>
      </Routes>
    </Router>
  )
}

export default App
