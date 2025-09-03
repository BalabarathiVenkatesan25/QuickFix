import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/authContext';
import { Link, useNavigate } from 'react-router-dom';
import { SKILL_OPTIONS } from '../constants/skills';

const initialState = {
  name: '',
  email: '',
  password: '',
  role: 'client',
  skills: [],
};

export default function RegistrationForm() {
  const { register, authLoading, authError } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialState);
  const [localError, setLocalError] = useState(null);

  const isProfessional = useMemo(
    () => formData.role === 'professional',
    [formData.role]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'role') {
      setFormData((prev) => ({
        ...prev,
        role: value,
        skills: value === 'professional' ? prev.skills : [],
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSkillsMultiSelectChange = (e) => {
    const selectedValues = Array.from(e.target.selectedOptions).map(
      (opt) => opt.value
    );
    setFormData((prev) => ({
      ...prev,
      skills: selectedValues,
    }));
  };

  const validate = () => {
    if (!formData.name?.trim()) return 'Name is required.';
    if (!formData.email?.trim()) return 'Email is required.';
    if (!formData.password?.trim()) return 'Password is required.';
    if (isProfessional && (!formData.skills || formData.skills.length === 0)) {
      return 'Please select at least one skill.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    const err = validate();
    if (err) {
      setLocalError(err);
      return;
    }
    try {
      await register(formData);
      // Redirect to login after successful registration
      navigate('/login');
    } catch (_) {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="text-center">
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
              Create Account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Join QuickFix and connect with service professionals
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
                Sign in here
              </Link>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            {localError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {localError}
              </div>
            )}
            {authError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {authError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors"
                  value={formData.name}
                  onChange={handleChange}
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors"
                  value={formData.password}
                  onChange={handleChange}
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Create a password"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Account Type
                </label>
                <select
                  id="role"
                  name="role"
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="client">Homeowner (I need services)</option>
                  <option value="professional">Professional (I provide services)</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Choose "Professional" to select your service skills
                </p>
              </div>

              {isProfessional && (
                <div>
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                    Service Skills
                  </label>
                  <select
                    id="skills"
                    name="skills"
                    className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors min-h-[120px]"
                    multiple
                    value={formData.skills}
                    onChange={handleSkillsMultiSelectChange}
                    required
                  >
                    {SKILL_OPTIONS.map((skill) => (
                      <option key={skill} value={skill} className="py-1">
                        {skill.charAt(0).toUpperCase() + skill.slice(1)}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Hold Ctrl/Cmd to select multiple skills
                  </p>
                </div>
              )}
            </div>

            <div>
              <button
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                type="submit"
                disabled={authLoading}
              >
                {authLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


