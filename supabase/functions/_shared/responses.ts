import { createOpenAI } from "npm:@ai-sdk/openai";
import { streamText, type ModelMessage, type UIMessage } from "npm:ai";

export function createResponsesCall(
  config: { baseURL: string; apiKey: string; model: string },
  instructions: string,
  messages: ModelMessage[],
  originalMessages: UIMessage[],
  onFinish: (messages: UIMessage[]) => Promise<void>,
) {
  const provider = createOpenAI({
    baseURL: `${config.baseURL.replace(/\/+$/, "").replace(/\/v1$/, "")}/v1`,
    apiKey: config.apiKey,
    headers: { "Lovable-API-Key": config.apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });

  const result = streamText({
    model: provider.responses(config.model),
    instructions,
    messages,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  const response = result.toUIMessageStreamResponse({
    originalMessages,
    sendReasoning: false,
    onFinish: ({ messages: completed, isAborted }) => {
      if (!isAborted) EdgeRuntime.waitUntil(onFinish(completed));
    },
  });
  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Headers", "authorization, x-client-info, apikey, content-type");
  return new Response(response.body, { status: response.status, headers });
}