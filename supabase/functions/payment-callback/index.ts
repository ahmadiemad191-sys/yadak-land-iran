import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const merchantId = Deno.env.get('ZARINPAL_MERCHANT_ID')!;
const siteUrl = (Deno.env.get('SITE_URL') || '').replace(/\/$/, '');
const verifyUrl = Deno.env.get('ZARINPAL_VERIFY_URL') || 'https://api.zarinpal.com/pg/v4/payment/verify.json';

const admin = createClient(supabaseUrl, serviceKey);

const redirect = (status: string, order: string) =>
  Response.redirect(`${siteUrl}/?payment=${encodeURIComponent(status)}&order=${encodeURIComponent(order)}#track`, 303);

Deno.serve(async req => {
  try {
    if (!siteUrl || !serviceKey || !merchantId) return new Response('Payment server is not configured.', { status: 500 });

    const url = new URL(req.url);
    const orderNumber = String(url.searchParams.get('order') || '').trim().toUpperCase();
    const authority = String(url.searchParams.get('Authority') || '').trim();
    const status = String(url.searchParams.get('Status') || '').trim().toUpperCase();

    if (!orderNumber || !authority) return new Response('اطلاعات بازگشت پرداخت ناقص است.', { status: 400 });

    const { data: order, error: oe } = await admin
      .from('orders')
      .select('id,order_number,total,payment_status')
      .eq('order_number', orderNumber)
      .maybeSingle();

    if (oe) throw oe;
    if (!order) return new Response('سفارش پیدا نشد.', { status: 404 });

    if (order.payment_status === 'موفق') return redirect('success', order.order_number);
    if (status !== 'OK') {
      await admin.rpc('record_payment_result', {
        p_order_id: order.id,
        p_provider: 'zarinpal',
        p_authority: authority,
        p_status: 'failed',
        p_ref_id: null,
      });
      return redirect('failed', order.order_number);
    }

    const verifyResponse = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'YadakLandIran/1.0' },
      body: JSON.stringify({
        merchant_id: merchantId,
        authority,
        amount: Math.round(Number(order.total) * 10),
      }),
    });

    const verification = await verifyResponse.json();
    const code = verification?.data?.code;
    const refId = verification?.data?.ref_id;

    if (!verifyResponse.ok || ![100, 101].includes(code)) {
      await admin.rpc('record_payment_result', {
        p_order_id: order.id,
        p_provider: 'zarinpal',
        p_authority: authority,
        p_status: 'failed',
        p_ref_id: refId ? String(refId) : null,
      });
      return redirect('failed', order.order_number);
    }

    await admin.rpc('record_payment_result', {
      p_order_id: order.id,
      p_provider: 'zarinpal',
      p_authority: authority,
      p_status: 'success',
      p_ref_id: refId ? String(refId) : null,
    });

    return redirect('success', order.order_number);
  } catch (error) {
    console.error(error);
    return new Response('خطا در تأیید پرداخت.', { status: 500 });
  }
});
