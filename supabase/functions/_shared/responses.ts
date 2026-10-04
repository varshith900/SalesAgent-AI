import { createOpenAI } from "npm:@ai-sdk/openai";
import { streamText, type ModelMessage } from "npm:ai";

import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "./run-id.ts";

export function createResponsesCall(
  request: Request,
  config: { baseURL: string; apiKey: string; model: string },
  instructions: string,
  messages: ModelMessage[],
  onFinish?: (text: string) => Promise<void>,
) {
  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: `${config.baseURL.replace(/\/+$/, "").replace(/\/v1$/, "")}/v1`,
    apiKey: config.apiKey,
    headers: { "Lovable-API-Key": config.apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
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

  if (onFinish) {
    void result.text.then(onFinish).catch((error) => console.error("sales-chat completion failed", error));
  }

  return withLovableAiGatewayRunIdHeader(
    result.toUIMessageStreamResponse({ sendReasoning: false }),
    runIdFetch,
  );
}