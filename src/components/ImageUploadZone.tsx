"use client";

import { useRef, useState } from "react";

interface ImageUploadZoneProps {
  /** Upload endpoint (e.g. /api/admin/upload or /api/upload) */
  uploadEndpoint: string;
  /** Current image URL - when set, shows preview instead of drop zone */
  value?: string;
  /** Called when image URL changes (single-image mode) */
  onChange?: (url: string) => void;
  /** Called when a new image is uploaded (additive mode - e.g. for media galleries) */
  onUpload?: (url: string, fileName?: string) => void;
  /** Placeholder / empty state label */
  label?: string;
  /** Compact mode for toolbar / inline use */
  compact?: boolean;
  disabled?: boolean;
  accept?: string;
  className?: string;
  /** For single-image: allow paste URL input */
  allowUrlInput?: boolean;
  /** Preview image fit: cover (default) or contain (better for logos) */
  previewFit?: "cover" | "contain";
}

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export function ImageUploadZone({
  uploadEndpoint,
  value,
  onChange,
  onUpload,
  label = "Drop image here or click to upload",
  compact = false,
  disabled = false,
  accept = ACCEPT,
  className = "",
  allowUrlInput = true,
  previewFit = "cover",
}: ImageUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const isSingleMode = onChange !== undefined;
  const hasPreview = isSingleMode && value && value.trim() !== "";

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(uploadEndpoint, {
      method: "POST",
      body: formData,
      credentials: "same-origin",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(typeof err?.error === "string" ? err.error : "Upload failed");
    }
    const { url } = await res.json();
    return url.startsWith("/") && typeof window !== "undefined"
      ? `${window.location.origin}${url}`
      : url;
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      if (onChange) onChange(url);
      if (onUpload) onUpload(url, file.name);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled || uploading) return;
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handlePasteUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    if (onChange) onChange(url);
    setUrlInput("");
  };

  const removeImage = () => {
    if (onChange) onChange("");
  };

  if (compact) {
    return (
      <div className={className}>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-felt/10 hover:text-felt focus:outline-none focus:ring-2 focus:ring-felt/30 disabled:opacity-50"
          title="Upload image"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6 6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
      />

      {hasPreview ? (
        <div className="group relative inline-block">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm ring-1 ring-slate-900/5">
            <img
              src={
                value!.startsWith("/") && typeof window !== "undefined"
                  ? `${window.location.origin}${value}`
                  : value
              }
              alt="Preview"
              className={`h-40 w-auto max-w-xs transition-transform group-hover:scale-[1.02] ${
                previewFit === "contain" ? "object-contain" : "object-cover"
              }`}
            />
            <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-xl bg-slate-900/60 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={disabled || uploading}
                className="rounded-lg bg-white/90 px-4 py-2 text-sm font-medium text-slate-900 shadow-lg transition hover:bg-white disabled:opacity-50"
              >
                {uploading ? "Uploading…" : "Replace"}
              </button>
              {isSingleMode && (
                <button
                  type="button"
                  onClick={removeImage}
                  disabled={disabled}
                  className="rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500/90 disabled:opacity-50"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && !uploading && inputRef.current?.click()}
          className={`
            relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed
            transition-all duration-200
            ${dragOver ? "border-felt bg-felt/5 scale-[1.01]" : "border-slate-200 bg-slate-50/80 hover:border-slate-300 hover:bg-slate-100/80"}
            ${disabled || uploading ? "cursor-not-allowed opacity-60" : ""}
          `}
        >
          <div className="flex flex-col items-center justify-center p-8 text-center">
            {uploading ? (
              <>
                <div className="mb-3 h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-felt" />
                <p className="text-sm font-medium text-slate-600">Uploading…</p>
              </>
            ) : (
              <>
                <div
                  className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${
                    dragOver ? "bg-felt/20 text-felt" : "bg-slate-200/80 text-slate-500"
                  }`}
                >
                  <svg
                    className="h-7 w-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6 6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <p className="text-base font-medium text-slate-700">{label}</p>
                <p className="mt-1 text-xs text-slate-500">
                  PNG, JPG, WebP, GIF • Drag & drop or click
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {allowUrlInput && isSingleMode && (
        <div className="flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handlePasteUrl())}
            placeholder="Or paste image URL"
            className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-felt focus:outline-none focus:ring-1 focus:ring-felt"
          />
          <button
            type="button"
            onClick={handlePasteUrl}
            disabled={!urlInput.trim()}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Use URL
          </button>
        </div>
      )}
    </div>
  );
}
