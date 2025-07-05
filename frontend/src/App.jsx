import { BrowserRouter, Route, Routes } from "react-router-dom"
import Layout from "./components/Layout"
import { Home, LoginPage, RegisterPage } from "./components"
import { Toaster } from 'react-hot-toast'
import useAuthStore from "./store/authStore"
import { useEffect } from "react"
function App() {

  const { getProfile } = useAuthStore()

  useEffect(() => {
    getProfile();
  },[])
  
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
