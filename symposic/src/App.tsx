import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import IntroductionFlow from './pages/IntroductionFlow'
import OnboardingProfile from './pages/OnboardingProfile'


function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black">
        <Routes>
          <Route path="/" element={<IntroductionFlow />} />
          <Route path="/onboarding" element={<OnboardingProfile />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
