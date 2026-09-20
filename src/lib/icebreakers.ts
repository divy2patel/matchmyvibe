// ─── Icebreaker Generator Utility ──────────────────────────────────────────────
// Generates tone-specific ready-to-send messages for WhatsApp/Discord contacts.

export type IcebreakerTone = "casual" | "formal" | "hype";

export interface IcebreakerParams {
  name: string;
  category: string;
  contactLead: string;
  tag: string;
  meetingOrDate?: string;
  tone: IcebreakerTone;
}

export function generateIcebreaker({
  name,
  category,
  contactLead,
  tag,
  meetingOrDate,
  tone,
}: IcebreakerParams): string {
  const leadFirstName = contactLead.split(" ")[0] || "there";
  const topic = tag || category.toLowerCase();

  switch (tone) {
    case "formal":
      return `Hello ${leadFirstName}, I am a DDU student interested in ${name} (${category}). I saw your focus on ${topic}${
        meetingOrDate ? ` and meetups at ${meetingOrDate}` : ""
      }. Could you please share the orientation details? Thank you!`;

    case "hype":
      return `Yo ${leadFirstName}! 🔥 Super hyped about ${name}! I've been looking for people into ${topic} at DDU. Count me in for the next meetup${
        meetingOrDate ? ` (${meetingOrDate})` : ""
      }! Let's build! 🚀`;

    case "casual":
    default:
      return `Hey ${leadFirstName}! 👋 Saw ${name} on MatchMyVibe. I'm really into ${topic} and would love to join in for ${
        meetingOrDate || "the next session"
      }. When's the best time to drop by?`;
  }
}

/**
 * Generate WhatsApp share link with pre-filled text
 */
export function getWhatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/**
 * Generate Web Share payload or fallback
 */
export function shareText(text: string): boolean {
  if (typeof window !== "undefined" && navigator.share) {
    navigator.share({ text }).catch(() => {});
    return true;
  }
  return false;
}
