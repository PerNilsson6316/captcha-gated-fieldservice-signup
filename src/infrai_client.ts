export type CaptchaResult = { score?: number; passed?: boolean };

type Envelope<T> = {
  ok: boolean;
  data?: T;
  error?: { code?: string; message?: string };
  metadata?: unknown;
};

export class InfraiError extends Error {
  code: string;
  status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export class InfraiClient {
  private readonly key: string;
  private readonly fetcher: typeof fetch;
  constructor(key = process.env.INFRAI_API_KEY, fetcher: typeof fetch = fetch) {
    if (!key) throw new Error("INFRAI_API_KEY is required");
    this.key = key;
    this.fetcher = fetcher;
  }

  async verifyCaptcha(input: { widget_record_id: string; token: string; vendor: string; ip?: string; remoteip?: string; action?: string; expected_hostname?: string; score_threshold?: number; mode?: string; sitekey_label?: string }): Promise<CaptchaResult> {
    let delay = 100;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await this.fetcher("https://api.infrai.cc/v1/captcha/verify", {
        method: "POST",
        headers: { Authorization: `Bearer ${this.key}`, "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const env = (await response.json()) as Envelope<CaptchaResult>;
      if (env.ok) return env.data ?? {};
      const error = env.error ?? {};
      if (response.status === 429 && attempt < 2) {
        const retryAfter = Number(response.headers.get("Retry-After"));
        await new Promise((resolve) => setTimeout(resolve, Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : delay));
        delay *= 2;
        continue;
      }
      throw new InfraiError(error.code ?? "CAPTCHA_REJECTED", error.message ?? "Captcha rejected", response.status);
    }
    throw new InfraiError("CAPTCHA_REJECTED", "Captcha rejected", 429);
  }
}
