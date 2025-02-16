import { useState } from 'react'
import './App.css'
import {HashRouter as Router, Routes, Route} from "react-router-dom";
import Form from './Form.jsx'
import SignIn from './SignIn.jsx'

function App() {
  //const [count, setCount] = useState(0)

  return (
      <Router>
          <Routes>
              <Route path="/" element={<SignIn />} />
              <Route path="/boardgames" element={<Form />} />
          </Routes>
      </Router>
  )
}

export default App
