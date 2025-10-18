import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate} from 'react-router-dom'
import IntroductionFlow from './pages/IntroductionFlow'
import OnboardingProfile from './pages/OnboardingProfile'
import Home from './pages/Home'
import SignIn from './pages/SignIn'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8347'

interface OnboardingState {
  profileId: string;
  phone: string;
  hasProfileData: boolean;
  hasFinishedInterview: boolean;
  profileData?: {
    firstName: string;
    lastName: string;
    city: string;
    state: string;
  };
}

interface AuthState {
  isLoading: boolean;
  onboardingState: OnboardingState | null;
}

function App() {
  const [authState, setAuthState] = useState<AuthState>({
    isLoading: true,
    onboardingState: null
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const abortController = new AbortController();
    
    const checkAuthAndRedirect = async () => {
      try {
        // Call the onboarding state endpoint - this will tell us if user is authenticated
        const response = await fetch(`${API_URL}/api/account/onboarding-state`, {
          method: 'GET',
          credentials: 'include',
          signal: abortController.signal
        });

        if (response.ok) {
          const onboardingState: OnboardingState = await response.json();
          
          setAuthState({
            isLoading: false,
            onboardingState
          });

          // Redirect logic based on onboarding state
          // TODO, figure out a way to pass the onboardingState to the OnboardingProfile page
          if (!onboardingState.hasProfileData) {
            // User has no profile data, go to onboarding
            navigate('/onboarding');
          } else if (onboardingState.hasProfileData && !onboardingState.hasFinishedInterview) {
            // User has profile data but no finished interview, go to onboarding with existing data
            navigate('/onboarding');
          } else if (onboardingState.hasProfileData && onboardingState.hasFinishedInterview) {
            // User is fully onboarded, go to home
            navigate('/home');
          }
        } else if (response.status === 401) {
          // No valid auth cookie or expired, stay on current route
          setAuthState({
            isLoading: false,
            onboardingState: null
          });
        } else {
          throw new Error(`Failed to check onboarding state: ${response.statusText}`);
        }
      } catch (error) {
        // Don't log aborted requests as errors
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        console.error('Error checking auth state:', error);
        setAuthState({
          isLoading: false,
          onboardingState: null
        });
      }
    };

    checkAuthAndRedirect();

    return () => {
      abortController.abort();
    };
  }, []);

  // Show blank screen while checking authentication
  if (authState.isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-6"/>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-black">
        <Routes>
          <Route path="/" element={<IntroductionFlow />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/onboarding" element={<OnboardingProfile />} />
          <Route path="/home" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App
