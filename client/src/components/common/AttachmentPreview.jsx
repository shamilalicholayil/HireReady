import { Download, File as FileIcon } from "lucide-react";

function formatBytes(bytes) {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(size < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
}

export default function AttachmentPreview({ attachment }) {
  const { url, type, name, size } = attachment;

  if (type === "image") {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <img
          src={url}
          alt={name || "attachment"}
          className="max-w-[240px] max-h-[240px] rounded-lg object-cover border border-[var(--border)]"
        />
      </a>
    );
  }

  if (type === "video") {
    return (
      <video
        src={url}
        controls
        className="max-w-[280px] max-h-[280px] rounded-lg border border-[var(--border)]"
      />
    );
  }

  if (type === "audio") {
    return <audio src={url} controls className="max-w-[240px]" />;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      download={name}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/20 border border-[var(--border)] hover:bg-black/30 transition max-w-[240px]"
    >
      <FileIcon size={20} className="shrink-0 text-[var(--text-secondary)]" />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-[var(--text-primary)] truncate">
          {name || "Download file"}
        </p>
        {size && (
          <p className="text-[10px] text-[var(--text-secondary)]">
            {formatBytes(size)}
          </p>
        )}
      </div>
      <Download size={14} className="shrink-0 text-[var(--text-secondary)]" />
    </a>
  );
}
