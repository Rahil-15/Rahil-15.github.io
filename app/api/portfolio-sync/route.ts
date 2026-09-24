import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { payload, action, password, customSupabaseUrl, customSupabaseKey, customTableName } = body;

    // 1. Resolve Supabase Project URL & Keys
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || customSupabaseUrl;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || customSupabaseKey;
    // Server-only secret key (bypasses RLS for secure admin writes)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || anonKey;
    const tableName = customTableName || "portfolio_data";

    if (!supabaseUrl || !supabaseUrl.startsWith("https://")) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing Supabase Project URL." },
        { status: 400 }
      );
    }

    if (!serviceRoleKey) {
      return NextResponse.json(
        { success: false, message: "Missing Supabase Key." },
        { status: 400 }
      );
    }

    // 2. Server-side password check if ADMIN_PASSWORD is set in env
    const envAdminPassword = process.env.ADMIN_PASSWORD;
    if (envAdminPassword && password !== envAdminPassword) {
      return NextResponse.json(
        { success: false, message: "Invalid Admin Password." },
        { status: 401 }
      );
    }

    // ACTION: Admin Password Verification Only
    if (action === "verify-password") {
      return NextResponse.json({
        success: true,
        message: "Admin password verified successfully.",
        isPasswordConfigured: !!envAdminPassword,
      });
    }

    // Initialize server-side Supabase client
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // ACTION: Connection Test
    if (action === "test") {
      const { data, error } = await supabase.from(tableName).select("id").limit(1);

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
        message: `✓ Connected securely to Supabase table '${tableName}'!`,
      });
    }

    // ACTION: Secure Admin Portfolio Upsert
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
