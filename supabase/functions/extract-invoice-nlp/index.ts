// Edge function: extract invoice data from natural-language text using Lovable AI.
// Client sends { text, previousInvoice? }. Returns structured invoice JSON.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const today = () => new Date().toISOString().split("T")[0];

const SYSTEM_PROMPT = `You are an invoice extraction expert. You extract structured invoice data from natural-language descriptions in ANY language (English, Spanish, Hindi, French, German, Portuguese, Arabic, Chinese, etc.).

RULES:
- Extract ALL line items mentioned.
- amount = quantity × rate (always compute it).
- "hours", "days", "sessions", "units" → quantity.
- Convert relative dates ("next Friday", "in 30 days", "end of month", "tomorrow") to absolute YYYY-MM-DD using today = ${today()}.
- Handle number formats like 1,000.50 and 1.000,50.
- Detect currency from symbols: $ → USD, € → EUR, ₹ → INR, £ → GBP, ¥ → JPY. Default USD.
- Preserve the ORIGINAL language in item descriptions and notes.
- If user says "same as last invoice" and a previousInvoice is provided, start from those values and apply only the modifications they describe.
- Always return at least one line item and a client_name.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Require an authenticated user — this function consumes paid AI credits.
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    );
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { text, previousInvoice } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length < 3) {
      return new Response(
        JSON.stringify({ error: "Please provide a description of at least 3 characters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (text.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Description is too long (max 5000 characters)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const userContent = previousInvoice
      ? `Previous invoice for context (JSON):\n${JSON.stringify(previousInvoice)}\n\nUser request:\n${text}`
      : `User request:\n${text}`;

    const aiResp = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userContent },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "create_invoice",
                description: "Return the extracted invoice fields.",
                parameters: {
                  type: "object",
                  properties: {
                    client_name: { type: "string" },
                    client_email: { type: "string" },
                    client_phone: { type: "string" },
                    client_address: { type: "string" },
                    invoice_date: { type: "string", description: "YYYY-MM-DD" },
                    due_date: { type: "string", description: "YYYY-MM-DD" },
                    line_items: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          description: { type: "string" },
                          quantity: { type: "number" },
                          rate: { type: "number" },
                          amount: { type: "number" },
                        },
                        required: ["description", "quantity", "rate", "amount"],
                        additionalProperties: false,
                      },
                    },
                    notes: { type: "string" },
                    discount: { type: "number" },
                    tax_rate: { type: "number" },
                    currency: {
                      type: "string",
                      description: "ISO 4217: USD, EUR, INR, GBP, JPY, etc.",
                    },
                    detected_language: {
                      type: "string",
                      description: "ISO 639-1 code: en, es, hi, fr, de, pt, ar, zh, etc.",
                    },
                  },
                  required: ["client_name", "line_items", "currency", "detected_language"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "create_invoice" } },
        }),
      },
    );

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const txt = await aiResp.text();
      console.error("AI gateway error", aiResp.status, txt);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiResp.json();
    const toolArgs = aiJson?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!toolArgs) {
      console.error("No tool call returned", JSON.stringify(aiJson));
      return new Response(
        JSON.stringify({ error: "Couldn't extract invoice details. Please be more specific." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let parsed: any;
    try {
      parsed = JSON.parse(toolArgs);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid AI response" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!parsed.client_name || !Array.isArray(parsed.line_items) || parsed.line_items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Couldn't extract invoice details. Please be more specific or fill manually." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ success: true, data: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    console.error("extract-invoice-nlp error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
