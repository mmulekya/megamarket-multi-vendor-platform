export interface InfoTable {
  headers: string[];
  rows: string[][];
  caption?: string;
}

export interface InfoSection {
  id: string;
  title: string;
  content: string[]; // paragraphs
  bullets?: string[];
  table?: InfoTable;
  callout?: {
    type: 'note' | 'warning' | 'info';
    text: string;
  };
}

export interface InfoPageData {
  slug: string; // e.g. 'about', 'terms', 'privacy', 'careers', 'help/how-to-shop', etc.
  title: string;
  lastUpdated: string;
  description: string;
  sections: InfoSection[];
}

export const INFO_PAGES: Record<string, InfoPageData> = {
  // 1. About Us
  about: {
    slug: 'about',
    title: 'About MegaMarket',
    lastUpdated: 'November 2026',
    description: 'Connecting verified Kenyan vendors with shoppers countrywide through secure technology and local logistics.',
    sections: [
      {
        id: 'coursework-notice',
        title: 'Project Background',
        content: [
          'MegaMarket is a student project built for an App and Software Development course.',
          'The platform is designed to demonstrate real-world full-stack architecture, including server-enforced role-based access control, session authentication with HTTP-only cookies, tenant isolation for multi-vendor merchants, and tamper-proof price verification.'
        ],
        callout: {
          type: 'note',
          text: 'MegaMarket is a student project built for an App and Software Development course. All policies, product listings, and figures are sample demonstrations.'
        }
      },
      {
        id: 'who-we-are',
        title: 'Who We Are',
        content: [
          'MegaMarket is a Kenyan multi-vendor e-commerce platform engineered to empower local micro, small, and medium enterprises (MSMEs).',
          'Our mission is to bridge the digital commerce divide by connecting vetted local merchants across Nairobi, Mombasa, Kisumu, Nakuru, and all 47 counties with shoppers seeking quality consumer goods, authentic African fashion, and electronics.'
        ]
      },
      {
        id: 'how-it-works-customers',
        title: 'How It Works for Shoppers (3 Simple Steps)',
        content: [
          'Shopping on MegaMarket is designed to be straightforward, safe, and transparent:'
        ],
        bullets: [
          '1. Discover & Browse: Search genuine merchandise organized by category, curated directly from vetted local shops.',
          '2. Secure Server Checkout: Add items to your cart with instant server-verified price calculations and transparent countrywide delivery fees.',
          '3. Safe Local Payment: Complete your purchase securely using Lipa Na M-Pesa STK Push, Card, or Cash on Delivery upon inspection.'
        ]
      },
      {
        id: 'how-it-works-vendors',
        title: 'How It Works for Merchants (3 Simple Steps)',
        content: [
          'We provide Kenyan business owners with an enterprise-grade digital storefront without upfront listing hurdles:'
        ],
        bullets: [
          '1. Register Shop Profile: Fill in your business identity, store description, and dispatch location in under two minutes.',
          '2. Administrator Verification: Our platform administrator inspects your business information to ensure consumer safety and maintain catalog trust.',
          '3. List & Dispatch: Once approved, publish products, manage inventory in the Vendor Room, and fulfill customer orders.'
        ]
      },
      {
        id: 'why-megamarket',
        title: 'Why MegaMarket',
        content: [
          'We focus on trust, performance, and real security rather than marketing fluff:'
        ],
        bullets: [
          'Vetted Merchants: Every vendor undergoes platform administrator review before their catalog appears publicly.',
          'Tamper-Proof Pricing: Item costs and totals are calculated strictly on the backend, neutralizing browser price manipulation.',
          'Zero Upfront Listing Fees: Merchants start for free, fostering grass-roots entrepreneurship across East Africa.',
          'Responsive & Accessible: Built mobile-first to deliver lightning-fast loading across standard Kenyan 3G/4G cellular connections.'
        ]
      }
    ]
  },

  // 2. Terms & Conditions
  terms: {
    slug: 'terms',
    title: 'Terms & Conditions',
    lastUpdated: 'November 2026',
    description: 'Clear, plain-English terms governing accounts, ordering, merchant requirements, and platform liability.',
    sections: [
      {
        id: 'intro',
        title: '1. Introduction & Acceptance',
        content: [
          'Welcome to MegaMarket. By accessing our website, creating an account, or purchasing goods, you agree to comply with and be bound by these Terms and Conditions.',
          'If you disagree with any part of these terms, please refrain from using our marketplace services.'
        ]
      },
      {
        id: 'accounts',
        title: '2. Accounts & Passwords',
        content: [
          'You must provide accurate, current, and complete information during registration.',
          'Passwords must be a minimum of 8 characters. Passwords are never stored in plain text and are securely encrypted using bcrypt (10 rounds) on our servers.',
          'You are responsible for maintaining the confidentiality of your session credentials and for all activities that take place under your account.'
        ]
      },
      {
        id: 'buying-selling',
        title: '3. Buying & Selling Rules',
        content: [
          'Shoppers agree to pay the server-verified order total for any item ordered.',
          'Merchants agree to honor published inventory, prices, and product descriptions.',
          'MegaMarket reserves the right to cancel orders or suspend accounts that engage in fraudulent behavior, price spoofing, or abuse of the return policy.'
        ]
      },
      {
        id: 'prohibited-items',
        title: '4. Prohibited Items',
        content: [
          'The following items cannot be listed or sold on MegaMarket under any circumstances:'
        ],
        bullets: [
          'Counterfeit, replica, or illegally duplicated merchandise',
          'Weapons, ammunition, and hazardous chemicals',
          'Prescription pharmaceuticals and unlicensed health remedies',
          'Stolen property or items infringing on third-party intellectual property rights',
          'Perishable goods that violate sanitary logistics standards'
        ]
      },
      {
        id: 'orders-payments',
        title: '5. Orders & Payments',
        content: [
          'Order pricing is authoritative only when computed and signed by our server quote engine.',
          'Payment options include M-Pesa STK Push (currently test/sandbox mode), major credit/debit cards, and Cash on Delivery.',
          'Orders remain in "Pending" status until verified and acknowledged by the respective merchant.'
        ]
      },
      {
        id: 'cancellations',
        title: '6. Order Cancellations',
        content: [
          'Customers may request cancellation of an order before it transitions to "Shipped" status.',
          'Vendors may cancel an order only if stock is depleted, in which case the buyer must be notified immediately and full payment refunded.'
        ]
      },
      {
        id: 'vendor-responsibilities',
        title: '7. Vendor Responsibilities',
        content: [
          'Vendors must maintain accurate stock counts and ship genuine, working goods.',
          'Newly registered shops are placed in "Pending" status until reviewed by the platform administrator.',
          'Suspended or pending vendors are strictly barred by server middleware from publishing items to the public storefront.'
        ]
      },
      {
        id: 'liability',
        title: '8. Limitation of Liability',
        content: [
          'MegaMarket acts as a multi-vendor platform facilitator connecting buyers and independent merchants.',
          'To the fullest extent permitted by law, MegaMarket shall not be liable for indirect, incidental, or consequential damages resulting from merchant dispatch delays or third-party carrier failures.'
        ]
      },
      {
        id: 'changes',
        title: '9. Changes to Terms',
        content: [
          'We reserve the right to revise these Terms and Conditions periodically. When changes occur, the "Last Updated" date at the top will be updated accordingly.'
        ]
      },
      {
        id: 'governing-law',
        title: '10. Governing Law',
        content: [
          'These Terms and Conditions shall be governed by and construed in accordance with the laws of the Republic of Kenya. Any legal dispute shall be subject to the jurisdiction of the competent courts of Kenya.'
        ]
      },
      {
        id: 'copyright-complaints',
        title: '11. Copyright and content complaints',
        content: [
          'Vendors are solely responsible for ensuring they own or hold valid rights to publish all product photographs, brand names, logos, and descriptions they upload to MegaMarket.',
          'If you believe a listing uses your copyrighted work, trademark, or unauthorized content, please submit a complaint through our Report an Issue page (#/help/report) by selecting "Copyright or content complaint", or email privacy@megamarket.co.ke with the product link or ID and proof of ownership.',
          'Reported listings and content are reviewed by a platform administrator and may be suspended or removed.'
        ]
      }
    ]
  },

  // 3. Privacy Policy
  privacy: {
    slug: 'privacy',
    title: 'Privacy Policy',
    lastUpdated: 'November 2026',
    description: 'How we collect, protect, and respect your personal information in compliance with the Kenya Data Protection Act, 2019.',
    sections: [
      {
        id: 'commitment',
        title: '1. Our Privacy Commitment',
        content: [
          'MegaMarket respects your privacy and is committed to protecting your personal data in accordance with the Kenya Data Protection Act, 2019.',
          'This policy outlines how your information is collected, used, stored, and safeguarded when you interact with our marketplace.'
        ]
      },
      {
        id: 'data-collected',
        title: '2. Personal Data We Collect',
        content: [
          'We collect only the essential personal information required to deliver e-commerce services:'
        ],
        bullets: [
          'Identity Data: Full name and account persona (customer or vendor).',
          'Contact Information: Email address and telephone number (used for delivery notifications and M-Pesa checkout).',
          'Delivery Details: Shipping address, town/city, and optional dispatch notes.',
          'Transaction Records: Order numbers, items ordered, line item totals, and payment fulfillment status.'
        ]
      },
      {
        id: 'password-security',
        title: '3. Passwords & Cryptographic Storage',
        content: [
          'We never store plain-text passwords under any condition.',
          'All user passwords are encrypted using bcrypt with 10 salt rounds prior to being saved in our server database. Even platform administrators cannot read or decrypt your raw password.'
        ]
      },
      {
        id: 'cookies',
        title: '4. Cookies, Local Storage & No Tracking',
        content: [
          'We use cookies strictly for essential login sessions ("mm_session"), which are HTTP-only and signed with a server secret so client-side scripts cannot read them.',
          'In addition, your browser’s local storage is used solely to remember your shopping cart items ("megamarket_cart_v5") and your chosen display currency ("mm_currency").',
          'We do not use any third-party analytics tools, advertising pixels, behavioral trackers, or session-recording scripts.'
        ]
      },
      {
        id: 'third-party-services',
        title: '5. Third-Party Image Hosts & Server Exchange Rates',
        content: [
          'Product photographs displayed on MegaMarket may load directly from third-party image hosts over HTTPS.',
          'Live currency exchange rates are fetched exclusively by our backend server (not directly from your browser), meaning your browser IP address is not sent to the exchange-rate provider.'
        ]
      },
      {
        id: 'sharing',
        title: '6. Sharing Data with Merchants',
        content: [
          'When you place an order, only the information strictly necessary to fulfill and deliver the merchandise (your name, telephone number, and delivery destination) is shared with the merchant.',
          'Vendors are contractually and legally bound to use this data solely for order fulfillment.'
        ]
      },
      {
        id: 'retention',
        title: '7. Data Retention',
        content: [
          'We retain personal transaction data only for as long as necessary to fulfill consumer warranty needs, dispute resolution, and statutory accounting records under Kenyan law.'
        ]
      },
      {
        id: 'user-rights',
        title: '8. Your Rights Under the Kenya Data Protection Act, 2019',
        content: [
          'As a data subject in Kenya, you have specific legal rights regarding your information under the Kenya Data Protection Act, 2019:'
        ],
        bullets: [
          'Right to Access: You can view your registered profile and order history at any time in the app, or request a copy of your personal data.',
          'Right to Correction: You may update inaccurate personal contact details or merchant shop profiles.',
          'Right to Deletion (Erasure): You may request the deletion of your account and personal records.'
        ]
      },
      {
        id: 'children',
        title: '9. Children',
        content: [
          'MegaMarket is intended strictly for adults aged 18 years and older. We do not knowingly collect personal data from anyone under 18, and registration requires confirmation that you are at least 18 years old.'
        ]
      },
      {
        id: 'privacy-contact',
        title: '10. Privacy Office Contact',
        content: [
          'If you have inquiries, questions, or wish to exercise your data rights under the Kenya Data Protection Act, 2019, please contact our designated privacy desk:'
        ],
        callout: {
          type: 'info',
          text: 'Privacy & Data Protection Desk: privacy@megamarket.co.ke | Telephone: +254 700 123 456'
        }
      }
    ]
  },

  // 4. Careers & News
  careers: {
    slug: 'careers',
    title: 'Careers & News',
    lastUpdated: 'November 2026',
    description: 'Explore opportunities at MegaMarket and read our latest engineering and community updates.',
    sections: [
      {
        id: 'intro',
        title: 'Life at MegaMarket',
        content: [
          'MegaMarket is built by passionate software engineers and logistics problem solvers committed to building honest, reliable e-commerce infrastructure for Kenya and East Africa.',
          'We value clean code, security honesty, and intuitive human experiences.'
        ],
        callout: {
          type: 'note',
          text: 'Sample listings for demonstration: The job openings and news announcements below are sample listings created for academic project review.'
        }
      },
      {
        id: 'open-roles',
        title: 'Sample Job Openings (Demonstration)',
        content: [
          'Here are examples of the technical and operational roles we hire for:'
        ],
        bullets: [
          'Senior Full-Stack Engineer (React 19 + Node.js) — Nairobi (Hybrid) • Focus on high-concurrency order settlement and SQLite data replication.',
          'Merchant Success Lead — Nairobi (On-site) • Onboard and train vetted micro-merchants on catalog photography, dispatch logistics, and customer service.',
          'Application Security Analyst — Nairobi (Remote) • Continual auditing of Row-Level Security, IDOR prevention, and penetration testing of checkout flows.'
        ]
      },
      {
        id: 'sample-news',
        title: 'Marketplace News & Releases',
        content: [
          'Key product milestones and announcements:'
        ],
        bullets: [
          '10 Nov 2026: MegaMarket deploys 6-Point Security Architecture, eliminating client price trust and implementing server-side session cookies.',
          '28 Oct 2026: Expanded county courier integration to support 48-hour delivery to Eldoret, Meru, and Kisii dispatch depots.',
          '15 Oct 2026: Launched AI Product Description Assistant powered by Google Gemini to assist local artisans in creating rich catalog descriptions.'
        ]
      }
    ]
  },

  // 5. How to Shop on MegaMarket
  'help/how-to-shop': {
    slug: 'help/how-to-shop',
    title: 'How to Shop on MegaMarket',
    lastUpdated: 'November 2026',
    description: 'A step-by-step guide to discovering verified items, checking out securely, and tracking your order.',
    sections: [
      {
        id: 'step-1-search',
        title: '1. Search & Filter Genuine Products',
        content: [
          'Start by exploring the storefront. You can use the search bar at the top of the page to find specific products by keyword, or filter by category departments such as Electronics, Fashion, Home & Living, and Beauty.',
          'Every active listing belongs to a verified Kenyan merchant and includes current stock availability and pricing.'
        ]
      },
      {
        id: 'step-2-inspect',
        title: '2. Inspect Product Details & Ratings',
        content: [
          'Click on any product card to open the interactive detail view. Here you can inspect high-resolution product photography, detailed technical specifications, merchant store information, and genuine verified customer reviews.',
          'Review the live stock count to confirm the item is in stock before placing your order.'
        ]
      },
      {
        id: 'step-3-cart',
        title: '3. Add to Cart with Local Persistence',
        content: [
          'Select your desired quantity and click "Add to Cart". The cart drawer will open from the right side of the screen.',
          'Your shopping cart is preserved in your browser’s local storage, meaning your selected items will remain intact if you navigate between pages.'
        ]
      },
      {
        id: 'step-4-checkout',
        title: '4. Server-Verified Checkout',
        content: [
          'When ready, click "Proceed to Checkout". If you are a guest, you will be prompted to sign in or create an account in seconds.',
          'During checkout, our server automatically computes the authoritative pricing, VAT, and accurate shipping fee based on your delivery town, protecting you against unexpected charges.'
        ]
      },
      {
        id: 'step-5-payment',
        title: '5. Select Your Preferred Payment Option',
        content: [
          'MegaMarket supports three payment methods tailored for Kenyan shoppers:'
        ],
        bullets: [
          'Lipa Na M-Pesa STK Push: Enter your Safaricom number to receive a direct prompt on your phone.',
          'Credit / Debit Cards: Pay with Visa or Mastercard via secure card settlement.',
          'Cash on Delivery (COD): Inspect your package upon arrival and pay the delivery courier in cash or via mobile till.'
        ]
      },
      {
        id: 'step-6-tracking',
        title: '6. Track Your Order Live',
        content: [
          'Once confirmed, your order appears immediately under "My Orders" in the top navigation bar.',
          'Track live status updates as your package moves from Pending to Processing, Shipped, and Delivered.'
        ]
      }
    ]
  },

  // 6. Delivery Options & Timelines
  'help/delivery': {
    slug: 'help/delivery',
    title: 'Delivery Options & Timelines',
    lastUpdated: 'November 2026',
    description: 'Overview of delivery coverage, courier partners, estimated timelines, and transparent shipping fees across Kenya.',
    sections: [
      {
        id: 'coverage-zones',
        title: 'Delivery Coverage & Shipping Fees',
        content: [
          'MegaMarket coordinates with leading regional courier networks to provide delivery across all 47 Kenyan counties.',
          'Shipping fees are calculated automatically during checkout based on the destination city and item weight.'
        ],
        table: {
          headers: ['Delivery Zone', 'Covered Areas', 'Estimated Timeline', 'Sample Shipping Fee'],
          rows: [
            ['Nairobi & Environs', 'CBD, Westlands, Kilimani, Karen, Kasarani, Embakasi', 'Same-Day to 24 Hours', 'KES 250'],
            ['Major Urban Towns', 'Mombasa, Kisumu, Nakuru, Eldoret, Thika, Nyeri', '24 – 48 Hours', 'KES 450'],
            ['Other Counties', 'Garissa, Lodwar, Marsabit, Kitui, Wajir, Homabay (all 47)', '48 – 72 Hours', 'KES 650'],
            ['Express Dispatch', 'Select Nairobi shops with express dispatch tags', 'Within 4 Hours', 'KES 400']
          ],
          caption: 'Sample delivery fees and timelines for demonstration purposes.'
        },
        callout: {
          type: 'note',
          text: 'Notice: Shipping rates and estimated delivery timelines shown in the table above are sample values for this demo platform.'
        }
      },
      {
        id: 'door-vs-pickup',
        title: 'Doorstep Delivery vs. Courier Pickup Hubs',
        content: [
          'In major urban areas (Nairobi, Mombasa, Kisumu, Nakuru), orders are dispatched directly to your residential or office doorstep.',
          'For remote towns and non-urban areas, parcels are delivered to verified regional courier collection hubs, where you can present your Order ID and national ID card to pick up your parcel at your convenience.'
        ]
      },
      {
        id: 'dispatch-tracking',
        title: 'Dispatch Notifications & SMS Alerts',
        content: [
          'As soon as a merchant packages your order and hands it to the carrier, the status switches to "Shipped". You will receive SMS updates with the courier waybill number so you can coordinate handover with the rider.'
        ]
      }
    ]
  },

  // 7. Payment & Lipa Na M-Pesa Guide
  'help/payments': {
    slug: 'help/payments',
    title: 'Payment & Lipa Na M-Pesa Guide',
    lastUpdated: 'November 2026',
    description: 'Learn how our Lipa Na M-Pesa STK Push works, plus card and Cash on Delivery payment options.',
    sections: [
      {
        id: 'mpesa-stk-guide',
        title: 'Lipa Na M-Pesa STK Push (Step-by-Step)',
        content: [
          'Lipa Na M-Pesa STK Push provides the fastest, most convenient checkout experience without having to navigate phone menus manually:'
        ],
        bullets: [
          '1. Choose "M-Pesa STK Push" on the checkout screen.',
          '2. Enter your Safaricom mobile phone number (format: 07XX XXX XXX or 01XX XXX XXX).',
          '3. Click "Complete Order". Our server dispatches an automated STK Push request directly to your handset.',
          '4. Check your phone screen: a prompt will appear displaying the merchant name and server-verified order total.',
          '5. Enter your 4-digit secret M-Pesa PIN and press OK.',
          '6. Safaricom sends you an instant confirmation SMS with your transaction reference (e.g., QK89...), and your order screen updates automatically to Paid.'
        ],
        callout: {
          type: 'note',
          text: 'Notice: In this coursework release of MegaMarket, the Lipa Na M-Pesa STK Push runs in test/sandbox simulation mode so that examiners and testers can complete test orders without real funds being deducted.'
        }
      },
      {
        id: 'cards-cod',
        title: 'Credit/Debit Cards & Cash on Delivery',
        content: [
          'We also provide alternative payment methods to suit every preference:'
        ],
        bullets: [
          'Visa & Mastercard: Processed securely through tokenized card gateways with 3D Secure one-time password (OTP) verification.',
          'Cash on Delivery (COD): Available in Nairobi and select town centers. You inspect the parcel upon delivery and pay the courier via cash or M-Pesa till on the spot.'
        ]
      },
      {
        id: 'security-receipts',
        title: 'Payment Receipts & Pricing Authoritativeness',
        content: [
          'MegaMarket enforces server-side pricing authoritativeness. The amount charged during payment matches the server catalog quote exactly. Client-side tampering of cart totals is blocked automatically by backend validation.'
        ]
      }
    ]
  },

  // 8. Returns & Refund Policy
  'help/returns': {
    slug: 'help/returns',
    title: 'Returns & Refund Policy',
    lastUpdated: 'November 2026',
    description: 'Clear rules on our 7-day return window, eligible merchandise, inspection protocols, and refund timelines.',
    sections: [
      {
        id: 'return-window',
        title: '1. The 7-Day Return Guarantee',
        content: [
          'We want you to shop with total peace of mind. MegaMarket offers a 7-day return window starting from the day your package is marked as "Delivered".',
          'If an item is damaged, defective, or not as described, you can request a return or exchange within this period.'
        ]
      },
      {
        id: 'eligible-items',
        title: '2. Eligible vs. Non-Eligible Items',
        content: [
          'To be eligible for a return, items must be in their original packaging with all included accessories, manuals, and tags intact.'
        ],
        bullets: [
          'Eligible for return: Defective electronics, items damaged during shipping, incorrect sizes or colors delivered, merchandise missing parts.',
          'Non-eligible for return: Intimate apparel and underwear, opened cosmetics and personal care items, digital gift cards or software, and items damaged due to customer misuse.'
        ]
      },
      {
        id: 'how-to-request',
        title: '3. How to Request a Return',
        content: [
          'To start a return request:'
        ],
        bullets: [
          '1. Log into your account and open "My Orders" from the navigation header.',
          '2. Locate the order containing the item you wish to return.',
          '3. Alternatively, visit our "Report an Issue" form and submit your Order Number along with photos and a brief description of the defect.',
          '4. Our customer support team will review your claim and issue courier return instructions within 24 hours.'
        ]
      },
      {
        id: 'refund-timeline',
        title: '4. Refund Method & Processing Timelines',
        content: [
          'Once the returned product arrives at our central inspection center and is verified by our team:',
          'M-Pesa refunds are disbursed directly back to the original phone number within 24 to 48 hours.',
          'Card refunds are initiated through your issuing bank within 3 to 5 business days.'
        ]
      },
      {
        id: 'shipping-cost',
        title: '5. Who Pays for Return Shipping?',
        content: [
          'If the return is due to vendor error, damaged transit, or a manufacturing defect, MegaMarket covers 100% of the return shipping costs.',
          'If a return is initiated due to customer change of mind or personal preference, the buyer covers the standard courier return fee.'
        ]
      }
    ]
  },

  // 9. Report an Issue / Counterfeit
  'help/report': {
    slug: 'help/report',
    title: 'Report an Issue / Counterfeit Product',
    lastUpdated: 'November 2026',
    description: 'Submit an investigation ticket regarding counterfeit items, wrong deliveries, or merchant conduct.',
    sections: [
      {
        id: 'anti-counterfeit-commitment',
        title: 'Zero Tolerance for Counterfeit Merchandise',
        content: [
          'MegaMarket enforces a strict anti-counterfeit policy. All merchants must supply genuine, authentic goods.',
          'If you suspect a product listed or received is counterfeit, defective, or mislabeled, please report it immediately using the verified form below. Every report is audited directly by the platform administrator.'
        ]
      },
      {
        id: 'report-categories',
        title: 'Report Categories We Investigate',
        content: [
          'Our investigation team handles the following ticket categories:'
        ],
        bullets: [
          'Counterfeit Product: Suspicion or proof of fake, cloned, or replica merchandise.',
          'Wrong Item Delivered: Received a completely different brand, model, color, or condition.',
          'Vendor Behaviour: Unprofessional conduct, price gouging, off-platform payment requests, or failure to dispatch.',
          'Copyright or content complaint: Unauthorized use of copyrighted product photography, brand artwork, or misleading listing descriptions.',
          'Other Concerns: Unsafe merchandise, policy breaches, or listing errors.'
        ]
      },
      {
        id: 'copyright-complaints',
        title: 'Copyright and content complaints',
        content: [
          'Vendors are responsible for all product images, logos, and descriptions they upload to MegaMarket.',
          'To report infringing or unauthorized content, choose "Copyright or content complaint" in the form below and include the product ID or listing details along with your contact email.',
          'All complaints are reviewed by a platform administrator, and reported items found to infringe rights or violate policy may be removed.'
        ]
      },
      {
        id: 'interactive-form-section',
        title: 'Submit an Official Report Ticket',
        content: [
          'Please provide detailed information below. All submissions are stored in our secure database with a unique reference number (REP-2026-XXXX) for administrative investigation.'
        ]
      }
    ]
  },

  // 10. Merchant Guidelines
  'sell/guidelines': {
    slug: 'sell/guidelines',
    title: 'Merchant Guidelines',
    lastUpdated: 'November 2026',
    description: 'Clear listing standards, administrator vetting rules, and seller responsibilities for the MegaMarket marketplace.',
    sections: [
      {
        id: 'registration-flow',
        title: '1. Registering Your Store Profile',
        content: [
          'Any legitimate business owner in Kenya can register to sell on MegaMarket with zero upfront fees.',
          'During registration, provide your business trade name, store description, dispatch phone number, and physical city (e.g. Nairobi, Mombasa, Kisumu).'
        ]
      },
      {
        id: 'admin-approval',
        title: '2. Mandatory Administrator Review Step',
        content: [
          'To protect consumer trust and keep our marketplace free from scams, all newly registered merchant shops are placed in "Pending" status upon creation.',
          'The platform administrator reviews each vendor application. Only after explicit approval can the merchant access the Vendor Room to publish products to the public catalog.'
        ],
        callout: {
          type: 'info',
          text: 'Notice: Your shop will be reviewed by the administrator before going live. This check protects genuine Kenyan vendors and shoppers alike.'
        }
      },
      {
        id: 'listing-rules',
        title: '3. Product Listing Standards',
        content: [
          'Merchants must uphold high quality when listing catalog items:'
        ],
        bullets: [
          'Clear Photography: Use clear, genuine product photos on clean backgrounds. Do not upload blurry or misleading stock imagery.',
          'Accurate Descriptions: State the exact model, condition, specifications, dimensions, and warranty terms.',
          'Honest & Competitive Pricing: Prices must be transparent and in Kenyan Shillings (KES). Deceptive artificial markups or fake discounts are prohibited.',
          'Live Stock Counts: Keep inventory levels accurate to prevent stockouts and customer disappointments.'
        ]
      },
      {
        id: 'prohibited-merchandise',
        title: '4. Strictly Prohibited Items',
        content: [
          'Vendors are barred from listing or attempting to sell the following items:'
        ],
        bullets: [
          'Counterfeit, knock-off, or replica brand items',
          'Stolen or unauthorized grey-market electronics',
          'Weapons, explosives, and hazardous materials',
          'Prescription pharmaceuticals and unverified herbal supplements',
          'Pirated media or software'
        ]
      },
      {
        id: 'reviews-ratings',
        title: '5. Reviews, Ratings & Seller Reputation',
        content: [
          'Shoppers who complete an order can leave a star rating and written review. Reviews cannot be edited, filtered, or deleted by merchants.',
          'Merchants who maintain ratings above 4.5 receive priority placement on our storefront. Vendors whose ratings fall below 3.0 due to unresolved disputes are subject to review or suspension.'
        ]
      }
    ]
  },

  // 11. Seller Fulfilment Policies
  'sell/fulfilment': {
    slug: 'sell/fulfilment',
    title: 'Seller Fulfilment Policies',
    lastUpdated: 'November 2026',
    description: 'Dispatch timelines, order status lifecycle management, out-of-stock protocol, and payout schedules.',
    sections: [
      {
        id: 'handling-times',
        title: '1. Order Handling & Dispatch Timelines',
        content: [
          'Merchants must confirm and process incoming orders within 12 hours of placement.',
          'Physical handover to courier partners must occur within 24 to 48 hours for standard orders. Fast fulfillment directly boosts your store ranking and repeat customer retention.'
        ]
      },
      {
        id: 'status-lifecycle',
        title: '2. The Order Status Lifecycle Explained',
        content: [
          'Every order item moves through five distinct lifecycle statuses in the Vendor Room:'
        ],
        bullets: [
          'Pending: The customer has placed the order; the merchant must verify inventory and accept the order.',
          'Processing: The merchant is actively packing the item, attaching shipping waybills, and preparing parcel dispatch.',
          'Shipped: The parcel has been handed over to the courier partner; tracking information is live.',
          'Delivered: The buyer has successfully received the package; this unlocks merchant payout eligibility.',
          'Cancelled: The order was voided prior to dispatch due to customer cancellation or inventory depletion.'
        ]
      },
      {
        id: 'out-of-stock-protocol',
        title: '3. Out-of-Stock Protocol',
        content: [
          'If an ordered product is unexpectedly out of stock, the merchant must immediately set the catalog stock to 0 in the Vendor Room and notify the customer or admin support within 4 hours.',
          'Repeated failure to fulfill accepted orders due to stockouts will lead to vendor shop suspension.'
        ]
      },
      {
        id: 'commission-payouts',
        title: '4. Commission & Weekly Payouts',
        content: [
          'MegaMarket operates on a transparent commission model with zero recurring monthly subscription fees:'
        ],
        bullets: [
          'Platform Commission: 10% platform marketplace fee deducted from the item subtotal (sample rate for this demo).',
          'Merchant Payout: 90% net earnings disbursed weekly directly to the vendor’s registered M-Pesa account.',
          'Payout Schedule: Settlement takes place every Monday for all orders confirmed as "Delivered" during the prior week.'
        ],
        callout: {
          type: 'note',
          text: 'Notice: The 10% commission figure is a sample rate for demonstration purposes in this coursework project.'
        }
      }
    ]
  },

  // 12. Contact Us
  contact: {
    slug: 'contact',
    title: 'Contact Us',
    lastUpdated: 'November 2026',
    description: 'Direct phone, email, physical office address, and our secure inquiry desk.',
    sections: [
      {
        id: 'channels',
        title: 'Customer Care & Operational Desks',
        content: [
          'Our friendly support team is based in Nairobi and ready to assist you with order tracking, merchant onboarding, or payment queries.'
        ],
        bullets: [
          'Telephone Support: +254 700 123 456 (Monday – Saturday: 08:00 – 19:00 EAT, Sunday: 10:00 – 16:00 EAT)',
          'Customer Support Email: support@megamarket.co.ke',
          'Merchant Verification Desk: vendors@megamarket.co.ke',
          'Physical Address: MegaMarket Hub, Kimathi Street, Nairobi CBD, Kenya'
        ]
      },
      {
        id: 'inquiry-form-section',
        title: 'Send Us an Inquiry Message',
        content: [
          'Have a question or feedback? Use the verified form below to transmit your message securely to our team. Submissions are rate-limited to 3 requests per 2 minutes to protect against automated spam.'
        ]
      }
    ]
  },

  // 13. Security Architecture
  security: {
    slug: 'security',
    title: 'Platform Security & Technical Hardening',
    lastUpdated: 'November 2026',
    description: 'A factual explanation of the security mechanisms genuinely implemented in the MegaMarket codebase.',
    sections: [
      {
        id: 'truth-in-security',
        title: 'Our Commitment to Security Honesty',
        content: [
          'We believe in total transparency. This page describes ONLY the security features and technical protections genuinely enforced in our codebase.',
          'We do not claim marketing buzzwords or third-party enterprise compliance that is not backed up by real, verifiable server-side code.'
        ]
      },
      {
        id: 'bcrypt-hashing',
        title: '1. Password Hashing with bcrypt (10 Rounds)',
        content: [
          'Passwords are never stored in plain text anywhere on our systems. When an account is created or password changed, it is hashed on the Node.js server using bcryptjs with 10 cryptographic salt rounds.',
          'Even in the event of an unauthorized database dump, password hashes cannot be converted back to plaintext.'
        ]
      },
      {
        id: 'http-only-cookies',
        title: '2. HTTP-Only Session Cookies (XSS Defense)',
        content: [
          'User authentication sessions are maintained through secure, HTTP-only cookies ("mm_session") signed by a server secret.',
          'Because HTTP-only cookies cannot be read by JavaScript executing in the browser (`document.cookie`), session tokens are immune to theft via Cross-Site Scripting (XSS) attacks.'
        ]
      },
      {
        id: 'server-role-checks',
        title: '3. Server-Enforced Role-Based Access Control (RBAC)',
        content: [
          'All protected operations (e.g. approving a vendor, deleting a user, updating store status) are enforced on the Node.js backend using Express middleware (`requireAuth` and `requireRole("admin")`).',
          'Client-side state manipulation cannot elevate permissions, bypass moderation checks, or grant administrative rights.'
        ]
      },
      {
        id: 'authoritative-pricing',
        title: '4. Server-Authoritative Price Calculation',
        content: [
          'MegaMarket never trusts prices or totals sent from the browser during checkout.',
          'When an order is submitted, our backend server looks up every item in the authoritative product database and recomputes the exact subtotal, shipping fee, and VAT, completely neutralizing browser price spoofing.'
        ]
      },
      {
        id: 'rate-limiting',
        title: '5. Sliding-Window Rate Limiting',
        content: [
          'Our server employs sliding-window rate limiters to defend against automated abuse:',
          'Login Endpoint (/api/auth/login): Limited to 5 attempts per 15 minutes per IP to prevent brute-force password guessing.',
          'Contact & Email Endpoints (/api/contact/send-email, /api/reports): Limited to prevent spam flooding and automated submission bots.'
        ]
      },
      {
        id: 'input-validation',
        title: '6. Input Validation & IDOR Protection',
        content: [
          'All API endpoints validate payload fields, string lengths, and email formats.',
          'Insecure Direct Object Reference (IDOR) checks verify that vendors can only modify, delist, or update order items belonging strictly to their own registered store.'
        ]
      },
      {
        id: 'report-security-problem',
        title: 'How to Report a Security Problem',
        content: [
          'If you discover a potential vulnerability or security flaw in the MegaMarket codebase, we appreciate responsible disclosure.',
          'Please report issues directly via our Report an Issue form or email our security desk at security@megamarket.co.ke. We review all reports promptly.'
        ],
        callout: {
          type: 'info',
          text: 'Vulnerability Disclosure: security@megamarket.co.ke | Or submit a ticket via #/help/report'
        }
      }
    ]
  }
};
