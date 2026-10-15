"use client";

import { useState } from "react";
import { UploadButton } from "@/utils/uploadthing";
import { Camera, User, Building2, CheckCircle2, Trash2, Link as LinkIcon, X } from "lucide-react";

interface PhotoUploadFieldProps {
  label: string;
  sublabel?: string;
  value?: string;
  onChange: (url: string) => void;
  name?: string;
  shape?: "circle" | "rounded";
  iconType?: "user" | "building";
  className?: string;
  required?: boolean;
}

export default function PhotoUploadField({
  label,
  sublabel = "Upload a clear headshot or company logo (PNG, JPG up to 4MB)",
  value = "",
  onChange,
  name = "avatar",
  shape = "circle",
  iconType = "user",
  className = "",
}: PhotoUploadFieldProps) {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const isCircle = shape === "circle";
  const avatarRadius = isCircle ? "rounded-full" : "rounded-2xl";

  const handleManualApply = () => {
    if (manualUrl.trim()) {
      onChange(manualUrl.trim());
      setShowUrlInput(false);
      setManualUrl("");
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-[var(--canvas)] border border-[var(--line)] ${className}`}>
      <input type="hidden" name={name} value={value || ""} />
      
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        {/* Avatar Preview */}
        <div className="relative shrink-0">
          <div
            className={`w-24 h-24 ${avatarRadius} border-2 overflow-hidden bg-white flex items-center justify-center shadow-sm transition-all ${
              value ? "border-[var(--ng)] shadow-[var(--ng)]/10" : "border-dashed border-[var(--line)]"
            }`}
          >
            {value ? (
              <img
                src={value}
                alt={label}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground/60 gap-1">
                {iconType === "building" ? (
                  <Building2 size={32} className="text-[var(--ng)]/60" />
                ) : (
                  <User size={32} className="text-[var(--ng)]/60" />
                )}
                <Camera size={14} className="text-black/40" />
              </div>
            )}
          </div>

          {value && (
            <div
              className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[var(--ng)] text-white flex items-center justify-center shadow-md border-2 border-white"
              title="Photo attached"
            >
              <CheckCircle2 size={14} strokeWidth={3} />
            </div>
          )}
        </div>

        {/* Controls & Details */}
        <div className="flex-1 text-center sm:text-left space-y-2 w-full">
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <label className="text-sm font-bold text-[var(--ink)] [font-family:var(--font-plus-jakarta)]">
                {label}
              </label>
              {value ? (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                  Attached
                </span>
              ) : (
                <span className="text-[11px] font-medium text-black/50 bg-black/5 px-2 py-0.5 rounded-full">
                  Recommended
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--ink-soft)] mt-0.5 leading-relaxed">
              {sublabel}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            {/* UploadThing Button */}
            <div className="relative inline-block">
              <UploadButton
                endpoint="imageUploader"
                onUploadBegin={() => setIsUploading(true)}
                onClientUploadComplete={(res) => {
                  setIsUploading(false);
                  if (res && res[0]) {
                    const uploadedUrl = res[0].url || (res[0] as any).ufsUrl;
                    if (uploadedUrl) {
                      onChange(uploadedUrl);
                    }
                  }
                }}
                onUploadError={(err: Error) => {
                  setIsUploading(false);
                  alert(`Upload error: ${err.message}`);
                }}
                appearance={{
                  container: "w-auto",
                  button: `h-9 px-4 rounded-xl text-xs font-bold transition-all ${
                    value
                      ? "bg-white border border-[var(--line)] text-black hover:bg-[var(--paper)]"
                      : "bg-[var(--ng)] text-white hover:opacity-90 shadow-sm shadow-[var(--ng)]/20"
                  }`,
                  allowedContent: "hidden",
                }}
                content={{
                  button({ ready }) {
                    if (isUploading) return "Uploading...";
                    if (value) return "Change Photo";
                    return ready ? "Upload Photo" : "Preparing...";
                  },
                }}
              />
            </div>

            {/* Remove Button */}
            {value && (
              <button
                type="button"
                onClick={handleRemove}
                className="h-9 px-3 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors inline-flex items-center gap-1.5"
              >
                <Trash2 size={13} />
                <span>Remove</span>
              </button>
            )}

            {/* Enter URL toggle */}
            {!showUrlInput && (
              <button
                type="button"
                onClick={() => setShowUrlInput(true)}
                className="h-9 px-3 text-xs text-[var(--ink-soft)] hover:text-[var(--ink)] font-medium inline-flex items-center gap-1 transition-colors"
              >
                <LinkIcon size={12} />
                <span>Paste image URL</span>
              </button>
            )}
          </div>

          {/* Manual URL Input dropdown */}
          {showUrlInput && (
            <div className="flex items-center gap-2 pt-2 animate-in fade-in duration-200">
              <input
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                className="flex-1 h-9 px-3 rounded-lg border border-[var(--line)] bg-white text-xs text-black focus:outline-none focus:border-[var(--ng)]"
              />
              <button
                type="button"
                onClick={handleManualApply}
                disabled={!manualUrl.trim()}
                className="h-9 px-3 rounded-lg bg-[var(--ng)] text-white text-xs font-bold disabled:opacity-50"
              >
                Apply
              </button>
              <button
                type="button"
                onClick={() => setShowUrlInput(false)}
                className="h-9 w-9 rounded-lg border border-[var(--line)] bg-white text-muted-foreground flex items-center justify-center hover:bg-gray-50"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
