import { useState, type ReactNode } from "react";
import { useLanguage } from "../../../app/useLanguage";
import { dangerButton, secondaryButton } from "./styles";

type Props = {
  children: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  disabled?: boolean;
};

/** A destructive action that asks once more before it runs. */
export function ConfirmButton({
  children,
  confirmLabel,
  onConfirm,
  disabled,
}: Props) {
  const { tr } = useLanguage();
  const [asking, setAsking] = useState(false);
  if (!asking) {
    return (
      <button
        type="button"
        onClick={() => setAsking(true)}
        disabled={disabled}
        className={secondaryButton}
      >
        {children}
      </button>
    );
  }
  return (
    <span className="inline-flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => {
          setAsking(false);
          onConfirm();
        }}
        className={dangerButton}
      >
        {confirmLabel}
      </button>
      <button
        type="button"
        onClick={() => setAsking(false)}
        className={secondaryButton}
      >
        {tr("Cancel", "Ghairi")}
      </button>
    </span>
  );
}
