import Stripe from 'https://esm.sh/stripe@14?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-04-10' });

const PRICE_IDS: Record<string, string> = {
  monthly:    Deno.env.get('STRIPE_PRICE_MONTHLY')!,
  quarterly:  Deno.env.get('STRIPE_PRICE_QUARTERLY')!,
  semiannual: Deno.env.get('STRIPE_PRICE_SEMIANNUAL')!,
  annual:     Deno.env.get('STRIPE_PRICE_ANNUAL')!,
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { plan } = await req.json();
    if (!PRICE_IDS[plan]) return new Response(JSON.stringify({ error: 'Invalid plan' }), { status: 400, headers: corsHeaders });

    // Get user from JWT
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });

    const appUrl = Deno.env.get('APP_URL') || 'https://mimoflow.vercel.app';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
      success_url: `${appUrl}/plan?success=1&plan=${plan}`,
      cancel_url: `${appUrl}/plan?cancelled=1`,
      customer_email: user.email,
      metadata: { user_id: user.id, plan },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders });
  }
});
