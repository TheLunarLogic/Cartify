import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import signup from '../assets/signup.jpg';
import { api } from '../services/api';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    id: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: 'prefer-not-to-say',
    role: 'customer',
    agreeToTerms: false
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await api.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        id: formData.id,
        password: formData.password,
        dateOfBirth: formData.dateOfBirth,
        role: formData.role,
      });

      // Navigate based on role from form data
      if (formData.role === 'customer') {
        navigate('/women');
      } else if (formData.role === 'seller') {
        navigate('/seller');
      } else {
        throw new Error('Invalid role selected');
      }

    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-50 items-center justify-center h-screen">
        <div className="mb-50 w-80% h-100% z-10">
          <img
            src={signup}
            alt="Fashion model in formal wear"
            className="object-cover w-full"
          />
        </div>
      </div>

      {/* Right Column - Signup Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-30 max-w-md w-full space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Account</h1>
            <p className="mt-2 text-sm text-gray-600">Please enter details</p>
          </div>

          {/* Show error message if exists */}
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              {/* Name Row */}
              <div className="flex gap-4">
                {/* First Name */}
                <div className="flex-1">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>

                {/* Last Name */}
                <div className="flex-1">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="id" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <input
                  id="id"
                  name="id"
                  type="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.id}
                  onChange={handleChange}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>

              {/* Role Selection */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Select Role
                </label>
                <select
                  id="role"
                  name="role"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="customer">Customer</option>
                  <option value="seller">Seller</option>
                </select>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-center">
                <input
                  id="agreeToTerms"
                  name="agreeToTerms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                />
                <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-900">
                  I agree to the{' '}
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                    Terms & Conditions
                  </a>
                </label>
              </div>
            </div>

            {/* Update Signup Button to show loading state */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing up...
                  </span>
                ) : (
                  'Sign up'
                )}
              </button>
            </div>

            {/* Login Link - Updated */}
            <div className="text-sm text-center">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer"
              >
                Login here
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;