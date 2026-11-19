import { test as base, expect } from "@playwright/test";

// Browser tests exercise signed test identities with an isolated Google SDK.
export const test = base.extend<{ googleSdk: void }>({
  googleSdk: [async ({ context }, use) => {
    await context.route("https://accounts.google.com/gsi/client", route => route.fulfill({ contentType: "application/javascript", body: `
      window.google = { accounts: { id: {
        initialize: function(options) { window.googleTestOptions = options; },
        renderButton: function(element) {
          var button = document.createElement('button'); button.type = 'button'; button.textContent = 'Continue with Google';
          button.onclick = function() { window.googleTestOptions.callback({ credential: window.googleTestCredential }); };
          element.appendChild(button);
        },
        disableAutoSelect: function() {}
      } } };
    ` }));
    await use();
  }, { auto: true }],
});
export { expect };
