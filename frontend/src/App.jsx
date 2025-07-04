import { BrowserRouter, Route, Routes } from "react-router-dom"
import Layout from "./components/Layout"
import { Home, LoginPage, RegisterPage } from "./components"
import { Toaster } from 'react-hot-toast'
function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
        <Route index element={<Home/>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  )
}

export default App
