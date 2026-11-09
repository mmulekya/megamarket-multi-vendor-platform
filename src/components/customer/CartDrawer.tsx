import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Store,
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onCheckout }) => {
  const { cart, removeFromCart, updateCartQuantity, clearCart, cartTotal, formatPrice } =
    useStore();

  if (!isOpen) return null;

  const shippingFee = cartTotal > 5000 || cartTotal === 0 ? 0 : 250;
  const grandTotal = cartTotal + shippingFee;

  // Find unique vendors represented in this cart
  const vendorsInCart = Array.from(new Set(cart.map((item) => item.product.vendorName)));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
              <h2 className="text-base font-bold text-slate-900">
                Shopping Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2 py-1"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Multi-Vendor Bundle Note */}
          {vendorsInCart.length > 1 && (
            <div className="bg-blue-50 px-4 py-2 border-b border-blue-100 text-xs text-blue-900 flex items-center gap-2">
              <Store className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>
                Your order bundles items from <strong>{vendorsInCart.length} different vendors</strong>.
                Each vendor will prepare their item independently!
              </span>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-slate-400">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-700">Your cart is empty</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Discover electronics, African fashion, and fresh produce from verified merchants.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.productId}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex gap-3 relative group"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.title}
                    className="w-18 h-18 rounded-xl object-cover border border-slate-200 bg-white flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded truncate max-w-[150px]">
                          {item.product.vendorName}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 line-clamp-1 mt-1">
                        {item.product.title}
                      </h4>
                      <div className="text-xs font-semibold text-slate-900 mt-0.5">
                        {formatPrice(item.price)}
                      </div>
                    </div>

                    {/* Quantity Selector & Item Total */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-white text-xs">
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                          className="px-2 py-1 hover:bg-slate-100 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 font-bold text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                          className="px-2 py-1 hover:bg-slate-100 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-xs font-extrabold text-orange-600">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery (Nairobi Express)</span>
                  <span className="font-semibold text-slate-800">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700 font-bold">FREE</span>
                    ) : (
                      formatPrice(shippingFee)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1.5 border-t border-slate-200">
                  <span>Total Amount</span>
                  <span className="text-orange-600">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onCheckout();
                }}
                className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm shadow-md shadow-orange-600/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Protected by Safaricom Daraja STK Sandbox</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
