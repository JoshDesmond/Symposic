import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useOnboarding } from '../../contexts/OnboardingContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8347'

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
  const { onboardingState, updateProfileData } = useOnboarding()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  
  // TODO there's a loading issue: On refresh, the onboardingState takes a second to load.
  // The header text will change dynamically, but that causes a stutter
  // The default form values will not populate.
  // I'm not sure the best approach yet but will need to fix this
  // Probably just wait until the formData is loaded until rendering the component
  
  const form = useForm<FormData>({
    defaultValues: {
      firstName: onboardingState?.profileData?.firstName || '',
      lastName: onboardingState?.profileData?.lastName || '',
      city: onboardingState?.profileData?.city || '',
      state: onboardingState?.profileData?.state || ''
    }
  })

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
              rules={{ required: 'First name is required' }}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-gray-300">First Name</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
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
              rules={{ required: 'Last name is required' }}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-gray-300">Last Name</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
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
              rules={{ required: 'City is required' }}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-gray-300">City</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
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
                  <FormControl>
                    <Input 
                      {...field} 
                      className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500" 
                      placeholder="Enter state"
                    />
                  </FormControl>
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