import { ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { BrandLink, HeaderControls } from "./HeaderControls";
import { useLanguage } from "./useLanguage";

/** Full-screen layout for the student and teacher portals: no app sidebar. */
export function PortalLayout() {
  const { tr } = useLanguage();
  const { pathname } = useLocation();
  return (
    <div className="relative isolate flex min-h-screen flex-col overflow-hidden bg-linear-to-br from-sky-50 via-white to-emerald-50 text-slate-950 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950 dark:text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 -top-32 -z-10 size-96 rounded-full bg-subject-physics/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -right-24 -z-10 size-96 rounded-full bg-kenya-green/20 blur-3xl"
      />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-kenya-green focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-white"
      >
        {tr("Skip to content", "Ruka hadi maudhui")}
      </a>
      <header className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <BrandLink />
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="hidden min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-slate-600 transition-colors hover:bg-white/70 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white sm:flex"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {tr("Home", "Nyumbani")}
          </Link>
          <HeaderControls />
        </div>
      </header>
      <main
        id="main"
        className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-10 pt-4 sm:px-6"
      >
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex flex-1 flex-col"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
