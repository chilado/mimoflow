import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-04-10' });

const PLAN_DAYS: Record<string, number> = {
  monthly: 30, quarterly: 90, semiannual: 180, annual: 365,
};

const corsHeaders = { 'Access-Control-Allow-Origin': '*' };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const sig = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = webhookSecret
      ? stripe.webhooks.constructEvent(body, sig!, webhookSecret)
      : JSON.parse(body);
  } catch (e) {
    return new Response(`Webhook error: ${e.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    const plan = session.metadata?.plan;

    if (!userId || !plan || !PLAN_DAYS[plan]) {
      return new Response('Missing metadata', { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SVC_ROLE_KEY')!
    );

    const now = new Date();
    const expires = new Date(now.getTime() + PLAN_DAYS[plan] * 24 * 60 * 60 * 1000);

    await supabase.from('subscriptions').upsert({
      user_id: userId,
      plan,
      status: 'active',
      started_at: now.toISOString(),
      expires_at: expires.toISOString(),
      cancelled_at: null,
    }, { onConflict: 'user_id' });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
