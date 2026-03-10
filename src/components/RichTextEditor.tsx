"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import { useEffect, useRef, useState } from "react";
import { ImageUploadZone } from "@/components/ImageUploadZone";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
  disabled?: boolean;
  /** Enable image upload and YouTube embeds (default: true for threads) */
  allowMedia?: boolean;
  /** Upload endpoint for images (default: /api/upload; use /api/admin/upload for admin) */
  uploadEndpoint?: string;
}

function parseYoutubeUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  // youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID
  const match =
    trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/) ||
    trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/) ||
    trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Share your thoughts...",
  minHeight = "12rem",
  className = "",
  disabled = false,
  allowMedia = true,
  uploadEndpoint = "/api/upload",
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const extensions = [
    StarterKit,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        rel: "noopener noreferrer",
        target: "_blank",
        class: "text-accent underline hover:text-accent-hover",
      },
    }),
  ];

  if (allowMedia) {
    extensions.push(
      Image.configure({
        HTMLAttributes: { class: "rounded-lg max-w-full h-auto" },
        allowBase64: false,
      }) as any,
      Youtube.configure({
        width: 640,
        height: 360,
        nocookie: true,
      }) as any
    );
  }

  const editor = useEditor({
    extensions,
    content: value || "",
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none min-h-[8rem] focus:outline-none px-3 py-2",
        "data-placeholder": placeholder,
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  // Sync external content into editor when value prop changes
  useEffect(() => {
    if (!editor) return;
    const incoming = value ?? "";
    const current = editor.getHTML();
    if (incoming !== current) {
      editor.commands.setContent(incoming || "<p></p>", { emitUpdate: false });
    }
  }, [value, editor]);

  if (!mounted || !editor) {
    return (
      <div
        className={`rounded-md border border-gray-300 bg-white ${className}`}
        style={{ minHeight }}
      >
        <div className="border-b border-gray-200 bg-slate-50 px-2 py-1.5" />
        <div className="px-3 py-2 text-slate-400" style={{ minHeight: "8rem" }}>
          {mounted ? "Loading editor..." : ""}
        </div>
      </div>
    );
  }

  const setLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  const unsetLink = () => editor.chain().focus().unsetLink().run();

  const addImageByUrl = () => {
    const url = window.prompt("Enter image URL:");
    if (url?.trim()) {
      editor.chain().focus().setImage({ src: url.trim(), alt: "" }).run();
    }
  };

  const addYoutubeVideo = () => {
    const url = window.prompt("Enter YouTube video URL:");
    const videoId = url ? parseYoutubeUrl(url) : null;
    if (videoId) {
      editor.chain().focus().setYoutubeVideo({ src: `https://www.youtube.com/watch?v=${videoId}` }).run();
    } else if (url) {
      alert("Could not parse YouTube URL. Try a link like https://www.youtube.com/watch?v=VIDEO_ID");
    }
  };

  return (
    <div
      className={`rounded-md border border-gray-300 bg-white focus-within:border-accent focus-within:ring-1 focus-within:ring-accent ${className}`}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200 bg-slate-50 px-2 py-1.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rounded px-2 py-1 text-sm font-medium transition-colors ${
            editor.isActive("bold")
              ? "bg-slate-200 text-slate-900"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`rounded px-2 py-1 text-sm transition-colors ${
            editor.isActive("italic")
              ? "bg-slate-200 text-slate-900"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`rounded px-2 py-1 text-sm transition-colors ${
            editor.isActive("bulletList")
              ? "bg-slate-200 text-slate-900"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
          title="Bullet list"
        >
          •
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`rounded px-2 py-1 text-sm transition-colors ${
            editor.isActive("orderedList")
              ? "bg-slate-200 text-slate-900"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
          title="Numbered list"
        >
          1.
        </button>
        <span className="mx-1 border-l border-gray-200" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`rounded px-2 py-1 text-sm font-medium transition-colors ${
            editor.isActive("heading", { level: 2 })
              ? "bg-slate-200 text-slate-900"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`rounded px-2 py-1 text-sm font-medium transition-colors ${
            editor.isActive("heading", { level: 3 })
              ? "bg-slate-200 text-slate-900"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
          title="Heading 3"
        >
          H3
        </button>
        <span className="mx-1 border-l border-gray-200" />
        <button
          type="button"
          onClick={editor.isActive("link") ? unsetLink : setLink}
          className={`rounded px-2 py-1 text-sm transition-colors ${
            editor.isActive("link")
              ? "bg-slate-200 text-slate-900"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
          title="Add / remove link"
        >
          🔗
        </button>
        {allowMedia && (
          <>
            <span className="mx-1 border-l border-gray-200" />
            <ImageUploadZone
              compact
              uploadEndpoint={uploadEndpoint}
              onUpload={(url, fileName) =>
                editor.chain().focus().setImage({ src: url, alt: fileName ?? "" }).run()
              }
              disabled={disabled}
              className="inline-flex"
            />
            <button
              type="button"
              onClick={addImageByUrl}
              disabled={disabled}
              className="rounded-lg px-2 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
              title="Insert image from URL"
            >
              URL
            </button>
            <button
              type="button"
              onClick={addYoutubeVideo}
              disabled={disabled}
              className="rounded-lg px-2 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
              title="Embed YouTube video"
            >
              <span className="inline-flex items-center gap-1">▶ YouTube</span>
            </button>
          </>
        )}
        <span className="ml-1 text-xs text-slate-500">
          Paste a URL to auto-link
        </span>
      </div>

      {/* Editor */}
      <div style={{ minHeight }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
