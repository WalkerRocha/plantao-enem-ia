

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[MERCADO_PAGO] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const accessToken = Deno.env.get('MERCADO_PAGO_ACCESS_TOKEN');
    if (!accessToken) {
      logStep("ERROR: MERCADO_PAGO_ACCESS_TOKEN not found");
      throw new Error('Mercado Pago access token não configurado');
    }
    logStep("Mercado Pago access token verified");

    // Authenticate user
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header");
      throw new Error("Token de autorização não fornecido");
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      logStep("ERROR: Authentication failed", userError);
      throw new Error(`Erro de autenticação: ${userError.message}`);
    }
    const user = userData.user;
    if (!user?.email) {
      logStep("ERROR: User not authenticated or no email");
      throw new Error("Usuário não autenticado ou email não disponível");
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    const requestBody = await req.json();
    logStep("Request body received", requestBody);

    const { planData, paymentMethod, payer } = requestBody;
    
    if (!planData) {
      logStep("ERROR: No plan data provided");
      throw new Error("Dados do plano não fornecidos");
    }
    
    if (!paymentMethod) {
      logStep("ERROR: No payment method provided");
      throw new Error("Método de pagamento não selecionado");
    }
    
    if (!payer) {
      logStep("ERROR: No payer data provided");
      throw new Error("Dados do pagador não fornecidos");
    }

    // Extract price from plan
    let planPrice;
    try {
      planPrice = parseFloat(planData.price.replace('R$ ', '').replace(',', '.'));
      logStep("Plan price extracted", { originalPrice: planData.price, parsedPrice: planPrice });
    } catch (error) {
      logStep("ERROR: Failed to parse plan price", { price: planData.price, error });
      throw new Error("Erro ao processar preço do plano");
    }

    const externalReference = `user_${user.id}_plan_${planData.id}_${Date.now()}`;
    logStep("External reference created", { externalReference });

    // For PIX payments, create payment directly
    if (paymentMethod === 'pix') {
      const paymentData = {
        transaction_amount: planPrice,
        description: `${planData.name} - ${planData.shortDescription}`,
        payment_method_id: 'pix',
        external_reference: externalReference,
        notification_url: `https://your-project-ref.supabase.co/functions/v1/mercadopago-webhook`,
        payer: {
          email: user.email,
          first_name: payer.name.split(' ')[0] || 'Nome',
          last_name: payer.name.split(' ').slice(1).join(' ') || 'Sobrenome',
          identification: {
            type: 'CPF',
            number: payer.cpf.replace(/\D/g, '')
          }
        }
      };

      logStep("Creating PIX payment with data", paymentData);

      const paymentResponse = await fetch('https://api.mercadopago.com/v1/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const responseText = await paymentResponse.text();
      logStep("Mercado Pago response", { 
        status: paymentResponse.status, 
        statusText: paymentResponse.statusText,
        responseLength: responseText.length 
      });

      if (!paymentResponse.ok) {
        logStep("PIX payment creation failed", { 
          status: paymentResponse.status, 
          statusText: paymentResponse.statusText,
          response: responseText 
        });
        throw new Error(`Erro do Mercado Pago: ${paymentResponse.status} - ${responseText}`);
      }

      let paymentResult;
      try {
        paymentResult = JSON.parse(responseText);
        logStep("PIX payment created successfully", { 
          paymentId: paymentResult.id, 
          status: paymentResult.status,
          hasQrCode: !!paymentResult.point_of_interaction?.transaction_data?.qr_code,
          hasQrCodeBase64: !!paymentResult.point_of_interaction?.transaction_data?.qr_code_base64
        });
      } catch (error) {
        logStep("ERROR: Failed to parse Mercado Pago response", { responseText, error });
        throw new Error("Erro ao processar resposta do Mercado Pago");
      }
      
      const responseData = {
        success: true,
        paymentMethod: 'pix',
        paymentId: paymentResult.id,
        status: paymentResult.status,
        pixQrCode: paymentResult.point_of_interaction?.transaction_data?.qr_code,
        pixQrCodeBase64: paymentResult.point_of_interaction?.transaction_data?.qr_code_base64,
        expirationDate: paymentResult.date_of_expiration
      };

      logStep("Returning PIX response", responseData);
      
      return new Response(JSON.stringify(responseData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // For boleto and card payments, create preference
    if (paymentMethod === 'boleto' || paymentMethod === 'card') {
      let excludedPaymentTypes = [];
      let excludedPaymentMethods = [];

      if (paymentMethod === 'boleto') {
        // Only allow boleto (ticket)
        excludedPaymentTypes = [
          { id: 'credit_card' },
          { id: 'debit_card' },
          { id: 'account_money' }
        ];
      } else if (paymentMethod === 'card') {
        // Only allow cards
        excludedPaymentTypes = [
          { id: 'ticket' }, // boleto
          { id: 'bank_transfer' }, // PIX and other transfers
          { id: 'account_money' }
        ];
      }

      const preferenceData = {
        items: [
          {
            id: planData.id,
            title: planData.name,
            description: planData.shortDescription,
            quantity: 1,
            unit_price: planPrice,
            currency_id: "BRL"
          }
        ],
        payer: {
          name: payer.name,
          email: user.email,
          identification: {
            type: "CPF",
            number: payer.cpf.replace(/\D/g, '')
          }
        },
        payment_methods: {
          excluded_payment_types: excludedPaymentTypes,
          excluded_payment_methods: excludedPaymentMethods,
          installments: paymentMethod === 'card' ? 12 : 1 // Allow installments for cards
        },
        back_urls: {
          success: `${req.headers.get("origin")}/payment-success`,
          failure: `${req.headers.get("origin")}/payment-failure`,
          pending: `${req.headers.get("origin")}/payment-pending`
        },
        auto_return: "approved",
        external_reference: externalReference,
        notification_url: `https://your-project-ref.supabase.co/functions/v1/mercadopago-webhook`
      };

      logStep(`Creating ${paymentMethod} preference`, preferenceData);

      const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferenceData),
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        logStep(`${paymentMethod} preference creation failed`, { 
          status: response.status, 
          statusText: response.statusText,
          response: responseText 
        });
        throw new Error(`Erro do Mercado Pago ${paymentMethod}: ${response.status} - ${responseText}`);
      }

      let preferenceResult;
      try {
        preferenceResult = JSON.parse(responseText);
        logStep(`${paymentMethod} preference created successfully`, { preferenceId: preferenceResult.id });
      } catch (error) {
        logStep(`ERROR: Failed to parse ${paymentMethod} response`, { responseText, error });
        throw new Error(`Erro ao processar resposta do ${paymentMethod}`);
      }

      return new Response(JSON.stringify({
        success: true,
        paymentMethod: paymentMethod,
        preferenceId: preferenceResult.id,
        initPoint: preferenceResult.init_point,
        sandboxInitPoint: preferenceResult.sandbox_init_point
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    logStep("ERROR: Invalid payment method", { paymentMethod });
    throw new Error('Método de pagamento inválido');

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-mercadopago-payment", { message: errorMessage, stack: error.stack });
    return new Response(JSON.stringify({ 
      success: false, 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

