import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { normalizeSupabaseUrl } from "@/lib/supabase";
import { checkAdminPassword } from "@/lib/admin-auth";

const BUCKET_NAME = "portfolio-assets";

// Helper to sanitize filename to prevent collisions and illegal characters
function sanitizeFilename(originalName: string): string {
  const extIndex = originalName.lastIndexOf(".");
  const nameWithoutExt = extIndex !== -1 ? originalName.slice(0, extIndex) : originalName;
  const ext = extIndex !== -1 ? originalName.slice(extIndex).toLowerCase() : "";
  const cleanedName = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50);
  return `${cleanedName}${ext}`;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const password = (formData.get("password") as string) || "";
    const type = (formData.get("type") as string) || "certificate"; // "resume" | "certificate"
    const certId = (formData.get("certId") as string) || "";
    const customSupabaseUrl = (formData.get("customSupabaseUrl") as string) || "";
    const customSupabaseKey = (formData.get("customSupabaseKey") as string) || "";

    if (!file) {
      return NextResponse.json({ success: false, message: "No file uploaded." }, { status: 400 });
    }

    // 1. Resolve Supabase Service Role Client
    const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || customSupabaseUrl || "";
    const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseUrl.startsWith("https://")) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing Supabase Project URL." },
        { status: 400 }
      );
    }

    if (!serviceRoleKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Missing SUPABASE_SERVICE_ROLE_KEY in server environment variables.",
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 2. Strict Password Authentication Check
    const isValidPass = await checkAdminPassword(supabase, password);
    if (!isValidPass) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid Admin Password." },
        { status: 401 }
      );
    }

    // 3. Strict Server-Side MIME Type & Extension Validation
    const originalName = file.name || "";
    const fileExt = originalName.slice(originalName.lastIndexOf(".")).toLowerCase();
    const mimeType = file.type.toLowerCase();

    if (type === "resume") {
      // Validate PDF
      if (fileExt !== ".pdf" || (mimeType && mimeType !== "application/pdf" && mimeType !== "application/x-pdf")) {
        return NextResponse.json(
          { success: false, message: "Invalid file type. Resume must be a valid PDF document (.pdf)." },
          { status: 400 }
        );
      }

      // Max size: 15MB
      if (file.size > 15 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, message: "Resume file size exceeds maximum limit of 15MB." },
          { status: 400 }
        );
      }
    } else {
      // Validate Certificate Image
      const validImageExts = [".jpg", ".jpeg", ".png", ".webp"];
      const validMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

      if (!validImageExts.includes(fileExt) || (mimeType && !validMimeTypes.includes(mimeType))) {
        return NextResponse.json(
          { success: false, message: "Invalid image format. Certificate must be a JPG, JPEG, PNG, or WEBP image." },
          { status: 400 }
        );
      }

      // Max size: 10MB
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, message: "Certificate image size exceeds maximum limit of 10MB." },
          { status: 400 }
        );
      }
    }

    // 4. Ensure Storage Bucket exists (auto-create only if missing)
    const { data: bucket, error: getBucketErr } = await supabase.storage.getBucket(BUCKET_NAME);
    if (getBucketErr || !bucket) {
      const { error: createErr } = await supabase.storage.createBucket(BUCKET_NAME, {
        public: true,
        fileSizeLimit: 20 * 1024 * 1024,
      });
      if (createErr && !createErr.message.includes("already exists")) {
        console.warn("Storage bucket creation notice:", createErr.message);
      }
    }

    // 5. Generate Collision-Free File Path
    const cleanFileName = sanitizeFilename(originalName);
    const timestamp = Date.now();
    let filePath = "";

    if (type === "resume") {
      filePath = `resume/resume_${timestamp}_${cleanFileName}`;
    } else {
      const safeCertFolder = certId ? certId.replace(/[^a-zA-Z0-9_-]/g, "_") : `cert_${timestamp}`;
      filePath = `certificates/${safeCertFolder}/cert_${timestamp}_${cleanFileName}`;
    }

    // Convert file to ArrayBuffer/Buffer for Supabase Storage Upload
    const fileArrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(fileArrayBuffer);

    // 6. Upload file to Supabase Storage
    const { data: uploadData, error: uploadErr } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType: mimeType || (type === "resume" ? "application/pdf" : "image/jpeg"),
        upsert: true,
      });

    if (uploadErr) {
      console.error("Supabase Storage upload error:", uploadErr);
      return NextResponse.json(
        { success: false, message: `Storage Upload Error: ${uploadErr.message}` },
        { status: 500 }
      );
    }

    // 7. Get Public Access URL
    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;

    return NextResponse.json({
      success: true,
      message: "✓ File uploaded successfully to cloud storage!",
      publicUrl,
      filePath,
      fileName: originalName,
    });
  } catch (err: any) {
    console.error("API Error in /api/portfolio-upload POST:", err);
    return NextResponse.json(
      { success: false, message: `Server Upload Error: ${err.message || err}` },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { password, filePath, customSupabaseUrl, customSupabaseKey } = body;

    if (!filePath) {
      return NextResponse.json({ success: false, message: "File path is required." }, { status: 400 });
    }

    // Strict Security Path Validation (Prevent path traversal)
    if (filePath.includes("..") || filePath.startsWith("/") || (!filePath.startsWith("resume/") && !filePath.startsWith("certificates/"))) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Invalid file path target." },
        { status: 403 }
      );
    }

    // Resolve Supabase Client
    const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || customSupabaseUrl || "";
    const supabaseUrl = normalizeSupabaseUrl(rawSupabaseUrl);
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { success: false, message: "Missing Supabase configuration or Service Role Key." },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Verify Admin Password
    const isValidPass = await checkAdminPassword(supabase, password);
    if (!isValidPass) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid Admin Password." },
        { status: 401 }
      );
    }

    // Remove file from storage
    const { error: removeErr } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    if (removeErr) {
      console.warn("Storage delete notice:", removeErr.message);
    }

    return NextResponse.json({
      success: true,
      message: "File deleted successfully from storage.",
    });
  } catch (err: any) {
    console.error("API Error in /api/portfolio-upload DELETE:", err);
    return NextResponse.json(
      { success: false, message: `Server Delete Error: ${err.message || err}` },
      { status: 500 }
    );
  }
}
