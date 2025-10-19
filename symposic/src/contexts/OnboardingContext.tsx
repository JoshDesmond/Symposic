import React, { createContext, useContext, useState, ReactNode } from 'react'
import { OnboardingState } from '@shared/types'

interface OnboardingContextType {
  onboardingState: OnboardingState | null
  setOnboardingState: (state: OnboardingState | null) => void
  updateProfileData: (profileData: OnboardingState['profileData']) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

interface OnboardingProviderProps {
  children: ReactNode
}

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [onboardingState, setOnboardingState] = useState<OnboardingState | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const updateProfileData = (profileData: OnboardingState['profileData']) => {
    if (onboardingState) {
      setOnboardingState({
        ...onboardingState,
        profileData,
        hasProfileData: true
      })
    }
  }

  const value: OnboardingContextType = {
    onboardingState,
    setOnboardingState,
    updateProfileData,
    isLoading,
    setIsLoading
  }

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  )
}

export const useOnboarding = (): OnboardingContextType => {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}
