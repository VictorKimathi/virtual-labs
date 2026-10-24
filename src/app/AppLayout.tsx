import {
  AudioWaveform,
  Atom,
  BookOpen,
  ChartNoAxesColumn,
  FlaskConical,
  House,
  Menu,
  MonitorPlay,
  Moon,
  Orbit,
  School,
  Sun,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useLanguage } from "./useLanguage";
import { useTheme } from "./useTheme";

type NavItem = {
  to: string;
  label: string;
  icon: typeof House;
  alsoActive?: string[];
};

type NavSection = {
  id: string;
  label: string;
  items: NavItem[];
};

function SideLink({
  to,
  label,
  icon: Icon,
  alsoActive,
  onNavigate,
}: NavItem & { onNavigate: () => void }) {
  const { pathname } = useLocation();
  const forced = Boolean(
    alsoActive?.some((prefix) => pathname.startsWith(prefix)),
  );
  return (
    <NavLink
      to={to}
      end
      onClick={onNavigate}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${isActive || forced ? "bg-green-50 text-kenya-green dark:bg-green-950 dark:text-green-300" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"}`
      }
    >
      {({ isActive }) => (
        <>
          {(isActive || forced) && (
            <span
              aria-hidden="true"
              className="absolute inset-y-2 left-0 w-1 rounded-full bg-kenya-green dark:bg-green-400"
            />
          )}
          <Icon
            className="size-5 shrink-0 transition-transform group-hover:scale-110"
            aria-hidden="true"
          />
          <span className="min-w-0 truncate text-sm font-bold">{label}</span>
        </>
      )}
    </NavLink>
  );
}

export function AppLayout() {
  const { language, toggleLanguage, tr } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const closeMenu = () => setMenuOpen(false);
  const navSections: NavSection[] = [
    {
      id: "learn",
      label: tr("Learn", "Jifunze"),
      items: [
        {
          to: "/labs",
          label: tr("Guided lessons", "Masomo yenye mwongozo"),
          icon: BookOpen,
        },
      ],
    },
    {
      id: "practice",
      label: tr("Practice", "Fanya mazoezi"),
      items: [
        {
          to: "/workbench",
          label: tr("Practice bench", "Benchi la mazoezi"),
          icon: FlaskConical,
          alsoActive: ["/chemistry", "/sandbox"],
        },
      ],
    },
    {
      id: "explore",
      label: tr("Explore", "Chunguza"),
      items: [
        {
          to: "/simulations",
          label: tr("PhET simulations", "Uigaji wa PhET"),
          icon: MonitorPlay,
        },
        {
          to: "/falstad",
          label: tr("Circuits & waves", "Sakiti na mawimbi"),
          icon: AudioWaveform,
        },
        {
          to: "/physicshub",
          label: tr("PhysicsHub", "PhysicsHub"),
          icon: Orbit,
        },
      ],
    },
  ];
  const accountItems: NavItem[] = [
    {
      to: "/progress",
      label: tr("Progress", "Maendeleo"),
      icon: ChartNoAxesColumn,
    },
    {
      to: "/schools",
      label: tr("School plans", "Mipango ya shule"),
      icon: School,
    },
  ];
  const navigation = (
    <div className="space-y-5 pt-4">
      <SideLink
        to="/"
        label={tr("Home", "Nyumbani")}
        icon={House}
        onNavigate={closeMenu}
      />
      {navSections.map(({ id, label: sectionLabel, items }) => (
        <section key={id} aria-labelledby={`${id}-nav`}>
          <h2
            id={`${id}-nav`}
            className="px-3 text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500"
          >
            {sectionLabel}
          </h2>
          <div className="mt-1 space-y-1">
            {items.map((item) => (
              <SideLink key={item.to} {...item} onNavigate={closeMenu} />
            ))}
          </div>
        </section>
      ))}
      <div className="space-y-1 border-t border-slate-200 pt-3 dark:border-slate-800">
        {accountItems.map((item) => (
          <SideLink key={item.to} {...item} onNavigate={closeMenu} />
        ))}
      </div>
    </div>
  );
  const iconButton =
    "flex size-11 items-center justify-center rounded-xl border border-slate-200 transition-colors hover:border-kenya-green hover:bg-green-50 dark:border-slate-700 dark:hover:bg-slate-800";
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-kenya-green focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-white"
      >
        {tr("Skip to content", "Ruka hadi maudhui")}
      </a>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={
                menuOpen
                  ? tr("Close menu", "Funga menyu")
                  : tr("Open menu", "Fungua menyu")
              }
              aria-expanded={menuOpen}
              className={`${iconButton} md:hidden`}
            >
              {menuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
            <Link to="/" className="group flex min-w-0 items-center gap-2.5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-kenya-green to-emerald-600 text-white shadow-md shadow-kenya-green/30 transition-transform duration-500 group-hover:rotate-180">
                <Atom className="size-6" aria-hidden="true" />
              </span>
              <span className="truncate text-base font-black tracking-tight sm:text-lg">
                Bunifu Labz
              </span>
            </Link>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label={tr("Switch language", "Badilisha lugha")}
              className="min-h-11 rounded-xl border border-slate-200 px-3 text-xs font-extrabold transition-colors hover:border-kenya-green hover:bg-green-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              <span
                className={
                  language === "en"
                    ? "text-kenya-green dark:text-green-400"
                    : "text-slate-400"
                }
              >
                EN
              </span>
              <span className="mx-1 text-slate-300">/</span>
              <span
                className={
                  language === "sw"
                    ? "text-kenya-green dark:text-green-400"
                    : "text-slate-400"
                }
              >
                SW
              </span>
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={tr(
                `Switch to ${theme === "light" ? "dark" : "light"} theme`,
                "Badilisha mandhari",
              )}
              className={iconButton}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex"
                >
                  {theme === "light" ? (
                    <Moon className="size-5" />
                  ) : (
                    <Sun className="size-5" />
                  )}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>
      <aside className="fixed inset-y-0 left-0 top-16 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900 md:flex">
        <nav aria-label={tr("Main navigation", "Urambazaji mkuu")}>
          {navigation}
        </nav>
      </aside>
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              key="scrim"
              type="button"
              onClick={closeMenu}
              aria-label={tr("Close navigation", "Funga urambazaji")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-16 z-20 bg-slate-950/50 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className="fixed inset-y-0 left-0 top-16 z-30 w-64 border-r border-slate-200 bg-white px-3 shadow-2xl dark:border-slate-800 dark:bg-slate-900 md:hidden"
            >
              <nav aria-label={tr("Main navigation", "Urambazaji mkuu")}>
                {navigation}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <div className="md:pl-64">
        <main id="main" className="w-full px-4 py-5 sm:px-6 sm:py-6 2xl:px-10">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
