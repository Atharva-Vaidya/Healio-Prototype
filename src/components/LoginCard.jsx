import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { ROLES, ROLE_CONFIG, getRoleFromEmail } from '../utils/roles';
import DemoCredentials from './DemoCredentials';

import { supabase } from '../lib/supabaseClient';

/**
 * handleGoogleSignIn — Placeholder for Google OAuth sign-in.
 * TODO: Integrate Google OAuth via Supabase backend.
 */
async function handleGoogleSignIn() {
  console.log('Google Sign-In clicked — OAuth integration pending.');
  alert('Google Sign-In will be available soon.');
}

export default function LoginCard() {
  const navigate = useNavigate();
  const { login, signUp } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(ROLES.EMPLOYEE);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isFormValid = isValidEmail && password.length >= 6;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isFormValid) return;

    setIsLoading(true);
    try {
      let authResult;
      try {
        authResult = await login(email, password);
      } catch (err) {
        // Auto-signup for demo accounts if user doesn't exist
        if (err.message.includes('Invalid login credentials')) {
          const name = email.split('@')[0].replace(/\./g, ' ');
          const signUpData = await signUp(email, password, name);
          
          // Wait briefly for the DB trigger to create the user profile record
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Update their role to match what they selected in the dropdown
          if (signUpData?.user) {
            await supabase
              .from('users')
              .update({ role: selectedRole, name: name + ' (Demo)' })
              .eq('id', signUpData.user.id);
          }
          
          // Login again after signing up to populate context synchronously
          authResult = await login(email, password);
        } else {
          throw err;
        }
      }

      // authResult now directly contains the profile from our updated AuthContext
      const finalRole = authResult?.profile?.role || selectedRole;

      if (!finalRole || !ROLE_CONFIG[finalRole]) {
        throw new Error(`User role '${finalRole}' is missing or invalid. Please contact administrator.`);
      }

      // Redirect to the correct dashboard
      const dashboardPath = ROLE_CONFIG[finalRole].path;
      navigate(dashboardPath);
    } catch (err) {
      setError(err.message || 'Failed to authenticate');
    } finally {
      setIsLoading(false);
    }
  };

  const onSelectDemoAccount = (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('demo1234');
    setSelectedRole(demoRole);
    setEmailTouched(false);
    setPasswordTouched(false);
    setError('');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in-up stagger-1">
        <div className="flex items-center justify-center mb-6">
          <img src="/healio-logo.svg" alt="Healio" className="h-[42px] w-auto drop-shadow-sm hover:scale-105 transition-transform" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-1">
          Welcome back
        </h2>
        <p className="text-sm text-gray-500">
          Unified Healthcare Access for Employees and Providers
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={onSubmit} noValidate>
        {/* Error message */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 animate-fade-in-up">
            <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Email field */}
        <div className="mb-4 animate-fade-in-up stagger-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm transition-all duration-200 outline-none
                ${
                  emailTouched && !isValidEmail && email
                    ? 'border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                    : 'border-gray-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
                }
              `}
              aria-invalid={emailTouched && !isValidEmail && email ? 'true' : 'false'}
              aria-describedby="email-error"
            />
          </div>
          {emailTouched && !isValidEmail && email && (
            <p id="email-error" className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Please enter a valid email address
            </p>
          )}
        </div>

        {/* Password field */}
        <div className="mb-4 animate-fade-in-up stagger-3">
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <button
              type="button"
              onClick={() => {
                console.log('Forgot password clicked — page not yet implemented.');
                alert('Password reset will be available after backend integration.');
              }}
              className="text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setPasswordTouched(true)}
              className={`w-full pl-11 pr-12 py-3 rounded-xl border text-sm transition-all duration-200 outline-none
                ${
                  passwordTouched && password && password.length < 6
                    ? 'border-red-300 bg-red-50/50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                    : 'border-gray-200 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
                }
              `}
              aria-invalid={passwordTouched && password && password.length < 6 ? 'true' : 'false'}
              aria-describedby="password-error"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {passwordTouched && password && password.length < 6 && (
            <p id="password-error" className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Password must be at least 6 characters
            </p>
          )}
        </div>

        {/* Role selector dropdown */}
        <div className="mb-5 animate-fade-in-up stagger-4">
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            Login as
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-sm transition-all duration-200 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 appearance-none cursor-pointer"
            >
              {Object.entries(ROLE_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>
                  {cfg.icon} {cfg.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <p className="mt-1.5 text-xs text-gray-400">
            Select your role to access the correct dashboard
          </p>
        </div>

        {/* Login button */}
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className={`w-full py-3 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer
            ${
              isFormValid && !isLoading
                ? 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/30 active:scale-[0.98]'
                : 'bg-gray-300 cursor-not-allowed'
            }
          `}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>

        {/* Divider */}
        <div className="relative my-6 animate-fade-in-up stagger-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white text-gray-400 font-medium">
              or continue with
            </span>
          </div>
        </div>

        {/* Google sign-in */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="animate-fade-in-up stagger-5 w-full py-3 px-4 rounded-xl text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 flex items-center justify-center gap-3 shadow-sm cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
        </button>
      </form>

      {/* Demo Credentials */}
      <DemoCredentials onSelectAccount={onSelectDemoAccount} />
    </div>
  );
}
