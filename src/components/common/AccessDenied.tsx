import React from 'react';
import { ShieldAlert, ArrowLeft, LogIn, Lock, Store } from 'lucide-react';

interface AccessDeniedProps {
  viewType: 'vendor' | 'admin';
  onBackToStore: () => void;
  onOpenAuth?: () => void;
  isLoggedIn?: boolean;
}

/**
 * AccessDenied Component
 * Displayed when a guest or unauthorized user attempts to access restricted portals
 * (Vendor Room or Admin Panel).
 */
export const AccessDenied: React.FC<AccessDeniedProps> = ({
  viewType,
  onBackToStore,
  onOpenAuth,
  isLoggedIn = false,
}) => {
  const isVendor = viewType === 'vendor';
  const portalTitle = isVendor ? 'Vendor Room & Merchant Dashboard' : 'Marketplace Admin Panel';

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24">
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-8 sm:p-10 text-center">
        {/* Icon Badge */}
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
          {isVendor ? <Store className="w-8 h-8" /> : <Lock className="w-8 h-8" />}
        </div>

        {/* Heading */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold uppercase tracking-wider mb-3">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Access Denied</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
          Restricted Portal Access
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
          {isLoggedIn ? (
            <>
              Your account does not have permission to view the <strong className="text-slate-800">{portalTitle}</strong>.
              This area is restricted to {isVendor ? 'approved vendor merchants' : 'the administrator'}.
            </>
          ) : (
            <>
              You must sign in with an authorized account to access the <strong className="text-slate-800">{portalTitle}</strong>.
              Guests and public visitors can browse products and use the cart freely on the storefront.
            </>
          )}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onBackToStore}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-[#F68B1E] hover:bg-[#E07A15] text-white font-bold text-sm rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Storefront</span>
          </button>

          {!isLoggedIn && onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4 text-[#F68B1E]" />
              <span>Sign In to Account</span>
            </button>
          )}
        </div>

        {/* Security Rule Note */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-400">
          Protected by role-based access control (RBAC). Guest and unauthorized sessions are blocked.
        </div>
      </div>
    </div>
  );
};
