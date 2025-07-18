import { supabase } from "@/supabase/supabase-client";

export const getCoverLetterUsage = async (userId: string) => {
  const { data, error } = await supabase
    .from("profiles")
    .select("cover_letter_count, last_reset_date")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
};

export const resetMonthlyLimits = async () => {
  const { error } = await supabase
    .from("profiles")
    .update({
      cover_letter_count: 0,
      last_reset_date: new Date().toISOString(),
    })
    .neq("role", "premium-user");

  if (error) console.error("Limit reset error:", error);
};

export const canGenerateCoverLetter = async (userId: string, role: string) => {
  if (role === "premium-user") return true;

  const usage = await getCoverLetterUsage(userId);

  const now = new Date();
  const lastReset = usage.last_reset_date
    ? new Date(usage.last_reset_date)
    : now;
  const needsReset = now.getMonth() !== lastReset.getMonth();

  if (needsReset) {
    await supabase
      .from("profiles")
      .update({ cover_letter_count: 0, last_reset_date: now.toISOString() })
      .eq("id", userId);
    return true;
  }

  return usage.cover_letter_count < 3;
};

// Increment usage counter
export const incrementCoverLetterCount = async (userId: string) => {
  await supabase.rpc("increment_cover_letter_count", { user_id: userId });
};
