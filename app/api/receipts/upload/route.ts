import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const listId = formData.get("listId") as string | null;
    const localUserId = formData.get("localUserId") as string | null;
    const type = (formData.get("type") as "receipt" | "photo") || "receipt";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!localUserId) {
      return NextResponse.json({ error: "Local user ID required" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Verify local user exists
    const { data: user } = await supabase
      .from("local_users")
      .select("id")
      .eq("id", localUserId)
      .single();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate receipt ID
    const receiptId = crypto.randomUUID();

    // Determine file extension
    const extension = file.name.split(".").pop() || "jpg";
    const fileName = `original.${extension}`;
    const filePath = `${localUserId}/${receiptId}/${fileName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("receipts-images")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      );
    }

    // Create receipt record
    const { data: receiptData, error: receiptError } = await supabase
      .from("receipts")
      .insert({
        id: receiptId,
        local_user_id: localUserId,
        list_id: listId || null,
        type,
        image_path: filePath,
        currency: "ILS",
      })
      .select("id")
      .single();

    if (receiptError) {
      // Clean up uploaded file if receipt creation fails
      await supabase.storage
        .from("receipts-images")
        .remove([filePath]);
      throw receiptError;
    }

    return NextResponse.json({
      receiptId: receiptData.id,
      imagePath: filePath,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
