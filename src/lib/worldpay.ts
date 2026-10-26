import { db } from './firebase';
import { dbAdmin } from './firebase-admin';
import { doc, getDoc } from 'firebase/firestore';

export interface WorldpayConfig {
  username: string;
  password?: string;
  entityId: string;
  isLive: boolean;
}

/**
 * Retrieves Worldpay credentials from environment variables first,
 * then falls back to Firestore global settings (`settings/global`).
 */
export async function getWorldpayConfig(): Promise<WorldpayConfig> {
  let username = process.env.WORLDPAY_USERNAME || '';
  let password = process.env.WORLDPAY_PASSWORD || '';
  let entityId = process.env.WORLDPAY_ENTITY_ID || '';
  let isLive: boolean = process.env.WORLDPAY_ENV ? process.env.WORLDPAY_ENV === 'live' : true;

  if (!username || !entityId) {
    if (dbAdmin) {
      const snap = await dbAdmin.collection('settings').doc('global').get();
      if (snap.exists) {
        const d = snap.data() || {};
        if (!username && d.worldpayUsername) username = d.worldpayUsername;
        if (!password && d.worldpayPassword) password = d.worldpayPassword;
        if (!entityId && d.worldpayEntityId) entityId = d.worldpayEntityId;
        if (d.worldpayEnv !== undefined) isLive = d.worldpayEnv === 'live';
      }
    } else {
      try {
        const snap = await getDoc(doc(db, 'settings', 'global'));
        if (snap.exists()) {
          const d = snap.data() || {};
          if (!username && d.worldpayUsername) username = d.worldpayUsername;
          if (!password && d.worldpayPassword) password = d.worldpayPassword;
          if (!entityId && d.worldpayEntityId) entityId = d.worldpayEntityId;
          if (d.worldpayEnv !== undefined) isLive = d.worldpayEnv === 'live';
        }
      } catch (err) {
        console.warn('Could not read Worldpay settings from Firestore client SDK:', err);
      }
    }
  }

  return { username, password, entityId, isLive };
}

/**
 * Creates a Worldpay Hosted Payment Page (HPP) checkout session.
 * Worldpay Access API: POST https://access.worldpay.com/payment_pages
 */
export async function createWorldpayPaymentPage(params: {
  transactionReference: string;
  amount: number; // in GBP
  currencyCode?: string;
  customerEmail: string;
  customerName?: string;
  description: string;
  isSubscription?: boolean;
  successUrl: string;
  failureUrl: string;
  cancelUrl: string;
}): Promise<{ redirectUrl: string }> {
  const config = await getWorldpayConfig();

  if (!config.username || !config.entityId) {
    throw new Error('Worldpay credentials (Username and Merchant Entity ID) are not configured.');
  }

  const endpoint = config.isLive
    ? 'https://access.worldpay.com/payment_pages'
    : 'https://try.access.worldpay.com/payment_pages';

  // Basic auth header: base64(username:password) or username if no password
  const authString = config.password ? `${config.username}:${config.password}` : config.username;
  const authHeader = `Basic ${Buffer.from(authString).toString('base64')}`;

  const amountInMinorUnits = Math.round(params.amount * 100);

  const requestBody: any = {
    transactionReference: params.transactionReference,
    merchant: {
      entity: config.entityId,
    },
    narrative: {
      line1: (params.description || 'DoMeal Order').substring(0, 24),
    },
    value: {
      amount: amountInMinorUnits,
      currency: params.currencyCode || 'GBP',
    },
    resultURLs: {
      successURL: params.successUrl,
      errorURL: params.failureUrl,
      cancelURL: params.cancelUrl,
    },
  };

  // If this is a recurring subscription plan, register a customer agreement and create a card token
  if (params.isSubscription) {
    requestBody.customerAgreement = {
      type: 'subscription',
      storedCardUsage: 'first',
    };
    requestBody.createToken = {
      type: 'worldpay',
      optIn: 'silent',
    };
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/vnd.worldpay.payment_pages-v1.hal+json',
      'Accept': 'application/vnd.worldpay.payment_pages-v1.hal+json',
    },
    body: JSON.stringify(requestBody),
  });

  const resText = await res.text();
  let data: any = {};
  try {
    data = JSON.parse(resText);
  } catch (e) {
    throw new Error(`Worldpay API returned invalid response (${res.status}): ${resText}`);
  }

  if (!res.ok) {
    let errorMsg = data?.message || data?.description || resText || `HTTP ${res.status}`;
    if (Array.isArray(data?.validationErrors) && data.validationErrors.length > 0) {
      const details = data.validationErrors.map((v: any) => `${v.message} (${v.jsonPath})`).join(', ');
      errorMsg += `: ${details}`;
    }
    throw new Error(`Worldpay Error: ${errorMsg}`);
  }

  const redirectUrl =
    data?.url ||
    data?._links?.redirect?.href ||
    data?._links?.['payment_pages:redirect']?.href ||
    data?.redirectUrl;

  if (!redirectUrl) {
    throw new Error('Worldpay did not return a checkout redirect URL.');
  }

  return { redirectUrl };
}
