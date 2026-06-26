import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Invitation from './pages/Invitation'
import Order from './pages/Order'
import Admin from './pages/Admin'
import Create from './pages/Create'
import TemplatePreview from './pages/TemplatePreview'
import Sites from './pages/Sites'
import Pricing from './pages/Pricing'
import Faq from './pages/Faq'
import WeddingLogo from './pages/WeddingLogo'
import LoveStory from './pages/LoveStory'
import Planner from './pages/Planner'
import Affiliate from './pages/Affiliate'
import Help from './pages/Help'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/create" element={<Create />} />
      <Route path="/v/:d" element={<Invitation />} />
      <Route path="/template-preview/:id" element={<TemplatePreview />} />
      <Route path="/sites" element={<Sites />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/faq" element={<Faq />} />
      <Route path="/wedding-logo" element={<WeddingLogo />} />
      <Route path="/love-story" element={<LoveStory />} />
      <Route path="/planner" element={<Planner />} />
      <Route path="/affiliate" element={<Affiliate />} />
      <Route path="/help" element={<Help />} />
      <Route path="/:slug" element={<Invitation />} />
      <Route path="/dat-hang" element={<Order />} />
      <Route path="/admin/*" element={<Admin />} />
    </Routes>
  )
}
