import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import login from '../assets/login.jpg';
import { api } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id: '',
    password: '',
    role: 'customer',
    rememberMe: false,
  });

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Format the request body according to the API requirements
      const requestBody = {
        id: formData.id,
        password: formData.password,
        role: formData.role,
      };

      console.log('Sending login request with body:', requestBody); // Debug log

      const data = await api.login(requestBody);
      console.log('Login response data:', data); // Debug log

      // Handle successful login
      console.log('Login successful:', data);

      if (formData.rememberMe) {
        localStorage.setItem('userRole', formData.role);
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userName', data.id);
      }

      // Navigate based on role from form data since it's not in the response
      const userRole = formData.role.toLowerCase();
      console.log('User role from form:', userRole); // Debug log

      if (userRole === 'customer') {
        navigate('/women');
      } else if (userRole === 'seller') {
        navigate('/seller');
      } else {
        console.error('Invalid role:', userRole);
        throw new Error('Invalid role selected');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Image */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-50 items-center justify-center h-screen">
        <div className="mb-80 w-80% h-100% z-10">
          <img
            src={login}
            alt="Fashion model in winter outfit"
            className="object-cover w-full h-full"
          />
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 h-screen">
        <div className="mb-25 max-w-md w-full space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome 👋</h1>
            <p className="mt-2 text-sm text-gray-600">Please login here</p>
          </div>

          {error && (
            <div
              className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Username Input */}
              <div>
                <label
                  htmlFor="id"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  id="id"
                  name="id"
                  type="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.id}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
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
                  placeholder="Enter your password"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700"
                >
                  Select Role
                </label>
                <select
                  id="role"
                  name="role"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="customer">customer</option>
                  <option value="seller">seller</option>
                </select>
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Remember Me
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </div>
          </form>

          {/* Register Button */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="mt-4 text-sm font-medium"
            >
              Don't have an account? <span className=' text-blue-600 hover:text-blue-500'>Register here.</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;