import { randomBytes } from "node:crypto";
import { mutateDocument } from "./persistent-data.ts";
import { RequestError } from "./request-security.ts";
import type { AppUser } from "./server-auth";
import type { GoogleIdentity } from "./google-auth.ts";

/** Called only with a server-verified Google identity, never a client profile. */
export async function findOrCreateGoogleUser(identity: GoogleIdentity) {
  return mutateDocument<AppUser[], { user: AppUser; created: boolean }>("users", [], users => {
    const existing = users.find(user => user.googleSubject === identity.subject);
    const emailOwner = users.find(user => user.email === identity.email);
    if (existing) {
      if (emailOwner && emailOwner.id !== existing.id) throw new RequestError("This email is already used by another account. Please contact our team.", 409);
      existing.email = identity.email;
      return { value: users, result: { user: existing, created: false } };
    }
    // Password accounts have not verified their email. Do not merge accounts or
    // grant an existing role solely because the Google email happens to match.
    if (emailOwner) throw new RequestError("An account with this email already exists. Please log in with your existing password.", 409);
    const user: AppUser = {
      id: randomBytes(16).toString("hex"), name: identity.name, email: identity.email,
      role: "student", googleSubject: identity.subject, emailVerifiedAt: new Date().toISOString(), createdAt: new Date().toISOString(),
    };
    return { value: [...users, user], result: { user, created: true } };
  });
}
