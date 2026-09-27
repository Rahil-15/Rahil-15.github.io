import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { normalizeSupabaseUrl } from "@/lib/supabase";
import crypto from "crypto";

// Secure PBKDF2 Password Hashing (100,000 iterations, SHA-512)
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const computed = hashPassword(password, salt);
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
  } catch (e) {
    return false;
  }
}

// Fetch or initialize central Admin Password Hash from `admin_settings` table
async function getOrInitAdminPasswordHash(supabase: any): Promise<{ hash: string; salt: string } | null> {
  try {
    // 1. Try fetching existing hash from `admin_settings` table
    const { data, error } = await supabase
      .from("admin_settings")
      .select("password_hash, salt")
      .eq("id", 1)
      .maybeSingle();

    if (data && data.password_hash) {
      return { hash: data.password_hash, salt: data.salt || "rahil_portfolio_salt_v1" };
    }

    // 2. If no record in database, bootstrap initial hash using process.env.ADMIN_PASSWORD
    const initialPassword = process.env.ADMIN_PASSWORD || "admin";
    const salt = crypto.randomBytes(16).toString("hex");
    const hash = hashPassword(initialPassword, salt);

    // Attempt saving initial hash to database
    const { error: insertError } = await supabase.from("admin_settings").upsert(
      {
        id: 1,
        password_hash: hash,
        salt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (insertError) {
      console.warn("Could not insert initial admin_settings record (run SQL script to create table):", insertError.message);
    }

    return { hash, salt };
  } catch (e) {
    console.error("Error in getOrInitAdminPasswordHash:", e);
    return null;
  }
}

// Verify given password against central hash (or env fallback if DB table not ready)
async function checkAdminPassword(supabase: any, passwordInput: string): Promise<boolean> {
  if (!passwordInput) return false;

  const creds = await getOrInitAdminPasswordHash(supabase);
  if (!creds) {
    const envPass = process.env.ADMIN_PASSWORD;
    if (envPass) return passwordInput === envPass;
    return false;
  }

  const isValid = verifyPassword(passwordInput, creds.hash, creds.salt);
  
  // Edge-case migration fallback: if env ADMIN_PASSWORD matches but stored hash differs, update stored hash
  if (!isValid && process.env.ADMIN_PASSWORD && passwordInput === process.env.ADMIN_PASSWORD) {
    const newSalt = crypto.randomBytes(16).toString("hex");
    const newHash = hashPassword(passwordInput, newSalt);
    await supabase.from("admin_settings").upsert(
      {
        id: 1,
        password_hash: newHash,
        salt: newSalt,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
    return true;
  }

  return isValid;
}

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
      const newSalt = crypto.randomBytes(16).toString("hex");
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
