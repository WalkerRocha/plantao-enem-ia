import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    logStep("Webhook body", body);

    // Mercado Pago sends notifications for different events
    if (body.action === 'payment.updated' || body.type === 'payment') {
      const paymentId = body.data?.id;
      
      if (!paymentId) {
        logStep("No payment ID found in webhook");
        return new Response('OK', { status: 200 });
      }

      // Get payment details from Mercado Pago
      const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
      if (!accessToken) throw new Error('MERCADO_PAGO_ACCESS_TOKEN is not set');

      const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!paymentResponse.ok) {
        logStep("Failed to fetch payment details", { paymentId, status: paymentResponse.status });
        return new Response('Error fetching payment', { status: 500 });
      }

      const payment = await paymentResponse.json();
      logStep("Payment details", { paymentId, status: payment.status, amount: payment.transaction_amount });

      // Check if payment is approved
      if (payment.status === 'approved') {
        // Extract user ID from external_reference (format: user_{userId}_plan_{planId}_{timestamp})
        const externalRef = payment.external_reference;
        if (externalRef) {
          const userIdMatch = externalRef.match(/user_([^_]+)/);
          const planIdMatch = externalRef.match(/plan_([^_]+)_/);
          
          if (userIdMatch && planIdMatch) {
            const userId = userIdMatch[1];
            const planId = planIdMatch[1];
            
            logStep("Updating user subscription", { userId, planId });

            // Calculate expiration date (30 days from now)
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 30);

            // Update user profile with subscription
            const { error: updateError } = await supabaseClient
              .from('profiles')
              .update({
                subscription_plan: planId,
                subscription_status: 'active',
                subscription_expires_at: expirationDate.toISOString()
              })
              .eq('id', userId);

            if (updateError) {
              logStep("Error updating user profile", updateError);
              throw updateError;
            }

            logStep("User subscription updated successfully", { userId, planId, expiresAt: expirationDate });
          }
        }
      }
    }

    return new Response('OK', { 
      headers: corsHeaders,
      status: 200 
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});