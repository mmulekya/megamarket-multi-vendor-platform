import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  User,
  Store,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Info,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

/**
 * AuthModal Component
 * Full-featured authentication dialog connected to the backend API:
 * - Login: Email + Password with Show/Hide toggle, inline validation, error messages & loading state
 * - Register: Customer or Vendor with Full Name, Email, Password + Confirm Password, Show/Hide toggle
 * - Vendor notice: "Your shop will be reviewed by the administrator before going live."
 */
export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { loginWithEmail, registerUser } = useStore();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [registerRole, setRegisterRole] = useState<'customer' | 'vendor'>('customer');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '+254 7',
    storeName: '',
    storeDescription: '',
    city: 'Nairobi',
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registerErrors, setRegisterErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    storeName?: string;
  }>({});

  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validateLogin = () => {
    const errors: { email?: string; password?: string } = {};
    const emailTrimmed = loginEmail.trim();

    if (!emailTrimmed) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!loginPassword) {
      errors.password = 'Password is required.';
    }

    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!validateLogin()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginWithEmail(loginEmail.trim(), loginPassword);
      if (res.success) {
        setFeedback({ message: res.message, type: 'success' });
        setTimeout(() => {
          onClose();
          setFeedback(null);
          setLoginEmail('');
          setLoginPassword('');
          setLoginErrors({});
        }, 800);
      } else {
        setFeedback({ message: res.message, type: 'error' });
      }
    } catch {
      setFeedback({ message: 'An unexpected connection error occurred.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateRegister = () => {
    const errors: {
      fullName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      storeName?: string;
    } = {};

    if (!registerForm.fullName.trim() || registerForm.fullName.trim().length < 2) {
      errors.fullName = 'Full name is required (at least 2 characters).';
    }

    const emailTrimmed = registerForm.email.trim();
    if (!emailTrimmed) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!registerForm.password) {
      errors.password = 'Password is required.';
    } else if (registerForm.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    }

    if (!registerForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (registerForm.password !== registerForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (registerRole === 'vendor' && (!registerForm.storeName.trim() || registerForm.storeName.trim().length < 2)) {
      errors.storeName = 'Store/Shop name is required for vendor registration.';
    }

    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!validateRegister()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerUser({
        fullName: registerForm.fullName.trim(),
        email: registerForm.email.trim(),
        password: registerForm.password,
        phoneNumber: registerForm.phoneNumber,
        role: registerRole,
        storeName: registerForm.storeName.trim(),
        storeDescription: registerForm.storeDescription.trim(),
        city: registerForm.city,
      });

      if (res.success) {
        setFeedback({ message: res.message, type: 'success' });
        setTimeout(() => {
          onClose();
          setFeedback(null);
          setRegisterErrors({});
        }, 1400);
      } else {
        setFeedback({ message: res.message, type: 'error' });
      }
    } catch {
      setFeedback({ message: 'Network error during registration.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {mode === 'login' ? 'Sign In to MegaMarket' : 'Create Your Account'}
            </h2>
            <p className="text-xs text-slate-500">
              {mode === 'login'
                ? 'Access your orders, wishlist, and vendor dashboard'
                : 'Join Kenya’s sovereign multi-vendor marketplace'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-100 p-1">
          <button
            onClick={() => {
              setMode('login');
              setFeedback(null);
              setLoginErrors({});
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 min-h-[40px] ${
              mode === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-4 h-4 text-[#F68B1E]" />
            <span>SIGN IN</span>
          </button>
          <button
            onClick={() => {
              setMode('register');
              setFeedback(null);
              setRegisterErrors({});
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 min-h-[40px] ${
              mode === 'register'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4 text-[#F68B1E]" />
            <span>CREATE ACCOUNT</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`mx-5 mt-4 p-3 rounded-lg text-xs font-semibold flex items-start gap-2 border ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 max-h-[75vh] overflow-y-auto">
          {mode === 'login' ? (
            /* Sign In Form */
            <form onSubmit={handleEmailLogin} className="space-y-4" noValidate>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  E-mail Address *
                </label>
                <input
                  type="email"
                  placeholder="e.g. name@example.com"
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    if (loginErrors.email) setLoginErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  className={`w-full px-3.5 py-2.5 text-sm rounded-lg border outline-none min-h-[44px] transition-colors ${
                    loginErrors.email
                      ? 'border-rose-500 focus:border-rose-600 focus:ring-1 focus:ring-rose-500 bg-rose-50/30'
                      : 'border-slate-300 focus:border-[#F68B1E] focus:ring-1 focus:ring-[#F68B1E]'
                  }`}
                />
                {loginErrors.email && (
                  <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{loginErrors.email}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder="Enter your account password"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (loginErrors.password) setLoginErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    className={`w-full px-3.5 py-2.5 pr-11 text-sm rounded-lg border outline-none min-h-[44px] transition-colors ${
                      loginErrors.password
                        ? 'border-rose-500 focus:border-rose-600 focus:ring-1 focus:ring-rose-500 bg-rose-50/30'
                        : 'border-slate-300 focus:border-[#F68B1E] focus:ring-1 focus:ring-[#F68B1E]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-md"
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {loginErrors.password && (
                  <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{loginErrors.password}</span>
                  </p>
                )}
              </div>

              <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-800">Seed Accounts Ready to Test:</span>
                <div className="mt-1 space-y-0.5 font-mono text-[10px] text-slate-600">
                  <div>Admin: admin@megamarket.co.ke / AdminPassword2026!</div>
                  <div>Vendor: vendor@megamarket.co.ke / VendorPassword2026!</div>
                  <div>Customer: customer@megamarket.co.ke / CustomerPassword2026!</div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[44px] bg-[#F68B1E] hover:bg-[#E07A15] disabled:opacity-60 text-white font-bold text-sm rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>SIGNING IN...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>SIGN IN</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setFeedback(null);
                    setRegisterErrors({});
                  }}
                  className="text-xs text-slate-600 hover:text-[#F68B1E] underline font-medium"
                >
                  Don't have an account yet? Create one here
                </button>
              </div>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-3.5" noValidate>
              {/* Account Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  I want to register as:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRegisterRole('customer');
                      setRegisterErrors((prev) => ({ ...prev, storeName: undefined }));
                    }}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 min-h-[42px] transition-all cursor-pointer ${
                      registerRole === 'customer'
                        ? 'border-[#F68B1E] bg-orange-50 text-[#F68B1E]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Customer Shopper</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRegisterRole('vendor')}
                    className={`py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 min-h-[42px] transition-all cursor-pointer ${
                      registerRole === 'vendor'
                        ? 'border-blue-600 bg-blue-50 text-blue-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    <span>Vendor Merchant</span>
                  </button>
                </div>
              </div>

              {/* Vendor sign-up clear review notice */}
              {registerRole === 'vendor' && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-blue-900 text-xs flex items-start gap-2 animate-in fade-in duration-150">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-bold">Vendor Onboarding Notice: </span>
                    Your shop will be reviewed by the administrator before going live.
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Amani Mwangi"
                  value={registerForm.fullName}
                  onChange={(e) => {
                    setRegisterForm({ ...registerForm, fullName: e.target.value });
                    if (registerErrors.fullName) setRegisterErrors((prev) => ({ ...prev, fullName: undefined }));
                  }}
                  className={`w-full px-3 py-2 text-sm rounded-lg border outline-none min-h-[44px] ${
                    registerErrors.fullName
                      ? 'border-rose-500 focus:border-rose-600 bg-rose-50/30'
                      : 'border-slate-300 focus:border-[#F68B1E]'
                  }`}
                />
                {registerErrors.fullName && (
                  <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{registerErrors.fullName}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="e.g. amani@example.com"
                  value={registerForm.email}
                  onChange={(e) => {
                    setRegisterForm({ ...registerForm, email: e.target.value });
                    if (registerErrors.email) setRegisterErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  className={`w-full px-3 py-2 text-sm rounded-lg border outline-none min-h-[44px] ${
                    registerErrors.email
                      ? 'border-rose-500 focus:border-rose-600 bg-rose-50/30'
                      : 'border-slate-300 focus:border-[#F68B1E]'
                  }`}
                />
                {registerErrors.email && (
                  <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{registerErrors.email}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password * (min 8 characters)
                </label>
                <div className="relative">
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    placeholder="Create a password (min 8 chars)"
                    value={registerForm.password}
                    onChange={(e) => {
                      setRegisterForm({ ...registerForm, password: e.target.value });
                      if (registerErrors.password) setRegisterErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    className={`w-full px-3 py-2 pr-11 text-sm rounded-lg border outline-none min-h-[44px] ${
                      registerErrors.password
                        ? 'border-rose-500 focus:border-rose-600 bg-rose-50/30'
                        : 'border-slate-300 focus:border-[#F68B1E]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-md"
                    aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                  >
                    {showRegisterPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {registerErrors.password && (
                  <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{registerErrors.password}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={registerForm.confirmPassword}
                    onChange={(e) => {
                      setRegisterForm({ ...registerForm, confirmPassword: e.target.value });
                      if (registerErrors.confirmPassword) setRegisterErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    }}
                    className={`w-full px-3 py-2 pr-11 text-sm rounded-lg border outline-none min-h-[44px] ${
                      registerErrors.confirmPassword
                        ? 'border-rose-500 focus:border-rose-600 bg-rose-50/30'
                        : 'border-slate-300 focus:border-[#F68B1E]'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-md"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {registerErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{registerErrors.confirmPassword}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number (for M-Pesa & delivery updates)
                </label>
                <input
                  type="tel"
                  placeholder="+254 7XX XXX XXX"
                  value={registerForm.phoneNumber}
                  onChange={(e) => setRegisterForm({ ...registerForm, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:border-[#F68B1E] outline-none font-mono min-h-[44px]"
                />
              </div>

              {/* Vendor Specific Inputs */}
              {registerRole === 'vendor' && (
                <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 space-y-3 animate-in fade-in duration-150">
                  <div className="text-[11px] text-blue-900 font-bold uppercase tracking-wider">
                    Merchant Shop Details
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Shop / Store Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Nairobi Sound & Tech"
                      value={registerForm.storeName}
                      onChange={(e) => {
                        setRegisterForm({ ...registerForm, storeName: e.target.value });
                        if (registerErrors.storeName) setRegisterErrors((prev) => ({ ...prev, storeName: undefined }));
                      }}
                      className={`w-full px-3 py-2 text-xs rounded-lg border bg-white outline-none min-h-[40px] ${
                        registerErrors.storeName
                          ? 'border-rose-500 focus:border-rose-600'
                          : 'border-slate-300 focus:border-blue-600'
                      }`}
                    />
                    {registerErrors.storeName && (
                      <p className="mt-1 text-xs text-rose-600 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{registerErrors.storeName}</span>
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      City / County
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Nairobi, CBD"
                      value={registerForm.city}
                      onChange={(e) => setRegisterForm({ ...registerForm, city: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:border-blue-600 outline-none min-h-[40px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Shop Description (Optional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Brief description of products sold"
                      value={registerForm.storeDescription}
                      onChange={(e) => setRegisterForm({ ...registerForm, storeDescription: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:border-blue-600 outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[44px] bg-[#F68B1E] hover:bg-[#E07A15] disabled:opacity-60 text-white font-bold text-sm rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>CREATING ACCOUNT...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>
                      {registerRole === 'vendor' ? 'REGISTER VENDOR SHOP' : 'CREATE CUSTOMER ACCOUNT'}
                    </span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

