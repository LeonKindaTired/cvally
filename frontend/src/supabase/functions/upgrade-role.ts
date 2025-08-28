import { supabase } from "@/supabase/supabase-client";

export const upgradeUserRole = async (userId: string) => {
  console.log("Upgrade service called for user:", userId);

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

    console.log("Current role:", currentProfile?.role);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: "premium-user" })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating role:", updateError);
      throw updateError;
    }

    console.log("Role updated in database");

    const { data: updatedProfile, error: verifyError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (verifyError) {
      console.error("Error verifying update:", verifyError);
      throw verifyError;
    }

    console.log("Updated role verification:", updatedProfile?.role);

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
