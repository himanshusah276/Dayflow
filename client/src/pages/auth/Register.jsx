import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Mail, Lock, User, Briefcase, BadgeCheck, AlertCircle, Shield, Users, Check } from 'lucide-react';

export function Register() {
  const [formData, setFormData] = useState({
    employeeId: '',
    email: '',
    password: '',
    role: 'employee',
    firstName: '',
    lastName: '',
    department: 'Engineering',
    designation: 'Software Engineer',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Password rule checks
  const isMinLength = formData.password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);
  const isPasswordValid = isMinLength && hasLetter && hasNumber;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.employeeId || !formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!isPasswordValid) {
      setError('Please choose a password meeting the security criteria.');
      return;
    }

    try {
      setLoading(true);
      const res = await register(formData);
      // Navigate to verification screen with pre-filled email & dev code
      navigate(`/verify-email?email=${encodeURIComponent(formData.email)}&code=${res.devVerificationCode || ''}`);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 font-sans selection:bg-emerald-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/30 text-white font-black text-2xl mb-3">
          D
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Create your Dayflow Account
        </h1>
        <p className="text-sm text-slate-300 mt-1">
          Join your organization's modern HRMS platform
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white/95 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl sm:px-10 border border-white/20">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Your Role <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                    formData.role === 'employee'
                      ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600/30 text-emerald-950 font-semibold'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="employee"
                    checked={formData.role === 'employee'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <Users className={`w-5 h-5 ${formData.role === 'employee' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <div>
                    <p className="text-xs font-bold">Employee</p>
                    <p className="text-[10px] text-slate-500">Self-service dashboard</p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                    formData.role === 'hr_admin'
                      ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600/30 text-emerald-950 font-semibold'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="hr_admin"
                    checked={formData.role === 'hr_admin'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <Shield className={`w-5 h-5 ${formData.role === 'hr_admin' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <div>
                    <p className="text-xs font-bold">HR / Admin</p>
                    <p className="text-[10px] text-slate-500">Company-wide access</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="e.g. Jordan"
                  className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="e.g. Miller"
                  className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Employee ID & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Employee ID <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <BadgeCheck className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    placeholder="EMP-501"
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 uppercase"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Work Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jordan@dayflow.com"
                    className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Department & Designation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Design">Design</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Operations">Operations</option>
                  <option value="Infrastructure">Infrastructure</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="e.g. Frontend Engineer"
                  className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  required
                />
              </div>

              {/* Password criteria chips */}
              <div className="flex flex-wrap gap-2 mt-2">
                <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${isMinLength ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                  <Check className="w-3 h-3" /> At least 8 chars
                </span>
                <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${hasLetter ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                  <Check className="w-3 h-3" /> Contains letters
                </span>
                <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${hasNumber ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                  <Check className="w-3 h-3" /> Contains numbers
                </span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              disabled={!isPasswordValid}
              className="w-full mt-4 font-bold shadow-md shadow-emerald-600/30"
            >
              Complete Registration
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700 underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
