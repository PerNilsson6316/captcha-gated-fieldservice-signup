import { registerTechnician } from "./field_signup";

const base = { email: "tech@example.com", password: "long-password", name: "Ada", captchaToken: "token", widgetRecordId: "widget-record", vendor: "turnstile", photos: ["front.jpg"], dispatchStatus: "queued" as const, followUp: "Call after arrival" };

async function main() {
  const accepted = await registerTechnician(base, { verifyCaptcha: async () => ({ score: 0.9 }) } as any);
  if (!accepted.accepted || accepted.workOrder.dispatchStatus !== "queued") throw new Error("expected accepted signup");
  const rejected = await registerTechnician(base, { verifyCaptcha: async () => ({ score: 0.1 }) } as any);
  if (rejected.accepted || rejected.reason !== "captcha_rejected") throw new Error("expected rejected signup");
  console.log("field signup decision: pass");
}

main();
