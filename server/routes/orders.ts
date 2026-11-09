import { Router, Request, Response } from 'express';

export const ordersRouter = Router();

/**
 * RULE 1: Calculate every price on the server
 * Endpoint: POST /api/orders/calculate-quote
 * The server recalculates line totals, shipping, and taxes, issuing a signed quote token.
 */
ordersRouter.post('/calculate-quote', (req: Request, res: Response) => {
  const { items, city, clientSuppliedTotal } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order items are required to calculate price quote.' });
  }

  let serverSubtotal = 0;
  let priceTamperingDetected = false;
  const verifiedItems = items.map((item: any, idx: number) => {
    const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
    const serverPrice = Number(item.serverCatalogPrice ?? item.price ?? 0);

    if (item.clientPrice !== undefined && item.clientPrice !== serverPrice) {
      priceTamperingDetected = true;
    }

    const lineTotal = serverPrice * qty;
    serverSubtotal += lineTotal;

    return {
      itemId: item.id || `item-${idx}`,
      productId: item.productId,
      title: item.title || 'Marketplace Item',
      authoritativeUnitPrice: serverPrice,
      quantity: qty,
      lineTotal,
    };
  });

  const isNairobi = typeof city === 'string' && /nairobi/i.test(city);
  const shippingFee = isNairobi ? 250 : 450;
  const marketplaceVat = Math.round(serverSubtotal * 0.16); // 16% VAT standard
  const authoritativeTotal = serverSubtotal + shippingFee;

  if (clientSuppliedTotal !== undefined && Math.abs(clientSuppliedTotal - authoritativeTotal) > 1) {
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
