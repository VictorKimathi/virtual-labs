import type { ReactNode } from "react";

type AccountCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

/** The centred white card every sign-in and sign-up screen sits in. */
export function AccountCard({
  title,
  subtitle,
  children,
  footer,
}: AccountCardProps) {
  return (
    <div className="flex flex-1 items-center justify-center py-6">
      <section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl shadow-slate-900/10 dark:bg-slate-900 dark:shadow-black/40 sm:p-8">
        <h1 className="text-center text-2xl font-black tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-300">
            {subtitle}
          </p>
        )}
        <div className="mt-6">{children}</div>
        {footer && (
          <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
            {footer}
          </div>
        )}
      </section>
    </div>
  );
}
