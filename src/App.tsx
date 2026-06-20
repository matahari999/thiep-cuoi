import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Invitation from './pages/Invitation'
import Order from './pages/Order'
import Admin from './pages/Admin'
import Create from './pages/Create'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/create" element={<Create />} />
      <Route path="/v/:d" element={<Invitation />} />
      <Route path="/:slug" element={<Invitation />} />
      <Route path="/dat-hang" element={<Order />} />
      <Route path="/admin/*" element={<Admin />} />
    </Routes>
  )
}
