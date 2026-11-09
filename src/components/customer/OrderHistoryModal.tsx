import React from 'react';
import { useStore } from '../../context/StoreContext';
import {
  X,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Store,
  MapPin,
  Calendar,
} from 'lucide-react';
import { OrderStatus } from '../../types';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({ isOpen, onClose }) => {
  const { getCustomerOrders, formatPrice, currentUser } = useStore();

  if (!isOpen) return null;

  const orders = getCustomerOrders();

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Processing':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  const getTimelineStep = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return 1;
      case 'Processing':
        return 2;
      case 'Shipped':
        return 3;
      case 'Delivered':
        return 4;
      default:
        return 1;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-orange-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Order History & Live Tracking
              </h2>
              <span className="text-xs text-slate-500">
                {currentUser ? `Account: ${currentUser.fullName} (${currentUser.email})` : 'Account: Guest Session'}
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

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <Package className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700">No orders placed yet</h3>
              <p className="text-xs text-slate-500">
                When you purchase products via M-Pesa or card, your orders and tracking timeline
                will appear here.
              </p>
            </div>
          ) : (
            orders.map((order) => {
              const currentStep = getTimelineStep(order.status);

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-xs"
                >
                  {/* Order Top Summary */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          {order.orderNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        {order.mpesaReceipt && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-700 font-mono font-medium">
                              M-Pesa: {order.mpesaReceipt}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Total Paid</div>
                      <div className="text-sm font-extrabold text-slate-900">
                        {formatPrice(order.totalAmount)}
                      </div>
                    </div>
                  </div>

                  {/* 4-Step Visual Timeline */}
                  {order.status !== 'Cancelled' && (
                    <div className="py-2">
                      <div className="relative flex items-center justify-between">
                        {/* Connecting bar */}
                        <div className="absolute left-6 right-6 top-3.5 h-1 bg-slate-100 -z-0">
                          <div
                            className="h-full bg-orange-500 transition-all duration-500"
                            style={{
                              width:
                                currentStep === 1
                                  ? '0%'
                                  : currentStep === 2
                                  ? '33%'
                                  : currentStep === 3
                                  ? '66%'
                                  : '100%',
                            }}
                          ></div>
                        </div>

                        {/* Steps */}
                        {[
                          { step: 1, label: 'Order Placed', icon: Clock },
                          { step: 2, label: 'Vendor Packing', icon: Package },
                          { step: 3, label: 'In Transit', icon: Truck },
                          { step: 4, label: 'Delivered', icon: CheckCircle2 },
                        ].map((s) => {
                          const isDone = currentStep >= s.step;
                          const isCurrent = currentStep === s.step;
                          const Icon = s.icon;

                          return (
                            <div
                              key={s.step}
                              className="flex flex-col items-center relative z-10 space-y-1"
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                  isDone
                                    ? 'bg-orange-600 text-white shadow-sm'
                                    : 'bg-white border-2 border-slate-200 text-slate-400'
                                } ${isCurrent ? 'ring-4 ring-orange-200' : ''}`}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <span
                                className={`text-[10px] font-semibold text-center ${
                                  isDone ? 'text-slate-900' : 'text-slate-400'
                                }`}
                              >
                                {s.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Items list */}
                  <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                    <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      Package Items
                    </div>
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 text-xs border-b border-slate-200/60 pb-2 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={item.productImage}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-white border border-slate-200 flex-shrink-0"
                          />
                          <div className="truncate">
                            <span className="font-semibold text-slate-800 block truncate">
                              {item.productTitle}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                              <span className="text-blue-700 font-medium flex items-center gap-1">
                                <Store className="w-2.5 h-2.5" />
                                {item.vendorName}
                              </span>
                              <span>•</span>
                              <span>Qty: {item.quantity}</span>
                              <span>•</span>
                              <span className="font-mono">{formatPrice(item.price)} each</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="font-extrabold text-slate-900 block">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${getStatusBadge(
                              item.status
                            )}`}
                          >
                            Item: {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Destination */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">
                      Destination: {order.shippingAddress}, {order.city}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
