import { defineConfig } from "@playwright/test";
import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { generateKeyPairSync } from "node:crypto";
import { tmpdir } from "node:os";
import path from "node:path";

const dataDir = process.env.RTS_E2E_DATA_DIR ||= mkdtempSync(path.join(tmpdir(), "rts-browser-"));
const googleKeyFile = path.join(dataDir, "google-test-key.json");
if (!existsSync(googleKeyFile)) {
  const { publicKey, privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  writeFileSync(googleKeyFile, JSON.stringify({ publicKey: { ...publicKey.export({ format: "jwk" }), kid: "browser-test", alg: "RS256" }, privateKey: privateKey.export({ format: "jwk" }) }), { mode: 0o600 });
}
const chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
export default defineConfig({
  testDir: "./tests/browser", fullyParallel: false, workers: 1, timeout: 60000,
  use: { baseURL: "http://127.0.0.1:3105", browserName: "chromium", reducedMotion: "reduce", launchOptions: existsSync(chrome) ? { executablePath: chrome } : {}, screenshot: "only-on-failure", trace: "retain-on-failure" },
  webServer: { command: "node --import ./tests/provider-mocks.mjs ./node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3105", url: "http://127.0.0.1:3105", reuseExistingServer: false, timeout: 120000,
    env: { GOOGLE_CLIENT_ID: "browser-test.apps.googleusercontent.com", ADVISOR_TEST_MODE: "1", ADVISOR_ENABLED: "true", GROQ_API_KEY: "test-only", TAVILY_API_KEY: "test-only", RESEND_API_KEY: "test-only", EMAIL_FROM: "Ready to Study <info@readytostudy.com.au>", EMAIL_REPLY_TO: "contact@readytostudy.com.au", CONTACT_NOTIFICATION_EMAIL: "contact@readytostudy.com.au", CONTACT_WEBHOOK_URL: "", ADMIN_INVITE_CODE: "test-only-admin-invite", DATABASE_URL: "", POSTGRES_URL: "", RTS_DATA_DIR: dataDir, APP_ORIGIN: "http://127.0.0.1:3105", TURNSTILE_SECRET_KEY: "", TURNSTILE_SITE_KEY: "", ADVISOR_TRUSTED_IP_HEADER: "" } },
});
