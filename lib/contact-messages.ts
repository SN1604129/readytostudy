import { randomBytes } from "crypto";
import { readDocument, mutateDocument } from "./persistent-data.ts";

export type DeliveryChannel = "teamEmail" | "confirmationEmail" | "webhook";
export type DeliveryState = {
  status: "pending" | "sending" | "sent" | "failed" | "unconfigured";
  attempts: number;
  attemptedAt?: string;
  providerId?: string;
  error?: string;
};

export type ContactEnquiry = {
  id: string;
  userId?: string;
  receivedAt: string;
  fullName: string;
  dateOfBirth: string;
  email: string;
  phone: string;
  destination: string;
  studyLevel: string;
  preferredCity?: string;
  englishTest?: string;
  englishScore?: string;
  message?: string;
  consent: string;
  deliveryChannel: "webhook" | "console" | "stored";
  delivered: boolean;
  submissionId?: string;
  notifications?: Partial<Record<DeliveryChannel, DeliveryState>>;
  status?: "new" | "contacted" | "closed";
};

function text(data: Record<string, unknown>, key: string) {
  return String(data[key] ?? "").trim();
}

export async function recordContactEnquiry(data: Record<string, unknown>, userId?: string): Promise<ContactEnquiry> {
  const enquiry: ContactEnquiry = {
    id: randomBytes(12).toString("hex"),
    userId,
    receivedAt: new Date().toISOString(),
    fullName: text(data, "fullName"),
    dateOfBirth: text(data, "dateOfBirth"),
    email: text(data, "email"),
    phone: text(data, "phone"),
    destination: text(data, "destination"),
    studyLevel: text(data, "studyLevel"),
    preferredCity: text(data, "preferredCity") || undefined,
    englishTest: text(data, "englishTest") || undefined,
    englishScore: text(data, "englishScore") || undefined,
    message: text(data, "message") || undefined,
    consent: text(data, "consent"),
    deliveryChannel: "stored",
    delivered: false,
    submissionId: text(data, "submissionId") || undefined,
    status: "new",
    notifications: {
      teamEmail: { status: "pending", attempts: 0 },
      confirmationEmail: { status: "pending", attempts: 0 },
      webhook: { status: "pending", attempts: 0 },
    },
  };
  return mutateDocument<ContactEnquiry[], ContactEnquiry>("contact-enquiries", [], enquiries => {
    const existing = enquiry.submissionId && enquiries.find(item => item.submissionId === enquiry.submissionId);
    if (existing) {
      if (existing.email !== enquiry.email || existing.userId !== enquiry.userId) throw new Error("This submission reference is already used.");
      return { value: enquiries, result: existing };
    }
    return { value: [enquiry, ...enquiries], result: enquiry };
  });
}

export async function getContactEnquiry(id: string) {
  return (await readDocument<ContactEnquiry[]>("contact-enquiries", [])).find(item => item.id === id);
}

export async function claimNotification(id: string, channel: DeliveryChannel) {
  return mutateDocument<ContactEnquiry[], boolean>("contact-enquiries", [], enquiries => {
    const enquiry = enquiries.find(item => item.id === id);
    if (!enquiry) return { value: enquiries, result: false };
    const current = enquiry.notifications?.[channel];
    if (current?.status === "sent" || (current?.status === "sending" && Date.parse(current.attemptedAt || "") > Date.now() - 60000)) return { value: enquiries, result: false };
    enquiry.notifications = { ...enquiry.notifications, [channel]: { status: "sending", attempts: (current?.attempts || 0) + 1, attemptedAt: new Date().toISOString() } };
    return { value: enquiries, result: true };
  });
}

export async function finishNotification(id: string, channel: DeliveryChannel, result: Pick<DeliveryState, "status" | "providerId" | "error">) {
  await mutateDocument<ContactEnquiry[], void>("contact-enquiries", [], enquiries => {
    const enquiry = enquiries.find(item => item.id === id);
    if (enquiry) {
      enquiry.notifications = { ...enquiry.notifications, [channel]: { attempts: 0, ...enquiry.notifications?.[channel], ...result } };
      enquiry.delivered = enquiry.notifications.teamEmail?.status === "sent" || enquiry.notifications.webhook?.status === "sent";
    }
    return { value: enquiries, result: undefined };
  });
}

export async function setEnquiryStatus(id: string, status: ContactEnquiry["status"]) {
  return mutateDocument<ContactEnquiry[], boolean>("contact-enquiries", [], enquiries => {
    const enquiry = enquiries.find(item => item.id === id);
    if (enquiry) enquiry.status = status;
    return { value: enquiries, result: Boolean(enquiry) };
  });
}

export async function updateContactDelivery(
  id: string,
  delivery: { delivered: boolean; channel: "webhook" | "console" },
) {
  await mutateDocument<ContactEnquiry[], void>("contact-enquiries", [], enquiries => ({
    value: enquiries.map(enquiry => enquiry.id === id
      ? { ...enquiry, delivered: delivery.delivered, deliveryChannel: delivery.channel } : enquiry),
    result: undefined,
  }));
}

export async function getContactEnquiries(limit = 100) {
  return (await readDocument<ContactEnquiry[]>("contact-enquiries", [])).slice(0, limit);
}

export async function getUserEnquiries(userId: string) {
  return (await readDocument<ContactEnquiry[]>("contact-enquiries", [])).filter(item => item.userId === userId).map(item => ({
    id: item.id, receivedAt: item.receivedAt, destination: item.destination, studyLevel: item.studyLevel,
    status: item.status || "new", confirmation: item.notifications?.confirmationEmail?.status || "pending",
  }));
}
