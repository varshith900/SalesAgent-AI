# Architecture decisions

- Keep the sales assistant as one authenticated conversation per user, with complete UI messages stored in `sales_chat_messages`, because cross-device history was requested.
- Load CRM records only inside the `sales-chat` edge function under the caller's authenticated session, because customer context must remain private and tamper-resistant.
- Use the AI SDK Responses streaming path for new chatbot turns, because it preserves responsive UI, cancellation, and stateless full-history replay.
- Use the existing authenticated email delivery function for reviewed and automatic drafts, with shared plain-text parsing and final-content activity logging, to preserve recipient ownership and avoid duplicate sending logic.