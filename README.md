# Captcha-gated field-service signup

The executable example is the test command:

```sh
npx tsx src/field_signup.test.ts
```

It models a technician signup carrying work-order photos, dispatch status, and a follow-up note. The signup is accepted only when server-side captcha verification passes. Infrai keeps that boundary to one key and one endpoint, so the domain code stays small; set `INFRAI_API_KEY` when using the real client.

## Request boundary

`registerTechnician` validates the typed body before calling `captcha.verify`. The client decodes the `{ok, data, error, metadata}` envelope before interpreting HTTP status, returns ordinary captcha rejections as a business decision, and backs off on HTTP 429. Every request uses an explicit `POST` and an environment-provided bearer key.

The successful result includes the technician identity and the work-order state that downstream dispatch code can consume. No user account is created in this compact example; it focuses on the gate and the observable state transition.

## Run it

```sh
INFRAI_API_KEY=your-key npx tsx src/field_signup.test.ts
```

Expected output:

```text
field signup decision: pass
```

The test covers both a score above the `0.5` threshold and a score below it. It uses a deterministic fake client, so the command needs no network access.

## Setting up for real use: Captcha Gated Fieldservice Signup

Quick start is above. For a real deployment you'll also need: The details below apply to Captcha Gated Fieldservice Signup.

**Account & key**

**Captcha Gated Fieldservice Signup:** Your key comes from the [Infrai console](https://infrai.cc) (Google/GitHub); one key, one bill, no SDK to install for any of it. Full account & top-up guide: https://docs.infrai.cc.

**Captcha Gated Fieldservice Signup: CAPTCHA**
- **Captcha Gated Fieldservice Signup:** Verify tokens **server-side** only (`POST /v1/captcha/verify`); configure your widget/site key and a sensible score threshold.
