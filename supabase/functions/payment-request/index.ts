import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/cors.ts';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const merchantId = Deno.env.get('ZARINPAL_MERCHANT_ID')!;
const siteUrl = (Deno.env.get('SITE_URL') || '').replace(/\/$/, '');
const apiUrl = Deno.env.get('ZARINPAL_API_URL') || 'https://api.zarinpal.com/pg/v4/payment/request.json';
const gatewayUrl = Deno.env.get('ZARINPAL_GATEWAY_URL') || 'https://www.zarinpal.com/pg/StartPay/';

const admin = createClient(supabaseUrl, serviceKey);

Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!merchantId || !siteUrl || !serviceKey) return json({ error: 'درگاه پرداخت روی سرور تنظیم نشده است.' }, 500);

  try {
    const { orderNumber, phone } = await req.json();
    if (!orderNumber || !phone) return json({ error: 'شماره سفارش و موبایل الزامی است.' }, 400);

    const { data: order, error: oe } = await admin
      .from('orders')
      .select('id,order_number,customer_name,phone,total,payment_method,payment_status')
      .eq('order_number', String(orderNumber).trim().toUpperCase())
      .maybeSingle();

    if (oe) throw oe;
    if (!order) return json({ error: 'سفارش پیدا نشد.' }, 404);
    if (String(order.phone).trim() !== String(phone).trim()) return json({ error: 'اطلاعات سفارش صحیح نیست.' }, 403);
    if (order.payment_method !== 'پرداخت آنلاین') return json({ error: 'این سفارش برای پرداخت آنلاین ثبت نشده است.' }, 400);
    if (order.payment_status === 'موفق') return json({ error: 'این سفارش قبلاً پرداخت شده است.' }, 409);

    const callback = `${supabaseUrl}/functions/v1/payment-callback`;
    const amount = Math.round(Number(order.total) * 10);

    const { data: existing } = await admin
      .from('payment_transactions')
      .select('authority,status')
      .eq('order_id', order.id)
      .eq('provider', 'zarinpal')
      .maybeSingle();

    if (existing?.authority && existing.status === 'pending') {
      return json({ url: gatewayUrl + existing.authority, authority: existing.authority });
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'YadakLandIran/1.0' },
      body: JSON.stringify({
        merchant_id: merchantId,
        amount,
        callback_url: `${callback}?order=${encodeURIComponent(order.order_number)}`,
        description: `پرداخت سفارش ${order.order_number} یدکی لند ایران`,
        metadata: { mobile: String(order.phone) },
      }),
    });

    const result = await response.json();
    const authority = result?.data?.authority;
    const code = result?.data?.code;

    if (!response.ok || code !== 100 || !authority) {
      return json({ error: result?.errors?.message || 'دریافت درگاه پرداخت ناموفق بود.', code }, 502);
    }

    const { error: pe } = await admin.from('payment_transactions').upsert({
      order_id: order.id,
      provider: 'zarinpal',
      authority,
      amount: Number(order.total),
      status: 'pending',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'order_id,provider' });

    if (pe) throw pe;

    return json({ url: gatewayUrl + authority, authority });
  } catch (error) {
    console.error(error);
    return json({ error: error?.message || 'خطای داخلی در ایجاد پرداخت.' }, 500);
  }
});
