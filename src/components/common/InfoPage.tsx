import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Home,
  ChevronRight,
  ShieldAlert,
  Info,
  AlertTriangle,
  BookOpen,
  Send,
  CheckCircle2,
  Loader2,
  Store,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { InfoPageData } from '../../data/infoPages';
import { useStore } from '../../context/StoreContext';

interface InfoPageProps {
  pageData?: InfoPageData | null;
  onBackToShop: () => void;
  requestedSlug?: string;
  onOpenRegisterVendor?: () => void;
  onOpenVendorRoom?: () => void;
}

/**
 * Report an Issue / Counterfeit Interactive Form
 * Submits to validated and rate-limited POST /api/reports
 */
const ReportIssueForm: React.FC = () => {
  const [reportType, setReportType] = useState<'counterfeit' | 'wrong_item' | 'vendor_behaviour' | 'copyright_complaint' | 'other'>('counterfeit');
  const [targetId, setTargetId] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ referenceNumber: string; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Frontend validation before dispatch
    const emailTrimmed = contactEmail.trim();
    if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setError('Please provide a valid contact email address.');
      return;
    }

    const descTrimmed = description.trim();
    if (descTrimmed.length < 20) {
      setError(`Description must be at least 20 characters long (currently ${descTrimmed.length} characters).`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          targetId: targetId.trim() || undefined,
          description: descTrimmed,
          contactEmail: emailTrimmed,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to submit report. Please try again.');
        setIsSubmitting(false);
        return;
      }

      setSuccessData({
        referenceNumber: data.referenceNumber,
        message: data.message,
      });
      setIsSubmitting(false);
    } catch (err: any) {
      setError(err?.message || 'Network error occurred while submitting report.');
      setIsSubmitting(false);
    }
  };

  if (successData) {
    return (
      <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-slate-800 space-y-4">
        <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-base">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <span>Report Successfully Submitted</span>
        </div>
        <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed">
          {successData.message}
        </p>
        <div className="p-4 rounded-xl bg-white border border-emerald-300 text-xs space-y-1.5 font-mono">
          <div className="text-slate-500 font-sans text-xs">Official Tracking Reference:</div>
          <div className="text-base font-extrabold text-emerald-700 tracking-wider">
            {successData.referenceNumber}
          </div>
          <div className="text-[11px] text-slate-500 font-sans pt-1">
            Keep this reference number. Our administrator audits all reports directly in the moderation dashboard.
          </div>
        </div>
        <button
          onClick={() => {
            setSuccessData(null);
            setDescription('');
            setTargetId('');
          }}
          className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors"
        >
          Submit Another Report
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
      <div className="space-y-1">
        <h3 className="font-bold text-sm text-slate-900">Official Report & Counterfeit Form</h3>
        <p className="text-xs text-slate-500">
          Submissions are recorded in the platform database and forwarded to the administrator.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-3 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Report Category *</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 font-medium focus:border-[#F68B1E] focus:outline-none"
          >
            <option value="counterfeit">Counterfeit / Fake Product</option>
            <option value="wrong_item">Wrong Item / Missing Parts Delivered</option>
            <option value="vendor_behaviour">Vendor Behaviour / Off-Platform Demands</option>
            <option value="copyright_complaint">Copyright or content complaint</option>
            <option value="other">Other Inquiry / Safety Violation</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Product ID or Order Number (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. MM-2026-4821 or prod-1731..."
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 focus:border-[#F68B1E] focus:outline-none font-mono text-[11px]"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Your Contact Email Address *
          </label>
          <input
            type="email"
            required
            placeholder="e.g. yourname@example.com"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 focus:border-[#F68B1E] focus:outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block font-semibold text-slate-700">Detailed Description *</label>
            <span
              className={`text-[10px] ${
                description.trim().length >= 20 ? 'text-emerald-600 font-semibold' : 'text-slate-400'
              }`}
            >
              {description.trim().length} / 20 min chars
            </span>
          </div>
          <textarea
            required
            rows={4}
            placeholder="Please describe the issue with as much detail as possible (serial numbers, packaging defects, dates, seller communication)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 focus:border-[#F68B1E] focus:outline-none resize-none leading-relaxed"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 rounded-xl bg-[#F68B1E] hover:bg-[#E07A15] disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying & Submitting Ticket...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Investigation Ticket</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

/**
 * Contact Us Form Component
 * Submits to rate-limited POST /api/contact/send-email
 */
const ContactInquiryForm: React.FC = () => {
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!senderEmail.trim() || !message.trim()) {
      setStatusMessage({ text: 'Please fill in both email and message.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/contact/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: senderName.trim() || 'MegaMarket Visitor',
          senderEmail: senderEmail.trim(),
          subject: subject.trim() || 'General Customer Inquiry',
          message: message.trim(),
          formType: 'contact_page',
        }),
      });

      const data = await res.json();
      if (res.status === 429) {
        setStatusMessage({
          text: data.error || 'Rate limit exceeded: Too many messages sent. Please wait 2 minutes.',
          type: 'error',
        });
        setIsSubmitting(false);
        return;
      }

      if (!res.ok) {
        setStatusMessage({ text: data.error || 'Failed to dispatch message.', type: 'error' });
        setIsSubmitting(false);
        return;
      }

      setStatusMessage({
        text: 'Your message has been dispatched successfully! Our team will reply shortly.',
        type: 'success',
      });
      setMessage('');
      setSubject('');
      setIsSubmitting(false);
    } catch (err: any) {
      setStatusMessage({ text: err?.message || 'Network error occurred.', type: 'error' });
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
      <div className="space-y-1">
        <h3 className="font-bold text-sm text-slate-900">Direct Support Inquiry</h3>
        <p className="text-xs text-slate-500">
          Messages are dispatched securely to support@megamarket.co.ke. Rate-limited to prevent spam.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-rose-50 text-rose-900 border border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Your Full Name</label>
          <input
            type="text"
            placeholder="e.g. Juma Mwangi"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 focus:border-[#F68B1E] focus:outline-none"
          />
        </div>
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Your Email Address *</label>
          <input
            type="email"
            required
            placeholder="e.g. juma@example.com"
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 focus:border-[#F68B1E] focus:outline-none"
          />
        </div>
      </div>

      <div className="text-xs">
        <label className="block font-semibold text-slate-700 mb-1">Subject</label>
        <input
          type="text"
          placeholder="e.g. Order MM-2026-4821 tracking inquiry"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 focus:border-[#F68B1E] focus:outline-none"
        />
      </div>

      <div className="text-xs">
        <label className="block font-semibold text-slate-700 mb-1">Your Message *</label>
        <textarea
          required
          rows={4}
          placeholder="How can we assist you today? Please include any order reference numbers..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 focus:border-[#F68B1E] focus:outline-none resize-none leading-relaxed"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Transmitting Message...</span>
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            <span>Send Customer Support Message</span>
          </>
        )}
      </button>
    </form>
  );
};

/**
 * InfoPage Component
 * Reusable, responsive reader view for documentation, legal, and help pages:
 * - Breadcrumb navigation (Home > Page Name)
 * - Last updated timestamp & page summary
 * - Max readable reading column (max-w-[760px])
 * - Left-hand table of contents on desktop (sticky sidebar)
 * - Accessible section anchors and semantic hierarchy
 * - Interactive forms for #/help/report and #/contact
 * - Role-aware registration callouts for #/sell/guidelines
 * - Friendly 404 fallback for unknown slugs
 */
export const InfoPage: React.FC<InfoPageProps> = ({
  pageData,
  onBackToShop,
  requestedSlug = '',
  onOpenRegisterVendor,
  onOpenVendorRoom,
}) => {
  const { currentUser, isLoggedIn } = useStore();

  // Always scroll to top when page opens or changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pageData?.slug, requestedSlug]);

  // Fallback: 404 Page Not Found
  if (!pageData) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-[#F68B1E] flex items-center justify-center mx-auto mb-4 border border-orange-200">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Page Not Found</h1>
        <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
          We couldn’t find the page <code className="px-2 py-0.5 rounded bg-slate-100 text-xs font-mono">#{requestedSlug}</code>. It may have moved or is currently being prepared.
        </p>
        <button
          onClick={onBackToShop}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#F68B1E] hover:bg-[#E07A15] text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shop</span>
        </button>
      </div>
    );
  }

  const isReportPage = pageData.slug === 'help/report' || requestedSlug.includes('report');
  const isContactPage = pageData.slug === 'contact' || requestedSlug.includes('contact');
  const isGuidelinesPage = pageData.slug === 'sell/guidelines' || requestedSlug.includes('guidelines');

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-10">
      {/* 1. Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <button
          onClick={onBackToShop}
          className="flex items-center gap-1 hover:text-[#F68B1E] transition-colors cursor-pointer"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-semibold text-slate-800 truncate">{pageData.title}</span>
      </nav>

      {/* 2. Top Header & Back Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {pageData.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            {pageData.description}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Updated: {pageData.lastUpdated}</span>
          </div>
          <button
            onClick={onBackToShop}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to shop</span>
          </button>
        </div>
      </div>

      {/* 3. Main Grid Layout: Left TOC on desktop + Content Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Table of Contents (Sticky on Desktop) */}
        {pageData.sections.length > 2 && (
          <aside className="hidden lg:block lg:col-span-4 sticky top-24">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-[#F68B1E]" />
                <span>On this page</span>
              </div>
              <ul className="space-y-1.5 text-xs">
                {pageData.sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="block py-1 px-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-orange-50/60 transition-colors line-clamp-1"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}

        {/* Content Column (max 760px wide for optimal reading typography) */}
        <article className={`w-full ${pageData.sections.length > 2 ? 'lg:col-span-8' : 'lg:col-span-12 max-w-[760px] mx-auto'}`}>
          <div className="max-w-[760px] space-y-8 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
            {pageData.sections.map((section, idx) => (
              <section key={section.id} id={section.id} className="scroll-mt-24 space-y-3.5">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 pb-1.5 border-b border-slate-100 flex items-center gap-2">
                  <span className="text-[#F68B1E] text-sm font-mono">#{idx + 1}</span>
                  <span>{section.title}</span>
                </h2>

                {/* Callout Notice */}
                {section.callout && (
                  <div
                    className={`p-3.5 rounded-xl text-xs font-medium flex items-start gap-2.5 border ${
                      section.callout.type === 'note'
                        ? 'bg-amber-50 text-amber-900 border-amber-200'
                        : section.callout.type === 'warning'
                        ? 'bg-rose-50 text-rose-900 border-rose-200'
                        : 'bg-blue-50 text-blue-900 border-blue-200'
                    }`}
                  >
                    {section.callout.type === 'note' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
                    {section.callout.type === 'warning' && <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                    {section.callout.type === 'info' && <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
                    <span className="leading-relaxed">{section.callout.text}</span>
                  </div>
                )}

                {/* Paragraphs */}
                {section.content.map((p, pIdx) => (
                  <p key={pIdx} className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {p}
                  </p>
                ))}

                {/* Bullets */}
                {section.bullets && section.bullets.length > 0 && (
                  <ul className="space-y-2 pt-1">
                    {section.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F68B1E] shrink-0 mt-2" />
                        <span className="leading-relaxed">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Structured Data Table (e.g. Delivery Options & Timelines) */}
                {section.table && (
                  <div className="overflow-x-auto my-3 rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                          {section.table.headers.map((h, hIdx) => (
                            <th key={hIdx} className="py-2.5 px-3">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {section.table.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50/50">
                            {row.map((cell, cIdx) => (
                              <td
                                key={cIdx}
                                className={`py-2.5 px-3 ${cIdx === 0 ? 'font-semibold text-slate-900' : ''} ${
                                  cIdx === 3 ? 'font-mono font-bold text-[#F68B1E]' : ''
                                }`}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {section.table.caption && (
                      <div className="py-1.5 px-3 bg-slate-50 text-[11px] text-slate-500 italic border-t border-slate-200">
                        {section.table.caption}
                      </div>
                    )}
                  </div>
                )}
              </section>
            ))}

            {/* Interactive Embedded Form for Report an Issue */}
            {isReportPage && (
              <div className="pt-4 border-t border-slate-200">
                <ReportIssueForm />
              </div>
            )}

            {/* Interactive Embedded Form for Contact Us */}
            {isContactPage && (
              <div className="pt-4 border-t border-slate-200">
                <ContactInquiryForm />
              </div>
            )}

            {/* Vendor Registration CTA for Merchant Guidelines */}
            {isGuidelinesPage && (
              <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Store className="w-5 h-5 text-[#F68B1E]" />
                  <h3 className="font-bold text-sm text-slate-900">Ready to Sell on MegaMarket?</h3>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Join hundreds of verified merchants reaching customers across all 47 counties. Zero listing fees, automated delivery fulfillment, and direct M-Pesa payouts.
                </p>

                {!isLoggedIn ? (
                  <button
                    onClick={onOpenRegisterVendor}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F68B1E] hover:bg-[#E07A15] text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                  >
                    <Store className="w-4 h-4" />
                    <span>Register as a Vendor</span>
                  </button>
                ) : currentUser?.role === 'customer' ? (
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg bg-white/80 border border-orange-200 text-xs text-slate-700">
                      You are currently signed in with a <strong>Customer Account</strong> ({currentUser.email}). To open a shop, you can register a dedicated merchant account.
                    </div>
                    <button
                      onClick={onOpenRegisterVendor}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F68B1E] hover:bg-[#E07A15] text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                    >
                      <Store className="w-4 h-4" />
                      <span>Register a Vendor Account</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={onOpenVendorRoom}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F68B1E] hover:bg-[#E07A15] text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
                  >
                    <Store className="w-4 h-4" />
                    <span>Open Your Vendor Room</span>
                  </button>
                )}
              </div>
            )}

            {/* Bottom Back Button */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">MegaMarket Information & Policies</span>
              <button
                onClick={onBackToShop}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Storefront</span>
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};
