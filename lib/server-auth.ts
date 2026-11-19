import { pbkdf2Sync, randomBytes, timingSafeEqual, createHash } from "crypto";
import { readDocument, mutateDocument } from "./persistent-data";
import { requireSameOrigin } from "./request-security";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { recordActivity } from "./account-store";

export type UserRole = "student" | "admin";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash?: string;
  googleSubject?: string;
  emailVerifiedAt?: string;
  createdAt: string;
  passwordReset?: { hash: string; expiresAt: string };
  passwordVersion?: number;
};

export type SafeUser = Pick<AppUser, "id" | "name" | "email" | "role" | "createdAt">;

type SessionRecord = {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
  passwordVersion?: number;
};

export const SESSION_COOKIE = "rts_session";

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

function readUsers() { return readDocument<AppUser[]>("users", []); }
function readSessions() { return readDocument<SessionRecord[]>("sessions", []); }

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, passwordHash: string) {
  const [salt, storedHash] = passwordHash.split(":");
  if (!salt || !storedHash) return false;
  const candidate = pbkdf2Sync(password, salt, 120000, 64, "sha512").toString("hex");
  const stored = Buffer.from(storedHash, "hex");
  const next = Buffer.from(candidate, "hex");
  if (stored.length !== next.length) return false;
  return timingSafeEqual(stored, next);
}

export function safeUser(user: AppUser): SafeUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

function adminAllowed(users: AppUser[], inviteCode?: string) {
  const hasAdmin = users.some((user) => user.role === "admin");
  const configured = process.env.ADMIN_INVITE_CODE;
  if (!configured && !hasAdmin && process.env.NODE_ENV !== "production") return true;
  return Boolean(configured && inviteCode && inviteCode === configured);
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  inviteCode?: string;
}) {
  const email = normalizeEmail(input.email);
  const name = input.name.trim();
  const password = input.password;
  const role = input.role === "admin" ? "admin" : "student";

  if (name.length < 2 || name.length > 120) throw new Error("Please enter your full name (2–120 characters).");
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Please enter a valid email.");
  if (password.length < 8 || password.length > 128) throw new Error("Password must be between 8 and 128 characters.");
  const passwordHash = hashPassword(password);
  return mutateDocument<AppUser[], AppUser>("users", [], (users) => {
    if (users.some((user) => user.email === email)) throw new Error("An account with this email already exists.");
    if (role === "admin" && !adminAllowed(users, input.inviteCode)) {
      throw new Error("Admin sign up requires the configured invite code.");
    }

    const user: AppUser = {
      id: randomBytes(16).toString("hex"),
      name,
      email,
      role,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    return { value: [...users, user], result: user };
  });
}

export async function authenticateUser(emailInput: string, password: string) {
  if (emailInput.length > 254 || password.length > 128) throw new Error("Email or password is incorrect.");
  const email = normalizeEmail(emailInput);
  const user = (await readUsers()).find((item) => item.email === email);
  if (!user?.passwordHash || !verifyPassword(password, user.passwordHash)) {
    throw new Error("Email or password is incorrect.");
  }
  return user;
}

export async function createSession(userId: string, passwordVersion: number) {
  const user = (await readUsers()).find(user => user.id === userId);
  if (!user) throw new Error("Account not found.");
  if ((user.passwordVersion ?? 0) !== passwordVersion) throw new Error("Please log in again with your current password.");
  const token = randomBytes(32).toString("hex");
  const session: SessionRecord = {
    token,
    userId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + sessionCookieOptions.maxAge * 1000).toISOString(),
    passwordVersion,
  };
  await mutateDocument<SessionRecord[], void>("sessions", [], (sessions) => ({
    value: [...sessions.filter(item => Date.parse(item.expiresAt) > Date.now()), session], result: undefined,
  }));
  return token;
}

export async function destroySession(token?: string) {
  if (!token) return;
  await mutateDocument<SessionRecord[], void>("sessions", [], sessions => ({
    value: sessions.filter(session => session.token !== token && Date.parse(session.expiresAt) > Date.now()), result: undefined,
  }));
}

export async function getUserBySessionToken(token?: string) {
  if (!token) return null;
  const session = (await readSessions()).find((item) => item.token === token && Date.parse(item.expiresAt) > Date.now());
  if (!session) return null;
  return (await readUsers()).find((user) => user.id === session.userId && (user.passwordVersion ?? 0) === (session.passwordVersion ?? 0)) ?? null;
}

export async function getUserFromRequest(request: NextRequest) {
  return getUserBySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  return getUserBySessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function requireAdmin(request: NextRequest) {
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    try { requireSameOrigin(request); }
    catch { return { error: Response.json({ error: "Please send your request from this website." }, { status: 403 }) }; }
  }
  const user = await getUserFromRequest(request);
  if (!user) return { error: Response.json({ error: "Please log in first." }, { status: 401 }) };
  if (user.role !== "admin") return { error: Response.json({ error: "Admin access required." }, { status: 403 }) };
  return { user };
}

export async function createPasswordReset(email: string) {
  const token = randomBytes(32).toString("hex");
  const hash = createHash("sha256").update(token).digest("hex");
  const user = await mutateDocument<AppUser[], SafeUser | null>("users", [], users => {
    const user = users.find(item => item.email === normalizeEmail(email) && Boolean(item.passwordHash));
    if (user) user.passwordReset = { hash, expiresAt: new Date(Date.now() + 30 * 60000).toISOString() };
    return { value: users, result: user ? safeUser(user) : null };
  });
  return user ? { user, token } : null;
}

export async function resetPassword(token: string, password: string) {
  if (!/^[a-f0-9]{64}$/.test(token)) throw new Error("This reset link is invalid or has expired.");
  if (password.length < 8 || password.length > 128) throw new Error("Password must be between 8 and 128 characters.");
  const hash = createHash("sha256").update(token).digest("hex");
  const passwordHash = hashPassword(password);
  const userId = await mutateDocument<AppUser[], string>("users", [], users => {
    const user = users.find(item => item.passwordReset?.hash === hash && Date.parse(item.passwordReset.expiresAt) > Date.now());
    if (!user) throw new Error("This reset link is invalid or has expired.");
    user.passwordHash = passwordHash;
    user.passwordVersion = (user.passwordVersion ?? 0) + 1;
    delete user.passwordReset;
    return { value: users, result: user.id };
  });
  await mutateDocument<SessionRecord[], void>("sessions", [], sessions => ({ value: sessions.filter(session => session.userId !== userId), result: undefined }));
  await recordActivity(userId, { type: "account", title: "Password reset", detail: "Previous sessions were signed out." });
}
