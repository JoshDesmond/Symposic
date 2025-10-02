import React from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

interface OnboardingFormProps {
  onNext: () => void
}

interface FormData {
  firstName: string
  lastName: string
  phoneNumber: string
  city: string
  state: string
}

const OnboardingForm: React.FC<OnboardingFormProps> = ({ onNext }) => {
  const form = useForm<FormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      city: '',
      state: ''
    }
  })

  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data)
    onNext()
  }

  return (
    <div className="max-w-lg mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 shadow-2xl p-8">
      <h2 className="text-xl font-medium text-white mb-6 text-center">
        First, we'll need some basic information:
      </h2>
      
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

          <FormField
            control={form.control}
            name="phoneNumber"
            rules={{ required: 'Phone number is required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Phone Number</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    type="tel"
                    className="bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:border-blue-500" 
                    placeholder="Enter phone number"
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

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
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
          >
            Next
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default OnboardingForm