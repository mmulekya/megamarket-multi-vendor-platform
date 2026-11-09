import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { PaymentMethod, Order } from '../../types';
import confetti from 'canvas-confetti';
import {
  X,
  Smartphone,
  CreditCard,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  Truck,
  Check,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { currentUser, cart, cartTotal, createOrder, formatPrice, isLoggedIn } = useStore();

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phoneNumber || '+254 7');
  const [address, setAddress] = useState('Kilimani, Argwings Kodhek Rd, Apt 4B');
  const [city, setCity] = useState('Nairobi');
  const [deliveryNotes, setDeliveryNotes] = useState('Call upon arrival at the gate');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');

  // M-Pesa STK Push Simulation States
  const [stkStage, setStkStage] = useState<'idle' | 'prompt' | 'processing' | 'approved'>('idle');
  const [mpesaPin, setMpesaPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const shippingFee = cartTotal > 5000 || cartTotal === 0 ? 0 : 250;
  const grandTotal = cartTotal + shippingFee;

  // Handle M-Pesa STK trigger
  const handleInitiatePayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !phone || !address || !city) {
      alert('Please fill in all delivery details.');
      return;
    }

    if (paymentMethod === 'mpesa') {
      setStkStage('prompt');
      setMpesaPin('');
      setPinError('');
    } else {
      // Direct placement for Card or COD
      const newOrder = createOrder({
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress: address,
        city,
        deliveryNotes,
        paymentMethod,
        mpesaReceipt: undefined,
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setCompletedOrder(newOrder);
      onOrderSuccess(newOrder);
    }
  };

  // Submit simulated M-Pesa PIN
  const handleConfirmMpesaPin = () => {
    if (mpesaPin.length !== 4) {
      setPinError('Please enter a 4-digit PIN (e.g. 1234)');
      return;
    }

    setStkStage('processing');

    setTimeout(() => {
      const generatedReceipt = `QJH${Math.floor(100000 + Math.random() * 900000)}KE`;

      const newOrder = createOrder({
        customerName: fullName,
        customerEmail: email,
        customerPhone: phone,
        shippingAddress: address,
        city,
        deliveryNotes,
        paymentMethod: 'mpesa',
        mpesaReceipt: generatedReceipt,
      });

      setStkStage('approved');

      // Trigger Confetti Celebration!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        setCompletedOrder(newOrder);
        onOrderSuccess(newOrder);
      }, 1500);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {completedOrder ? 'Order Confirmation' : 'Secure Checkout'}
              </h2>
              <span className="text-xs text-slate-500">
                {completedOrder
                  ? `Order #${completedOrder.orderNumber}`
                  : 'Fast delivery with Safaricom M-Pesa Daraja'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {completedOrder ? (
          /* Order Confirmed View */
          <div className="p-6 sm:p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900">Payment & Order Confirmed!</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Thank you, <strong>{completedOrder.customerName}</strong>! Your order has been
                routed to our multi-vendor fulfillment network.
              </p>
            </div>

            {/* M-Pesa Receipt Card */}
            {completedOrder.mpesaReceipt && (
              <div className="max-w-md mx-auto bg-emerald-50 rounded-2xl p-4 border border-emerald-200 text-left text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-emerald-900">
                  <span className="flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    Safaricom M-Pesa Receipt
                  </span>
                  <span className="font-mono bg-emerald-200/70 px-2 py-0.5 rounded text-emerald-950">
                    {completedOrder.mpesaReceipt}
                  </span>
                </div>
                <div className="text-[11px] text-emerald-800 leading-relaxed font-mono bg-white/70 p-2.5 rounded-lg border border-emerald-100">
                  Confirmed. KES {completedOrder.totalAmount.toLocaleString()} sent to MEGAMARKET
                  ONLINE for Account {completedOrder.orderNumber}.
                </div>
              </div>
            )}

            {/* Items Summary */}
            <div className="max-w-md mx-auto bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left text-xs space-y-2">
              <div className="font-bold text-slate-800 border-b border-slate-200 pb-1.5">
                Items Ordered ({completedOrder.items.length})
              </div>
              <div className="space-y-2">
                {completedOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 truncate">
                      <img
                        src={item.productImage}
                        alt=""
                        className="w-8 h-8 rounded object-cover flex-shrink-0"
                      />
                      <div className="truncate">
                        <span className="font-medium text-slate-800 block truncate">
                          {item.productTitle}
                        </span>
                        <span className="text-[10px] text-blue-600">Sold by {item.vendorName}</span>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 whitespace-nowrap">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleInitiatePayment} className="p-6 space-y-6">
            {/* Step 1: Delivery Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-orange-600" />
                1. Delivery & Contact Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-orange-500 outline-none"
                    placeholder="e.g. Wanjiku Kamau"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    M-Pesa Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-orange-500 outline-none font-mono"
                    placeholder="+254 7XX XXX XXX"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-orange-500 outline-none"
                    placeholder="e.g. Nairobi / Mombasa / Nakuru"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Delivery Address / Apartment *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:border-orange-500 outline-none"
                    placeholder="e.g. Kilimani, Argwings Kodhek Rd"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                2. Select Payment Method
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mpesa')}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    paymentMethod === 'mpesa'
                      ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-emerald-950 flex items-center gap-1">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      M-Pesa STK Push
                    </span>
                    {paymentMethod === 'mpesa' && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    )}
                  </div>
                  <span className="text-[10px] text-emerald-800 mt-2 font-medium">
                    Instant prompt on phone (Daraja Sandbox)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    paymentMethod === 'card'
                      ? 'bg-orange-50 border-orange-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1">
                      <CreditCard className="w-4 h-4 text-orange-600" />
                      Debit/Credit Card
                    </span>
                    {paymentMethod === 'card' && (
                      <span className="w-2 h-2 rounded-full bg-orange-600"></span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-2">Visa / Mastercard 3D Secure</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    paymentMethod === 'cod'
                      ? 'bg-slate-100 border-slate-700 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-1">
                      <Banknote className="w-4 h-4 text-slate-700" />
                      Cash on Delivery
                    </span>
                    {paymentMethod === 'cod' && (
                      <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-2">Pay upon courier arrival</span>
                </button>
              </div>
            </div>

            {/* Order Total Preview & Action */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Rule 1: Server-Verified Price (Anti-Tamper Catalog Protection Active)</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Items ({cart.length}) Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Shipping Fee</span>
                <span>{shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Due (Server Enforced)</span>
                <span className="text-orange-600">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
            >
              {paymentMethod === 'mpesa' ? (
                <>
                  <Smartphone className="w-4 h-4" />
                  <span>Send M-Pesa STK Prompt ({formatPrice(grandTotal)})</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Place Order ({formatPrice(grandTotal)})</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Realistic M-Pesa STK Push Sandbox Simulator Modal */}
        {stkStage !== 'idle' && !completedOrder && (
          <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border-2 border-emerald-500 text-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4" />
                  SAFARICOM M-PESA DARAJA
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800 font-mono">
                  Lipa Na M-Pesa
                </span>
              </div>

              {stkStage === 'prompt' && (
                <div className="space-y-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto animate-pulse">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-left text-xs font-mono leading-relaxed space-y-1">
                    <div className="text-emerald-400 font-bold">
                      Do you want to pay KES {grandTotal.toLocaleString()} to MEGAMARKET?
                    </div>
                    <div className="text-slate-400 text-[11px]">Paybill: 888888</div>
                    <div className="text-slate-400 text-[11px]">Account: MM-{Date.now().toString().slice(-4)}</div>
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="block text-xs font-semibold text-slate-300">
                      Enter M-Pesa PIN:
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      autoFocus
                      placeholder="••••"
                      value={mpesaPin}
                      onChange={(e) => {
                        setMpesaPin(e.target.value.replace(/\D/g, ''));
                        setPinError('');
                      }}
                      className="w-full text-center text-xl tracking-widest font-mono bg-slate-950 border border-slate-700 rounded-xl py-2.5 text-emerald-400 focus:border-emerald-500 outline-none"
                    />
                    {pinError && <p className="text-rose-400 text-[11px]">{pinError}</p>}
                    <p className="text-[10px] text-slate-500">
                      Enter your 4-digit secret PIN to authorize this transaction.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStkStage('idle')}
                      className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmMpesaPin}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl text-xs font-bold"
                    >
                      Authorize Payment
                    </button>
                  </div>
                </div>
              )}

              {stkStage === 'processing' && (
                <div className="py-8 text-center space-y-4">
                  <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">Connecting to Daraja Gateway...</h4>
                    <p className="text-xs text-slate-400">
                      Validating transaction and awaiting webhook confirmation.
                    </p>
                  </div>
                </div>
              )}

              {stkStage === 'approved' && (
                <div className="py-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-emerald-400">Payment Approved!</h4>
                  <p className="text-xs text-slate-300">Generating order snapshot...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
