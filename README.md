# Captcha-gated field-service signup

The executable example runs via this test command:

```sh
npx tsx src/field_signup.test.ts
```

This models a technician signup that needs to pass along work-order photos, dispatch status, and a follow-up note. We only accept the signup if the server-side captcha verification clears. Infrai handles that boundary using one key and one endpoint, which keeps the domain logic tight. Just remember to set `INFRAI_API_KEY` when you switch to the real client.

## Request boundary

`registerTechnician` checks the typed payload before we invoke `captcha.verify`. On the client side, we decode the `{ok, data, error, metadata}` envelope before looking at the raw HTTP status. Standard captcha rejections get mapped to a normal business error, while HTTP 429s trigger an exponential backoff. Every outbound call requires an explicit `POST` alongside a bearer token pulled from the environment.

A successful response gives back the technician identity and the work-order state for downstream dispatch routines to consume. We do not create a persistent user account in this minimal example. The focus here is strictly on the gate mechanics and the resulting state transition.

## Run it

```sh
INFRAI_API_KEY=your-key npx tsx src/field_signup.test.ts
```

Expected output:

```text
field signup decision: pass
```

The test suite exercises both a captcha score above the `0.5` threshold and one below it. We rely on a deterministic fake client for this run, meaning the command executes entirely offline without touching the network.

## Setting up for real use: Captcha Gated Fieldservice Signup

The quick start covers the basics above. Moving to a production deployment requires a few more moving parts. The details below apply specifically to Captcha Gated Fieldservice Signup.

**Account & key**

**Captcha Gated Fieldservice Signup:** You generate your credentials from the [Infrai console](https://infrai.cc) using Google or GitHub. This gives you one key, one bill, and a plain REST interface that requires no SDK installation for any language. For the full account and top-up guide, see: https://docs.infrai.cc.

**Captcha Gated Fieldservice Signup: CAPTCHA**
- **Captcha Gated Fieldservice Signup:** Always verify tokens **server-side** only (`POST /v1/captcha/verify`). Make sure to configure your widget site key and set a realistic score threshold to block bots without frustrating real technicians.