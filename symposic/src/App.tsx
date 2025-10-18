import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import IntroductionFlow from './pages/IntroductionFlow'
import OnboardingProfile from './pages/OnboardingProfile'
import Home from './pages/Home'
import SignIn from './pages/SignIn'
import { OnboardingProvider, useOnboarding } from './contexts/OnboardingContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8347'

const AppContent: React.FC = () => {
  const { setOnboardingState, isLoading, setIsLoading } = useOnboarding()
  const navigate = useNavigate()

  useEffect(() => {
    const abortController = new AbortController()
    
    const checkAuthAndRedirect = async () => {
      try {
        // Call the onboarding state endpoint - this will tell us if user is authenticated
        const response = await fetch(`${API_URL}/api/account/onboarding-state`, {
          method: 'GET',
          credentials: 'include',
          signal: abortController.signal
        })

        if (response.ok) {
          const onboardingState = await response.json()
          console.log(`Onboarding state retrieved: ${JSON.stringify(onboardingState)}`)
          setOnboardingState(onboardingState)
          
          // Redirect based on onboarding state
          if (!onboardingState.hasProfileData) {
            navigate('/onboarding')
          } else if (onboardingState.hasProfileData && !onboardingState.hasFinishedInterview) {
            navigate('/onboarding')
          } else if (onboardingState.hasFinishedInterview) {
            navigate('/home')
          }

        } else if (response.status === 401) {
          // No valid auth cookie or expired
          setOnboardingState(null)
          setIsLoading(false)
        } else {
          throw new Error(`Failed to check onboarding state: ${response.statusText}`)
        }
      } catch (error) {
        // Don't log aborted requests as errors
        if (error instanceof Error && error.name === 'AbortError') {
          return
        }
        console.error('Error checking auth state:', error)
        setOnboardingState(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthAndRedirect()

    return () => {
      abortController.abort()
    }
  }, [setOnboardingState, setIsLoading, navigate])

  // Show blank screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-6"/>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Routes>
        <Route path="/" element={<IntroductionFlow />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/onboarding" element={<OnboardingProfile />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <OnboardingProvider>
      <Router>
        <AppContent />
      </Router>
    </OnboardingProvider>
  )
}

export default App
