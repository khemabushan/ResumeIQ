"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, FileText, X, AlertCircle } from "lucide-react";
import { formatFileSize } from "@/lib/utils";

interface DropZoneProps {
  file: File | null;
  error: string | null;
  onFile: (file: File) => void;
  onClear: () => void;
  disabled?: boolean;
}

export function DropZone({ file, error, onFile, onClear, disabled }: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (disabled) return;
      const dropped = e.dataTransfer.files[0];
      if (dropped) onFile(dropped);
    },
    [onFile, disabled]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setDragging(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (picked) onFile(picked);
    e.target.value = "";
  };

  if (file) {
    return (
      <div
        style={{
          border: "1px solid var(--accent-border)",
          background: "var(--accent-light)",
          borderRadius: "var(--radius-lg)",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          animation: "fadeIn 0.3s ease",
        }}
      >
        <div
          style={{
            width: "44px",
            height: "44px",
            background: "var(--accent)",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <FileText size={22} color="#fff" />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              fontWeight: 500,
              fontSize: "14px",
              color: "var(--foreground)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {file.name}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--muted)" }}>
            {formatFileSize(file.size)} · PDF
          </p>
        </div>
        {!disabled && (
          <button
            onClick={onClear}
            aria-label="Remove file"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--muted)",
              padding: "6px",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "var(--danger)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "var(--muted)")
            }
          >
            <X size={18} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => !disabled && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragging(false)}
        disabled={disabled}
        aria-label="Upload PDF resume"
        style={{
          width: "100%",
          border: `2px dashed ${dragging ? "var(--accent)" : error ? "var(--danger)" : "var(--card-border)"}`,
          background: dragging ? "var(--accent-light)" : "var(--card)",
          borderRadius: "var(--radius-lg)",
          padding: "48px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          cursor: disabled ? "not-allowed" : "pointer",
          transition: "border-color 0.2s, background 0.2s",
          outline: "none",
        }}
        onFocus={(e) =>
          (e.currentTarget.style.borderColor = "var(--accent)")
        }
        onBlur={(e) =>
          (e.currentTarget.style.borderColor = "var(--card-border)")
        }
      >
        <div
          style={{
            width: "52px",
            height: "52px",
            background: dragging ? "var(--accent)" : "var(--muted-bg)",
            borderRadius: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "background 0.2s",
          }}
        >
          <Upload size={24} color={dragging ? "#fff" : "var(--muted)"} />
        </div>
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              margin: 0,
              fontSize: "15px",
              fontWeight: 500,
              color: "var(--foreground)",
            }}
          >
            Drop your resume here
          </p>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--muted)" }}>
            or click to browse · PDF only · max 5 MB
          </p>
        </div>
      </button>

      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginTop: "10px",
            color: "var(--danger)",
            fontSize: "13px",
          }}
        >
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={handleChange}
        style={{ display: "none" }}
        aria-hidden="true"
      />
    </div>
  );
}
