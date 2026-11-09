import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product, Review } from '../../types';
import {
  X,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Store,
  Plus,
  Minus,
  Check,
  Sparkles,
  Smartphone,
  MessageSquare,
  ThumbsUp,
  Send,
  HelpCircle,
  Bot,
  Loader2,
  Calendar,
} from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onProceedToCheckout?: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onProceedToCheckout,
}) => {
  const { addToCart, formatPrice, vendors, currentUser, addReview } = useStore();

  const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'ai-advisor'>('details');
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Review Form State
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [reviewerName, setReviewerName] = useState(currentUser?.fullName || '');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState<string | null>(null);

  // AI Review Summary State
  const [aiSummary, setAiSummary] = useState<{
    summary: string;
    overallSentiment: string;
    pros: string[];
    considerations: string[];
  } | null>(null);
  const [isLoadingAiSummary, setIsLoadingAiSummary] = useState(false);
  const [aiSummaryError, setAiSummaryError] = useState<string | null>(null);

  // AI Product Advisor State
  const [advisorQuestion, setAdvisorQuestion] = useState('');
  const [advisorChat, setAdvisorChat] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: `Hello! I'm your AI Shopping Advisor for this ${product?.title || 'product'}. Ask me anything about specifications, compatibility, warranties, or delivery!`,
    },
  ]);
  const [isAskingAdvisor, setIsAskingAdvisor] = useState(false);

  if (!product) return null;

  const vendor = vendors.find((v) => v.id === product.vendorId);
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const isOutOfStock = product.stock <= 0;
  const reviews: Review[] = product.reviews || [];

  // Calculate star rating distribution
  const ratingCounts = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => Math.round(r.rating) === stars).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { stars, count, percentage };
  });

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 1500);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    if (onProceedToCheckout) {
      onClose();
      onProceedToCheckout();
    }
  };

  // Submit customer review
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingReview(true);
    const result = addReview(product.id, {
      rating: newRating,
      comment: newComment.trim(),
      author: reviewerName.trim() || currentUser?.fullName || 'Verified Shopper',
    });

    setIsSubmittingReview(false);
    if (result.success) {
      setReviewMessage('Your review has been verified and posted!');
      setNewComment('');
      setTimeout(() => setReviewMessage(null), 3000);
    }
  };

  // Trigger AI Review Summary via Gemini API endpoint
  const handleGenerateAiSummary = async () => {
    if (reviews.length === 0) return;
    setIsLoadingAiSummary(true);
    setAiSummaryError(null);

    try {
      const response = await fetch('/api/gemini/summarize-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productTitle: product.title,
          categoryName: product.categoryName,
          reviews,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary.');
      }

      const data = await response.json();
      setAiSummary(data);
    } catch (err: any) {
      console.error(err);
      setAiSummaryError('Could not generate AI summary at this moment.');
    } finally {
      setIsLoadingAiSummary(false);
    }
  };

  // Trigger AI Product Advisor Q&A via Gemini API endpoint
  const handleAskAdvisor = async (customQuestion?: string) => {
    const q = (customQuestion || advisorQuestion).trim();
    if (!q || isAskingAdvisor) return;

    const newHistory = [...advisorChat, { role: 'user' as const, text: q }];
    setAdvisorChat(newHistory);
    setAdvisorQuestion('');
    setIsAskingAdvisor(true);

    try {
      const response = await fetch('/api/gemini/product-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product,
          question: q,
          history: advisorChat,
        }),
      });

      if (!response.ok) {
        throw new Error('Advisor request failed.');
      }

      const data = await response.json();
      setAdvisorChat([
        ...newHistory,
        { role: 'assistant', text: data.answer || 'I am ready to assist with any further questions.' },
      ]);
    } catch (err: any) {
      console.error(err);
      setAdvisorChat([
        ...newHistory,
        {
          role: 'assistant',
          text: 'Our AI advisor service is temporarily busy. Please try asking again or reach out to customer care.',
        },
      ]);
    } finally {
      setIsAskingAdvisor(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Top Header Row with Tabs and Close */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-white flex items-center justify-between gap-3">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'details'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Product Overview
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Reviews ({reviews.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('ai-advisor')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'ai-advisor'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-purple-700 bg-purple-50 hover:bg-purple-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>AI Shopping Advisor</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto">
          {/* TAB 1: PRODUCT DETAILS & PURCHASE */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Product Image Section */}
              <div className="p-6 bg-slate-50 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-inner">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  {hasDiscount && (
                    <span className="absolute top-3 left-3 bg-orange-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-md shadow-xs">
                      SALE
                    </span>
                  )}
                </div>

                {/* AI Review Snippet on Detail View */}
                {reviews.length > 0 && (
                  <div className="mt-4 p-3.5 bg-purple-50 rounded-2xl border border-purple-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        AI Verified Sentiment
                      </span>
                      <button
                        onClick={() => setActiveTab('reviews')}
                        className="text-purple-700 font-bold hover:underline text-[11px]"
                      >
                        Read all {reviews.length} reviews →
                      </button>
                    </div>
                    <p className="text-[11px] text-purple-950 leading-relaxed">
                      "{reviews[0]?.comment.slice(0, 110)}..."
                    </p>
                  </div>
                )}
              </div>

              {/* Product Content & Buy Box */}
              <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  {/* Category & Verified Merchant */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-orange-600 font-bold uppercase tracking-wider">
                      {product.categoryName}
                    </span>
                    <span className="text-emerald-800 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold border border-emerald-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Verified Merchant
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 leading-snug">
                    {product.title}
                  </h2>

                  {/* Rating Stars Summary */}
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="ml-1 font-bold text-slate-900">{product.rating}</span>
                    </div>
                    <span className="text-slate-400">•</span>
                    <button
                      onClick={() => setActiveTab('reviews')}
                      className="text-orange-600 hover:underline text-xs font-semibold"
                    >
                      {reviews.length} customer reviews
                    </button>
                    <span className="text-slate-400">•</span>
                    <span className="text-emerald-700 font-semibold text-xs">
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>

                  {/* Price Block */}
                  <div className="bg-orange-50/70 p-4 rounded-2xl border border-orange-100 flex items-baseline gap-3">
                    <span className="text-2xl md:text-3xl font-black text-slate-900">
                      {formatPrice(product.price)}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-slate-400 line-through">
                        {formatPrice(product.originalPrice!)}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Vendor Details */}
                  {vendor && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                      <img
                        src={vendor.logo}
                        alt={vendor.storeName}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="text-xs min-w-0">
                        <div className="font-bold text-slate-900 flex items-center gap-1">
                          <Store className="w-3 h-3 text-blue-600" />
                          {vendor.storeName}
                        </div>
                        <div className="text-slate-500 truncate">{vendor.city}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Purchase Controls */}
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">Quantity</span>
                    <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-slate-50">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1 || isOutOfStock}
                        className="p-2 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center font-bold text-sm text-slate-800">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        disabled={quantity >= product.stock || isOutOfStock}
                        className="p-2 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={handleAddToCart}
                      disabled={isOutOfStock}
                      className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
                        addedSuccess
                          ? 'bg-emerald-600 text-white'
                          : isOutOfStock
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : 'bg-orange-100 hover:bg-orange-200 text-orange-800 border border-orange-200'
                      }`}
                    >
                      {addedSuccess ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Added to Cart!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleBuyNow}
                      disabled={isOutOfStock}
                      className="py-3 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Buy with M-Pesa</span>
                    </button>
                  </div>

                  {/* Guarantees */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-2">
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Doorstep Delivery (Nairobi 24h)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                      <span>7-Day Return Policy</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOMER REVIEWS & RATINGS */}
          {activeTab === 'reviews' && (
            <div className="p-6 sm:p-8 space-y-8">
              {/* Reviews Overview & AI Summary Trigger */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Score & Star Breakdown */}
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 text-center flex flex-col justify-center space-y-2">
                  <div className="text-4xl font-black text-slate-900">{product.rating}</div>
                  <div className="flex justify-center text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(product.rating) ? 'fill-current' : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs font-semibold text-slate-600">
                    Based on {reviews.length} verified buyer reviews
                  </div>
                </div>

                {/* Star Distribution Progress Bars */}
                <div className="md:col-span-2 bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-2 justify-center flex flex-col">
                  {ratingCounts.map(({ stars, count, percentage }) => (
                    <div key={stars} className="flex items-center gap-3 text-xs">
                      <span className="w-12 font-semibold text-slate-700 flex items-center gap-1">
                        {stars} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      </span>
                      <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="w-8 text-right text-slate-500 text-[11px] font-mono">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Review Summary Card */}
              <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 p-5 rounded-3xl border border-purple-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                      <Sparkles className="w-4 h-4 text-amber-300" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-purple-950">
                        AI Customer Sentiment & Insights
                      </h3>
                      <p className="text-xs text-purple-800">
                        Synthesizes feedback from verified Kenyan buyers using Gemini.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateAiSummary}
                    disabled={isLoadingAiSummary || reviews.length === 0}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 self-start sm:self-auto"
                  >
                    {isLoadingAiSummary ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Analyzing Reviews...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>{aiSummary ? 'Refresh AI Summary' : 'Generate AI Summary'}</span>
                      </>
                    )}
                  </button>
                </div>

                {aiSummary && (
                  <div className="pt-2 border-t border-purple-200/60 space-y-3 animate-in fade-in">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-purple-900">Overall Sentiment:</span>
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {aiSummary.overallSentiment}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed bg-white/70 p-3 rounded-xl border border-purple-100">
                      {aiSummary.summary}
                    </p>
                    {aiSummary.pros && aiSummary.pros.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-purple-950 uppercase tracking-wider">
                          Key Strengths:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {aiSummary.pros.map((pro, i) => (
                            <span
                              key={i}
                              className="text-[11px] bg-white text-purple-900 border border-purple-200 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1"
                            >
                              <ThumbsUp className="w-3 h-3 text-emerald-600" />
                              {pro}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {aiSummaryError && (
                  <p className="text-xs text-rose-600">{aiSummaryError}</p>
                )}
              </div>

              {/* Leave a Review Form */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Star className="w-4 h-4 text-orange-600" />
                  Leave Your Rating & Feedback
                </h3>

                {reviewMessage && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{reviewMessage}</span>
                  </div>
                )}

                <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
                  {/* Star Rating Picker */}
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Overall Rating *
                    </label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setNewRating(star)}
                          className="p-1 text-slate-300 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= (hoverRating || newRating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 font-bold text-slate-700">
                        {newRating === 5
                          ? '5 Stars - Excellent'
                          : newRating === 4
                          ? '4 Stars - Very Good'
                          : newRating === 3
                          ? '3 Stars - Average'
                          : newRating === 2
                          ? '2 Stars - Poor'
                          : '1 Star - Terrible'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Your Name</label>
                      <input
                        type="text"
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        placeholder="e.g. Amani Mwangi"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-orange-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Your Review & Experience *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts on build quality, delivery speed, packaging, and performance..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-orange-500 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview || !newComment.trim()}
                    className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-sm flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post Verified Review</span>
                  </button>
                </form>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-900">
                  Customer Comments ({reviews.length})
                </h3>

                {reviews.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                    No reviews yet. Be the first customer to leave feedback on this product!
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{rev.author}</span>
                          {rev.verified && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.2 rounded-full font-semibold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              Verified Buyer
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                          <Calendar className="w-3 h-3" />
                          <span>{rev.date}</span>
                        </div>
                      </div>

                      <div className="flex text-amber-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= rev.rating ? 'fill-current' : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>

                      <p className="text-slate-700 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: AI SHOPPING ADVISOR (PRODUCT Q&A) */}
          {activeTab === 'ai-advisor' && (
            <div className="p-6 sm:p-8 flex flex-col h-[520px] justify-between space-y-4">
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-2xl border border-purple-200 text-xs">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-purple-950">AI Smart Shopping Assistant</h3>
                  <p className="text-purple-800 text-[11px]">
                    Ask detailed questions regarding specifications, compatibility, materials, or
                    shipping.
                  </p>
                </div>
              </div>

              {/* Chat Messages Log */}
              <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                {advisorChat.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex gap-2.5 ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                        AI
                      </div>
                    )}
                    <div
                      className={`max-w-md p-3 rounded-2xl leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-orange-600 text-white rounded-tr-xs'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isAskingAdvisor && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    <span>AI Shopping Advisor is answering...</span>
                  </div>
                )}
              </div>

              {/* Quick Inquiry Chips */}
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <button
                  onClick={() => handleAskAdvisor('Does this product come with warranty?')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors"
                >
                  Warranty coverage?
                </button>
                <button
                  onClick={() => handleAskAdvisor('How fast is delivery to Nairobi?')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors"
                >
                  Delivery speed?
                </button>
                <button
                  onClick={() => handleAskAdvisor('Can I pay on delivery or with M-Pesa?')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-colors"
                >
                  Payment methods?
                </button>
              </div>

              {/* Input Row */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question about this product..."
                  value={advisorQuestion}
                  onChange={(e) => setAdvisorQuestion(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAdvisor()}
                  className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:border-purple-500 outline-none"
                />
                <button
                  onClick={() => handleAskAdvisor()}
                  disabled={isAskingAdvisor || !advisorQuestion.trim()}
                  className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
