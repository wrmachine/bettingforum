"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import { useEffect, useState } from "react";
import { ImageUploadZone } from "@/components/ImageUploadZone";

interface ProductContentEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

export function ProductContentEditor({
  value,
  onChange,
  placeholder = "Write your product review...",
  minHeight = "20rem",
  className = "",
}: ProductContentEditorProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          target: "_blank",
          class: "text-accent underline hover:text-accent-hover",
        },
      }),
      Image.configure({
        HTMLAttributes: { class: "rounded-lg max-w-full h-auto" },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: value || "",
    editable: true,
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-slate prose-lg max-w-none min-h-[16rem] focus:outline-none px-4 py-3 prose-headings:font-semibold prose-headings:text-gray-900 prose-p:text-gray-800 prose-table:border prose-table:border-slate-200 prose-th:bg-slate-100 prose-th:px-4 prose-th:py-2 prose-td:px-4 prose-td:py-2",
        "data-placeholder": placeholder,
      },
    },
  });

  // Sync external content (e.g. from AI Complete) into editor
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
        className={`rounded-lg border border-slate-300 bg-white ${className}`}
        style={{ minHeight }}
      >
        <div className="border-b border-slate-200 bg-slate-50 px-3 py-2" />
        <div className="px-4 py-8 text-slate-400">Loading editor...</div>
      </div>
    );
  }

  const setLink = () => {
    const url = window.prompt("Enter URL:");
    if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };
  const unsetLink = () => editor.chain().focus().unsetLink().run();

  return (
    <div
      className={`rounded-lg border border-slate-300 bg-white focus-within:border-accent focus-within:ring-1 focus-within:ring-accent ${className}`}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50 px-3 py-2">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rounded px-2 py-1 text-sm font-medium transition-colors ${
            editor.isActive("bold") ? "bg-slate-200 text-slate-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`rounded px-2 py-1 text-sm transition-colors ${
            editor.isActive("italic") ? "bg-slate-200 text-slate-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`rounded px-2 py-1 text-sm transition-colors ${
            editor.isActive("heading", { level: 1 }) ? "bg-slate-200 text-slate-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`rounded px-2 py-1 text-sm transition-colors ${
            editor.isActive("heading", { level: 2 }) ? "bg-slate-200 text-slate-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`rounded px-2 py-1 text-sm transition-colors ${
            editor.isActive("heading", { level: 3 }) ? "bg-slate-200 text-slate-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
          title="Heading 3"
        >
          H3
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`rounded px-2 py-1 text-sm transition-colors ${
            editor.isActive("bulletList") ? "bg-slate-200 text-slate-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
          title="Bullet list"
        >
          •
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`rounded px-2 py-1 text-sm transition-colors ${
            editor.isActive("orderedList") ? "bg-slate-200 text-slate-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
          title="Numbered list"
        >
          1.
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`rounded px-2 py-1 text-sm transition-colors ${
            editor.isActive("blockquote") ? "bg-slate-200 text-slate-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
          title="Quote"
        >
          &quot;
        </button>
        <span className="mx-1 border-l border-slate-200" />
        <button
          type="button"
          onClick={editor.isActive("link") ? unsetLink : setLink}
          className={`rounded px-2 py-1 text-sm transition-colors ${
            editor.isActive("link") ? "bg-slate-200 text-slate-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
          title="Link"
        >
          🔗
        </button>
        <ImageUploadZone
          compact
          uploadEndpoint="/api/admin/upload"
          onUpload={(url, fileName) =>
            editor.chain().focus().setImage({ src: url, alt: fileName ?? "" }).run()
          }
          className="inline-flex"
        />
        <button
          type="button"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          className="rounded px-2 py-1 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          title="Insert table"
        >
          ⊞
        </button>
      </div>

      {/* Editor */}
      <div style={{ minHeight }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
