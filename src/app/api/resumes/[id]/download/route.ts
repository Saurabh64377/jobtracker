import { NextRequest, NextResponse } from "next/server";
import { requireUser, AuthError } from "@/lib/api/guards";
import { getResumeForDownload } from "@/lib/services/resume-service";
import { readStoredFile, extensionForMimeType } from "@/lib/services/file-storage";
import { ServiceError } from "@/lib/services/auth-service";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;
    const resume = await getResumeForDownload(user.id, id);
    const buffer = await readStoredFile(resume.fileUrl, resume.mimeType);

    const ext = extensionForMimeType(resume.mimeType);
    const hasExt = resume.name.toLowerCase().endsWith(`.${ext}`);
    const filename = hasExt ? resume.name : `${resume.name}.${ext}`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": resume.mimeType ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ success: false, error: { message: err.message } }, { status: err.status });
    }
    if (err instanceof ServiceError) {
      return NextResponse.json({ success: false, error: { message: err.message } }, { status: err.status });
    }
    console.error("[RESUME_DOWNLOAD_ERROR]", err);
    return NextResponse.json({ success: false, error: { message: "Could not download file." } }, { status: 500 });
  }
}
