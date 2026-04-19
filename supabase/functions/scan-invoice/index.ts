// Edge function: extract invoice data from an image/PDF using Lovable AI (Gemini vision).
// Client sends { fileBase64, mimeType }. Returns structured JSON via tool calling.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an expert invoice data extractor. You will be shown an invoice (image or PDF page) and must extract structured data.

Rules:
- Extract amounts as plain numbers (no currency symbols).
- Use YYYY-MM-DD for dates. If no year shown, assume the current year.
- Include ALL line items you can see.
- If a field is unclear or missing, omit it / leave it empty.
- Set confidence to "low" if the image is blurry or hard to read.
- Phone numbers should include country code when visible (e.g. +91...).`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { fileBase64, mimeType } = await req.json();
    if (!fileBase64 || !mimeType) {
      return new Response(
        JSON.stringify({ error: "fileBase64 and mimeType are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const dataUrl = `data:${mimeType};base64,${fileBase64}`;

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
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Extract the invoice data using the extract_invoice tool.",
                },
                { type: "image_url", image_url: { url: dataUrl } },
              ],
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "extract_invoice",
                description: "Return the extracted invoice fields.",
                parameters: {
                  type: "object",
                  properties: {
                    clientName: { type: "string" },
                    clientEmail: { type: "string" },
                    clientPhone: { type: "string" },
                    dueDate: {
                      type: "string",
                      description: "YYYY-MM-DD",
                    },
                    notes: { type: "string" },
                    items: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          description: { type: "string" },
                          quantity: { type: "number" },
                          rate: { type: "number" },
                        },
                        required: ["description", "quantity", "rate"],
                        additionalProperties: false,
                      },
                    },
                    confidence: {
                      type: "string",
                      enum: ["high", "medium", "low"],
                    },
                    warnings: { type: "array", items: { type: "string" } },
                  },
                  required: ["items", "confidence"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "extract_invoice" },
          },
        }),
      },
    );

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached. Please try again shortly." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({
            error: "AI credits exhausted. Add funds in Settings → Workspace → Usage.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
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
    const toolCall =
      aiJson?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;

    if (!toolCall) {
      console.error("No tool call returned", JSON.stringify(aiJson));
      return new Response(
        JSON.stringify({ error: "AI did not return structured data" }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    let parsed;
    try {
      parsed = JSON.parse(toolCall);
    } catch (e) {
      console.error("Failed to parse tool args", toolCall);
      return new Response(
        JSON.stringify({ error: "Invalid AI response" }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(JSON.stringify({ data: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    console.error("scan-invoice error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
