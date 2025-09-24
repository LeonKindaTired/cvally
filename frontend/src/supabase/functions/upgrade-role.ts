import { supabase } from "@/supabase/supabase-client";

export const upgradeUserRole = async (userId: string) => {

  try {
    const { data: currentProfile, error: fetchError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (fetchError) {
      console.error("Error fetching current profile:", fetchError);
      throw fetchError;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: "premium-user" })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating role:", updateError);
      throw updateError;
    }

    const { data: updatedProfile, error: verifyError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (verifyError) {
      console.error("Error verifying update:", verifyError);
      throw verifyError;
    }

    return {
      success: updatedProfile?.role === "premium-user",
      newRole: updatedProfile?.role,
    };
  } catch (error) {
    console.error("Role upgrade error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};
