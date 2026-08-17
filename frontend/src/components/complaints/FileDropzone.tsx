"use client";

import { useRef, useState } from "react";
import { UploadCloud, X, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FileDropzoneProps {
  files: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
}

export function FileDropzone({ files, onChange, maxFiles = 3, accept = "image/png,image/jpeg,image/jpg" }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function addFiles(newFiles: FileList | null) {
    if (!newFiles) return;
    const combined = [...files, ...Array.from(newFiles)].slice(0, maxFiles);
    onChange(combined);
  }

  function removeFile(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors ${
          isDragging
            ? "border-blue-400 bg-blue-50 dark:border-[var(--brand-accent)] dark:bg-[var(--brand-accent-glow)]"
            : "border-gray-300 dark:border-[var(--border-strong)] hover:border-gray-400 dark:hover:border-[var(--border-strong)]"
        }`}
      >
        <UploadCloud className="h-8 w-8 text-gray-400 dark:text-[var(--text-muted)]" />
        <p className="mt-2 text-sm text-gray-600 dark:text-[var(--text-muted)]">
          <span className="font-medium text-blue-600 dark:text-[var(--brand-accent)]">Click to upload</span> or drag and drop
        </p>
        <p className="mt-1 text-xs text-gray-400 dark:text-[var(--text-muted)]">PNG, JPG, JPEG — max {maxFiles} files, 5MB each</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>
      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-md elev-1 border border-gray-200 dark:border-transparent bg-white px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-2 truncate text-gray-700 dark:text-[var(--text-secondary)]">
                <Paperclip className="h-4 w-4 shrink-0 text-gray-400 dark:text-[var(--text-muted)]" />
                <span className="truncate">{file.name}</span>
              </span>
              <Button type="button" variant="ghost" size="icon" onClick={() => removeFile(index)} aria-label="Remove file">
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
