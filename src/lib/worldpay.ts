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
 * Retrieves Worldpay credentials from Firestore global settings (`settings/global`) first
 * so that settings configured dynamically in the Admin Dashboard take precedence,
 * then falls back to environment variables (.env).
 */
export async function getWorldpayConfig(): Promise<WorldpayConfig> {
  let username = '';
  let password = '';
  let entityId = '';
  let isLive = true;
  let hasFirestoreConfig = false;

  if (dbAdmin) {
    try {
      const snap = await dbAdmin.collection('settings').doc('global').get();
      if (snap.exists) {
        const d = snap.data() || {};
        if (d.worldpayUsername?.trim()) username = d.worldpayUsername.trim();
        if (d.worldpayPassword?.trim()) password = d.worldpayPassword.trim();
        if (d.worldpayEntityId?.trim()) entityId = d.worldpayEntityId.trim();
        if (d.worldpayEnv !== undefined && d.worldpayEnv !== '') {
          isLive = d.worldpayEnv === 'live';
        }
        if (username || entityId) {
          hasFirestoreConfig = true;
        }
      }
    } catch (err) {
      console.warn('Could not read Worldpay settings from dbAdmin:', err);
    }
  } else {
    try {
      const snap = await getDoc(doc(db, 'settings', 'global'));
      if (snap.exists()) {
        const d = snap.data() || {};
        if (d.worldpayUsername?.trim()) username = d.worldpayUsername.trim();
        if (d.worldpayPassword?.trim()) password = d.worldpayPassword.trim();
        if (d.worldpayEntityId?.trim()) entityId = d.worldpayEntityId.trim();
        if (d.worldpayEnv !== undefined && d.worldpayEnv !== '') {
          isLive = d.worldpayEnv === 'live';
        }
        if (username || entityId) {
          hasFirestoreConfig = true;
        }
      }
    } catch (err) {
      console.warn('Could not read Worldpay settings from Firestore client SDK:', err);
    }
  }

  // Fall back to environment variables (.env) if not configured in dashboard
  if (!username) username = process.env.WORLDPAY_USERNAME || '';
  if (!password) password = process.env.WORLDPAY_PASSWORD || '';
  if (!entityId) entityId = process.env.WORLDPAY_ENTITY_ID || '';
  if (!hasFirestoreConfig && process.env.WORLDPAY_ENV !== undefined) {
    isLive = process.env.WORLDPAY_ENV === 'live';
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

/**
 * Initiates a subsequent recurring debit for an active subscription with Worldpay.
 * Uses Worldpay Access API payments endpoint for merchant-initiated recurring charges.
 */
export async function chargeWorldpayRecurringPayment(params: {
  transactionReference: string;
  amount: number; // in GBP
  currencyCode?: string;
  customerEmail: string;
  description: string;
}): Promise<{ success: boolean; transactionReference: string; status: string; rawResponse?: any; error?: string }> {
  const config = await getWorldpayConfig();

  if (!config.username || !config.entityId) {
    throw new Error('Worldpay credentials (Username and Merchant Entity ID) are not configured.');
  }

  const endpoint = config.isLive
    ? 'https://access.worldpay.com/payments'
    : 'https://try.access.worldpay.com/payments';

  const authString = config.password ? `${config.username}:${config.password}` : config.username;
  const authHeader = `Basic ${Buffer.from(authString).toString('base64')}`;
  const amountInMinorUnits = Math.round(params.amount * 100);

  const requestBody: any = {
    transactionReference: params.transactionReference,
    merchant: {
      entity: config.entityId,
    },
    instruction: {
      narrative: {
        line1: (params.description || 'DoMeal Renewal').substring(0, 24),
      },
      value: {
        amount: amountInMinorUnits,
        currency: params.currencyCode || 'GBP',
      },
      customerAgreement: {
        type: 'subscription',
        storedCardUsage: 'subsequent',
      },
      paymentInstrument: {
        type: 'card/token',
      },
    },
  };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/vnd.worldpay.payments-v6+json',
        'Accept': 'application/vnd.worldpay.payments-v6+json',
      },
      body: JSON.stringify(requestBody),
    });

    const resText = await res.text();
    let data: any = {};
    try {
      data = JSON.parse(resText);
    } catch {
      data = { rawText: resText };
    }

    if (res.ok || res.status === 200 || res.status === 201 || res.status === 202) {
      return {
        success: true,
        transactionReference: params.transactionReference,
        status: data?.outcome || 'authorized',
        rawResponse: data,
      };
    }

    if (data?.outcome === 'authorized' || data?.outcome === 'settled') {
      return {
        success: true,
        transactionReference: params.transactionReference,
        status: data.outcome,
        rawResponse: data,
      };
    }

    const errorMessage = data?.message || data?.description || resText || `HTTP ${res.status}`;
    console.warn(`[Worldpay Recurring] Charge response for ${params.transactionReference}:`, errorMessage);

    return {
      success: false,
      transactionReference: params.transactionReference,
      status: data?.outcome || 'failed',
      rawResponse: data,
      error: errorMessage,
    };
  } catch (err: any) {
    console.error(`[Worldpay Recurring] Exception on charge ${params.transactionReference}:`, err);
    return {
      success: false,
      transactionReference: params.transactionReference,
      status: 'error',
      error: err.message || 'Unknown network error',
    };
  }
}
