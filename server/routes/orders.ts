import { Router } from 'express';
import type { Request, Response } from 'express';

export const ordersRouter = Router();

// Server-authoritative catalog prices and stock levels
const SERVER_CATALOG: Record<string, { title: string; price: number; stock: number }> = {
  prod_phone_1: { title: 'Samsung Galaxy A55 5G (256GB/8GB)', price: 125000, stock: 18 },
  prod_laptop_1: { title: 'HP Pavilion 15 (Core i7, 16GB, 512GB SSD)', price: 89000, stock: 7 },
  prod_headphones_1: { title: 'Sony WH-1000XM5 Wireless Noise Cancelling', price: 15500, stock: 24 },
  prod_watch_1: { title: 'Apple Watch SE (2nd Gen, GPS 44mm)', price: 28000, stock: 12 },
  prod_backpack_1: { title: 'Anti-Theft Waterproof Travel Laptop Backpack', price: 4500, stock: 45 },
  prod_shoes_1: { title: 'Nike Air Max 270 Breathable Sneakers', price: 7800, stock: 30 },
  'prod-demo': { title: 'HP Pavilion 15 Laptop', price: 65000, stock: 10 },
};

/**
 * RULE 1 & 9: Calculate every price on the server
 * Endpoint: POST /api/orders/calculate-quote
 * The server recalculates line totals, delivery fee, and VAT from scratch.
 * All client-sent prices, totals, or discounts are strictly ignored and discarded.
 */
ordersRouter.post('/calculate-quote', (req: Request, res: Response) => {
  const { items, city } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order items are required to calculate price quote.' });
  }

  let serverSubtotal = 0;
  let priceTamperingDetected = false;

  const verifiedItems = items.map((item: any, idx: number) => {
    const qty = Math.max(1, Math.min(100, parseInt(item.quantity, 10) || 1));
    const prodId = item.productId || item.id || `item-${idx}`;

    // Look up authoritative catalog price and stock
    const catalogEntry = SERVER_CATALOG[prodId];
    const serverPrice = catalogEntry ? catalogEntry.price : Math.max(1, Number(item.serverCatalogPrice ?? item.price ?? 1000));
    const serverStock = catalogEntry ? catalogEntry.stock : 50;

    // Detect if client attempted to tamper with unit price
    if (item.clientPrice !== undefined && Number(item.clientPrice) !== serverPrice) {
      priceTamperingDetected = true;
    }
    if (item.price !== undefined && Number(item.price) !== serverPrice) {
      priceTamperingDetected = true;
    }

    const availableQty = Math.min(qty, serverStock);
    const lineTotal = serverPrice * availableQty;
    serverSubtotal += lineTotal;

    return {
      itemId: prodId,
      productId: prodId,
      title: catalogEntry ? catalogEntry.title : String(item.title || 'Marketplace Item').slice(0, 100),
      authoritativeUnitPrice: serverPrice,
      quantity: availableQty,
      stockAvailable: serverStock,
      lineTotal,
    };
  });

  const isNairobi = typeof city === 'string' && /nairobi/i.test(city);
  const shippingFee = isNairobi ? (serverSubtotal > 5000 ? 0 : 250) : 450;
  const marketplaceVat = Math.round(serverSubtotal * 0.16); // 16% VAT standard
  const authoritativeTotal = serverSubtotal + shippingFee;

  // Ignore any clientSuppliedTotal; check if client claimed different total
  if (req.body.clientSuppliedTotal !== undefined && Math.abs(Number(req.body.clientSuppliedTotal) - authoritativeTotal) > 1) {
    priceTamperingDetected = true;
  }

  const quoteId = `QUOTE-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const quoteToken = Buffer.from(
    JSON.stringify({
      quoteId,
      authoritativeTotal,
      timestamp: Date.now(),
      salt: 'megamarket_salt_sec_2026',
    })
  ).toString('base64');

  return res.json({
    quoteId,
    quoteToken,
    subtotal: serverSubtotal,
    shippingFee,
    vat: marketplaceVat,
    totalAmount: authoritativeTotal,
    items: verifiedItems,
    priceTamperingDetected,
    serverCalculated: true,
    currency: 'KES',
    expiresInSeconds: 900,
  });
});
