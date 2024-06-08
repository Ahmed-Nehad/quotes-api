import "dotenv/config"
import { createPlanResponse, createProductResponse } from "../interfaces/paypal";

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
const environment = process.env.PAYPAL_ENVIRONMENT;
const baseUrl = environment === 'live' ? 'https://api.paypal.com' : 'https://api.sandbox.paypal.com';


/**
 * @returns An access_token required to do any operation with paypal rest api.
 */
export const getAccessToken = async () =>  {
    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Accept-Language': 'en_US',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization':  'Basic ' + Buffer.from(clientId + ":" + clientSecret).toString('base64')
        },
        body: new URLSearchParams({ 'grant_type': 'client_credentials' })
    });

    const data = await response.json();
    return data.access_token;
}

/**
 * @returns A product data contains product id required to make a plan.
 */
export const createProduct = async (info: { name: string, description: string }) => {
    const accessToken = await getAccessToken();
    const response = await fetch(`${baseUrl}/v1/catalogs/products`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            ...info,
            type: "SERVICE",
            category: "SOFTWARE"
        })
    })

    if(!response.ok) return null;

    const data : createProductResponse = await response.json();
    return data;
}

/**
 * @returns A plan data contains plan id required to make subscriptions. 
 */
export const createPlan = async (productId: string, info: { name: string, description: string, interval: "MONTH" | "YEAR", price: number }) => {
    const accessToken = await getAccessToken();
    const response = await fetch(`${baseUrl}/v1/billing/plans`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            product_id: productId,
            name: info.name,
            description: info.description,
            billing_cycles: [
                {
                    frequency: {
                        interval_unit: info.interval,
                        interval_count: 1
                    },
                    tenure_type: "REGULAR",
                    sequence: 1,
                    total_cycles: 0,
                    pricing_scheme: {
                        fixed_price: {
                            value: info.price,
                            currency_code: "USD"
                        }
                    }
                }
            ],
            payment_preferences: {
                auto_bill_outstanding: true,
                payment_failure_threshold: 1
            }
        })
    });

    if(!response.ok) return null;

    const data : createPlanResponse = await response.json();
    return data;
}

export const updatePlan = async (planId: string, newPrice: number) => {
    const accessToken = await getAccessToken();
    const response = await fetch(`${baseUrl}/v1/billing/plans/${planId}/update-pricing-schemes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            pricing_schemes: [
                {
                    billing_cycle_sequence: 1,
                    pricing_scheme: {
                        fixed_price: {
                            value: newPrice,
                            currency_code: "USD"
                        }
                    }
                }
            ]
        })
    })

    return response.ok
}

export const deactivatePlan = async (planId: string) => {
    const accessToken = await getAccessToken();
    const response = await fetch(`${baseUrl}/v1/billing/plans/${planId}/deactivate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
        }
    })

    return response.ok
}

/**
 * @description call this function when a user want to subscribe to a plan.
 * 
 * @returns A subscription data contains approve link required to approve this subscription. 
 */
export const createSubscription = async (planId: string) => {
    const accessToken = await getAccessToken();
    const response = await fetch(`${baseUrl}/v1/billing/subscriptions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            plan_id: planId,
            application_context: {
                brand_name: 'Quotes API',
                locale: 'en-US',
                shipping_preference: 'NO_SHIPPING',
                user_action: 'SUBSCRIBE_NOW',
                return_url: `${process.env.URL}/v1/subscriptions/return`,
                cancel_url: `${process.env.URL}/v1/subscriptions/cancle`,
            },
        }),
    });

    if(!response.ok) return null;

    const data = await response.json();
    return data;
}

export const getSubscriptionDetails = async (subscriptionId: string) => {
    const accessToken = await getAccessToken();
    const response = await fetch(`${baseUrl}/v1/billing/subscriptions/${subscriptionId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if(!response.ok) return null;

    const data = await response.json();
    return data;
}

export const changeSubscriptionPlan = async (subscriptionId: string, planId: string) => {
    const accessToken = await getAccessToken();
    const response = await fetch(`${baseUrl}/v1/billing/subscriptions/${subscriptionId}/revise`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ plan_id: planId }),
    });

    if(!response.ok) return null;

    const data = await response.json();
    return data;
}

export const cancelSubscription = async (subscriptionId: string, reason?: string) => {
    const accessToken = await getAccessToken();
    const response = await fetch(`${baseUrl}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            reason: reason || 'Customer requested cancellation.',
        }),
    });

    return response.ok
}