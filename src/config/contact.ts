// External contact configuration.
// Personal Telegram/WhatsApp links must NOT be buried in components for a sale build.
// Buyers override these via VITE_ env vars; safe empty placeholders ship by default.

interface ContactConfig {
  telegramUrl: string;
  whatsappUrl: string;
  supportEmail: string;
}

export const contact: ContactConfig = {
  telegramUrl: import.meta.env.VITE_TELEGRAM_URL || "",
  whatsappUrl: import.meta.env.VITE_WHATSAPP_URL || "",
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || "support@example.com",
};

// Build a deep link for contact. Falls back to empty string when not configured.
export function buildContactUrl(channel: string, username = "", phone = ""): string {
  const handle = username.trim() || "new player";
  const mobile = phone.trim() || "not provided";
  const message = encodeURIComponent(
    `Hi ${brandName()}, I want to register.\nUsername: ${handle}\nMobile: ${mobile}\nBonus: $100 sign-up + 300% match with 10x rollover`
  );

  if (channel === "whatsapp" && contact.whatsappUrl) {
    const separator = contact.whatsappUrl.includes("?") ? "&" : "?";
    return `${contact.whatsappUrl}${separator}text=${message}`;
  }
  if (channel === "telegram" && contact.telegramUrl) {
    const separator = contact.telegramUrl.includes("?") ? "&" : "?";
    return `${contact.telegramUrl}${separator}text=${message}`;
  }
  return "";
}

function brandName(): string {
  // Local import to avoid a circular dependency at module init.
  return import.meta.env.VITE_BRAND_NAME || "NeonBet";
}

export default contact;
