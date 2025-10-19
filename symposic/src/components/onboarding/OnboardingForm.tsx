import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useOnboarding } from '../../contexts/OnboardingContext'
import { US_STATES } from '../../../../shared/constants'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8347'

// Validation helper functions
const validateName = (value: string): string | true => {
  if (!value.trim()) return 'This field is required'
  if (value.length > 50) return 'Name must be 50 characters or less'
  if (!/^[a-zA-Z\s\-'\.]+$/.test(value)) return 'Name can only contain letters, spaces, hyphens, apostrophes, and periods'
  if (value.trim().length < 2) return 'Name must be at least 2 characters long'
  return true
}

const validateCity = (value: string): string | true => {
  if (!value.trim()) return 'This field is required'
  if (value.length > 100) return 'City name must be 100 characters or less'
  if (!/^[a-zA-Z\s\-'\.]+$/.test(value)) return 'City name can only contain letters, spaces, hyphens, apostrophes, and periods'
  if (value.trim().length < 2) return 'City name must be at least 2 characters long'
  return true
}

interface OnboardingFormProps {
  onNext: () => void
  onBack?: () => void
}

interface FormData {
  firstName: string
  lastName: string
  city: string
  state: string
}

/**
 * Helper function to check if profile data is identical
 */
const isProfileDataIdentical = (
  existing: { firstName: string; lastName: string; city: string; state: string } | undefined,
  newData: FormData
): boolean => {
  if (!existing) return false;
  
  return (
    existing.firstName === newData.firstName &&
    existing.lastName === newData.lastName &&
    existing.city === newData.city &&
    existing.state === newData.state
  );
};

const OnboardingForm: React.FC<OnboardingFormProps> = ({ onNext }) => {
  const { onboardingState, updateProfileData, isLoading } = useOnboarding()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  
  const form = useForm<FormData>({
    defaultValues: {
      firstName: onboardingState?.profileData?.firstName || '',
      lastName: onboardingState?.profileData?.lastName || '',
      city: onboardingState?.profileData?.city || '',
      state: onboardingState?.profileData?.state || ''
    }
  })

  // Update form values when onboardingState changes (e.g., on direct navigation)
  useEffect(() => {
    if (onboardingState?.profileData) {
      form.reset({
        firstName: onboardingState.profileData.firstName || '',
        lastName: onboardingState.profileData.lastName || '',
        city: onboardingState.profileData.city || '',
        state: onboardingState.profileData.state || ''
      })
    }
  }, [onboardingState?.profileData, form])

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    setHasError(false)
    setErrorMessage('')

    // Skip API call if data is identical to existing profile data
    if (isProfileDataIdentical(onboardingState?.profileData, data)) {
      console.log('Profile data is identical, skipping update')
      onNext()
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/account/update-profile-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          city: data.city,
          state: data.state
        })
      })

      if (response.ok) {
        console.log('Profile updated successfully')
        // Update the context with the new profile data
        updateProfileData(data)
        onNext()
      } else {
        const errorData = await response.json()
        setHasError(true)
        setErrorMessage(errorData.error || 'Failed to update profile. Please try again.')
      }
    } catch (error) {
      setHasError(true)
      setErrorMessage('Something went wrong. Please try again.')
      console.error('Error updating profile:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const signInMessage = "Great! Now we'll need some basic information:"
  const returnMessage = "Welcome back! Let's verify your account information:"
  const displayMessage = onboardingState?.profileData ? returnMessage : signInMessage

  // Show loading state while onboarding data is being fetched
  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 shadow-2xl p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-300">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 shadow-2xl p-8">
      <h2 className="text-lg font-medium text-white mb-6 text-center">
        {displayMessage}
      </h2>
      
      {hasError && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
          <p className="text-red-400 text-sm">{errorMessage}</p>
        </div>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="firstName"
              rules={{ validate: validateName }}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-gray-300">First Name</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      maxLength={50}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500" 
                      placeholder="Enter first name"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              rules={{ validate: validateName }}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-gray-300">Last Name</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      maxLength={50}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500" 
                      placeholder="Enter last name"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="city"
              rules={{ validate: validateCity }}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-gray-300">City</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      maxLength={100}
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500" 
                      placeholder="Enter city"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="state"
              rules={{ required: 'State is required' }}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-gray-300">State</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white focus:border-blue-500">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {US_STATES.map((state) => (
                        <SelectItem 
                          key={state.code} 
                          value={state.code}
                          className="text-white hover:bg-gray-700 focus:bg-gray-700"
                        >
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isSubmitting ? 'Saving Profile...' : 'Next'}
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default OnboardingForm