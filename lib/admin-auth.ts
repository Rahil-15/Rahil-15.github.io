import crypto from "crypto";

export function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

// Secure PBKDF2 Password Hashing (100,000 iterations, SHA-512)
export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const computed = hashPassword(password, salt);
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
  } catch (e) {
    return false;
  }
}

// Fetch or initialize central Admin Password Hash from `admin_settings` table
export async function getOrInitAdminPasswordHash(supabase: any): Promise<{ hash: string; salt: string } | null> {
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
export async function checkAdminPassword(supabase: any, passwordInput: string): Promise<boolean> {
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
