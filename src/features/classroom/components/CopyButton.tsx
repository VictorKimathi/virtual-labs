import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "../../../app/useLanguage";
import { logError } from "../../../shared/errors/appError";
import { secondaryButton } from "./styles";

export function CopyButton({ value, label }: { value: string; label: string }) {
  const { tr } = useLanguage();
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((error: unknown) => logError("classroom-copy", error));
  };
  return (
    <button type="button" onClick={copy} className={secondaryButton}>
      {copied ? (
        <Check
          className="size-4 text-kenya-green dark:text-green-400"
          aria-hidden="true"
        />
      ) : (
        <Copy className="size-4" aria-hidden="true" />
      )}
      <span aria-live="polite">
        {copied ? tr("Copied", "Imenakiliwa") : label}
      </span>
    </button>
  );
}
