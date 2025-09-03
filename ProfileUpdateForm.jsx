import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/authContext';
import { SKILL_OPTIONS } from '../constants/skills';

export default function ProfileUpdateForm() {
  const { currentUser, updateProfile, authLoading, authError } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    role: 'client',
    skills: [],
  });
  const [localError, setLocalError] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        role: currentUser.role || 'client',
        skills:
          currentUser.role === 'professional'
            ? Array.isArray(currentUser.skills)
              ? currentUser.skills
              : []
            : [],
      });
    }
  }, [currentUser]);

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

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillsMultiSelectChange = (e) => {
    const selectedValues = Array.from(e.target.selectedOptions).map(
      (opt) => opt.value
    );
    setFormData((prev) => ({ ...prev, skills: selectedValues }));
  };

  const validate = () => {
    if (!formData.name?.trim()) return 'Name is required.';
    if (isProfessional && (!formData.skills || formData.skills.length === 0)) {
      return 'Please select at least one skill.';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setSuccess('');
    const err = validate();
    if (err) {
      setLocalError(err);
      return;
    }
    try {
      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
    } catch (_) {}
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-2xl font-bold text-gray-900">Update Profile</h2>
            <p className="text-sm text-gray-600 mt-1">
              Update your account information and preferences
            </p>
          </div>

          <form className="p-6 space-y-6" onSubmit={handleSubmit} noValidate>
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
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                {success}
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
                  required
                  placeholder="Enter your full name"
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

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                className="flex-1 inline-flex justify-center items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                type="submit"
                disabled={authLoading}
              >
                {authLoading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </div>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


