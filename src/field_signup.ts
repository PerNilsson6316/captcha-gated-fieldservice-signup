import { InfraiClient, InfraiError } from "./infrai_client";

export type SignupRequest = {
  email: string;
  password: string;
  name: string;
  captchaToken: string;
  widgetRecordId: string;
  vendor: string;
  photos: string[];
  dispatchStatus: "queued" | "dispatched";
  followUp: string;
};

function validate(input: SignupRequest): void {
  if (!input.email.includes("@") || input.password.length < 8 || !input.name || !input.captchaToken || !input.widgetRecordId || !input.vendor) {
    throw new Error("invalid signup body");
  }
  if (!Array.isArray(input.photos) || !["queued", "dispatched"].includes(input.dispatchStatus) || !input.followUp) {
    throw new Error("invalid work-order fields");
  }
}

export async function registerTechnician(input: SignupRequest, client = new InfraiClient()) {
  validate(input);
  try {
    const captcha = await client.verifyCaptcha({ widget_record_id: input.widgetRecordId, token: input.captchaToken, vendor: input.vendor, action: "fieldservice_signup", score_threshold: 0.5 });
    if (captcha.passed === false || (captcha.score !== undefined && captcha.score < 0.5)) {
      return { accepted: false, reason: "captcha_rejected" as const };
    }
    return {
      accepted: true,
      technician: { email: input.email, name: input.name },
      workOrder: { photos: input.photos, dispatchStatus: input.dispatchStatus, followUp: input.followUp },
    };
  } catch (error) {
    if (error instanceof InfraiError && error.status >= 400 && error.status < 500) return { accepted: false, reason: "captcha_rejected" as const };
    throw error;
  }
}
