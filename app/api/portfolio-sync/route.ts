import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { normalizeSupabaseUrl } from "@/lib/supabase";
import { checkAdminPassword, hashPassword, generateSalt } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      payload,
      action,
      password,
      currentPassword,
      newPassword,
      customSupabaseUrl,
      customSupabaseKey,
      customTableName,
    } = body;

    // 1. Resolve & Normalize Supabase Project URL & Keys
    const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || customSupabaseUrl || "";
    const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || customSupabaseKey;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
    const tableName = customTableName || "portfolio_data";

    if (!supabaseUrl || !supabaseUrl.startsWith("https://")) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing Supabase Project URL." },
        { status: 400 }
      );
    }

    // 2. Ensure SUPABASE_SERVICE_ROLE_KEY is present for server API execution
    if (!serviceRoleKey) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing SUPABASE_SERVICE_ROLE_KEY in server environment variables. Please add SUPABASE_SERVICE_ROLE_KEY in Netlify settings to enable secure server-side portfolio writes.",
        },
        { status: 500 }
      );
    }

    // Initialize server-side Supabase client using Service Role Key (bypasses RLS)
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // ACTION 1: Verify Password (used during Admin login)
    if (action === "verify-password") {
      const isValid = await checkAdminPassword(supabase, password);
      if (!isValid) {
        return NextResponse.json(
          { success: false, message: "Incorrect Admin Password." },
          { status: 401 }
        );
      }
      return NextResponse.json({
        success: true,
        message: "Admin password verified successfully.",
      });
    }

    // ACTION 2: Change Password (global password update)
    if (action === "change-password") {
      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { success: false, message: "Current and new passwords are required." },
          { status: 400 }
        );
      }

      if (newPassword.length < 4) {
        return NextResponse.json(
          { success: false, message: "New password must be at least 4 characters long." },
          { status: 400 }
        );
      }

      // Verify current password first
      const isCurrentValid = await checkAdminPassword(supabase, currentPassword);
      if (!isCurrentValid) {
        return NextResponse.json(
          { success: false, message: "Current Admin Password is incorrect." },
          { status: 401 }
        );
      }

      // Hash new password and save to `admin_settings` table
      const newSalt = generateSalt();
      const newHash = hashPassword(newPassword, newSalt);

      const { error: updateErr } = await supabase.from("admin_settings").upsert(
        {
          id: 1,
          password_hash: newHash,
          salt: newSalt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      if (updateErr) {
        console.error("Error updating admin_settings table:", updateErr);
        return NextResponse.json(
          { success: false, message: `Failed to update password: ${updateErr.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "✓ Admin password updated globally across all devices!",
      });
    }

    // ACTION 3: Connection Test
    if (action === "test") {
      const { error } = await supabase.from(tableName).select("id").limit(1);

      if (error) {
        if (error.code === "PGRST204" || error.message.includes("does not exist")) {
          return NextResponse.json(
            {
              success: false,
              message: `Table '${tableName}' does not exist in your Supabase database. Please create it using the provided SQL script.`,
            },
            { status: 400 }
          );
        }
        return NextResponse.json(
          { success: false, message: `Supabase Error: ${error.message}` },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `✓ Connected securely to Supabase table '${tableName}' using Service Role Key!`,
      });
    }

    // ACTION 4: Secure Portfolio Write (Requires valid password)
    const isValidPass = await checkAdminPassword(supabase, password);
    if (!isValidPass) {
      return NextResponse.json(
        { success: false, message: "Invalid Admin Password." },
        { status: 401 }
      );
    }

    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Missing portfolio payload." },
        { status: 400 }
      );
    }

    const { error: upsertError } = await supabase.from(tableName).upsert(
      {
        id: 1,
        payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (upsertError) {
      console.error("Server-side Supabase write error:", upsertError);
      return NextResponse.json(
        { success: false, message: `Database Write Error: ${upsertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "✓ Portfolio updated securely via Server API!",
    });
  } catch (err: any) {
    console.error("API Error in /api/portfolio-sync:", err);
    return NextResponse.json(
      { success: false, message: `Server Error: ${err.message || err}` },
      { status: 500 }
    );
  }
}
