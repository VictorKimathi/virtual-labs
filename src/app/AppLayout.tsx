import {
  AudioWaveform,
  Atom,
  ChartNoAxesColumn,
  FlaskConical,
  House,
  Menu,
  Microscope,
  MonitorPlay,
  Orbit,
  PersonStanding,
  School,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { BrandLink, HeaderControls, iconButton } from "./HeaderControls";
import { useLanguage } from "./useLanguage";

type NavItem = {
  to: string;
  label: string;
  icon: typeof House;
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
  onNavigate,
}: NavItem & { onNavigate: () => void }) {
  return (
    <NavLink
      to={to}
      end
      onClick={onNavigate}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors ${isActive ? "bg-green-50 text-kenya-green dark:bg-green-950 dark:text-green-300" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"}`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
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
  const { tr } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const closeMenu = () => setMenuOpen(false);
  // Inside a virtual lab the sidebar is a drawer on every screen, so the bench gets the full width.
  const immersive = pathname.startsWith("/workbench/");
  const drawerOnly = immersive ? "" : "md:hidden";
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);
  const navSections: NavSection[] = [
    {
      id: "labs",
      label: tr("Virtual labs", "Maabara pepe"),
      items: [
        {
          to: "/workbench/physics",
          label: tr("Physics Lab", "Maabara ya Fizikia"),
          icon: Atom,
        },
        {
          to: "/workbench/chemistry",
          label: tr("Chemistry Lab", "Maabara ya Kemia"),
          icon: FlaskConical,
        },
        {
          to: "/workbench/biology",
          label: tr("Biology Lab", "Maabara ya Biolojia"),
          icon: Microscope,
        },
        {
          to: "/biology/anatomy",
          label: tr("Human Anatomy", "Anatomia ya Binadamu"),
          icon: PersonStanding,
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
              className={`${iconButton} ${drawerOnly}`}
            >
              {menuOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
            <BrandLink />
          </div>
          <HeaderControls />
        </div>
      </header>
      {!immersive && (
        <aside className="fixed inset-y-0 left-0 top-16 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-900 md:flex">
          <nav aria-label={tr("Main navigation", "Urambazaji mkuu")}>
            {navigation}
          </nav>
        </aside>
      )}
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
              className={`fixed inset-0 top-16 z-30 bg-slate-950/50 backdrop-blur-sm ${drawerOnly}`}
            />
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 36 }}
              className={`fixed inset-y-0 left-0 top-16 z-40 w-64 border-r border-slate-200 bg-white px-3 shadow-2xl dark:border-slate-800 dark:bg-slate-900 ${drawerOnly}`}
            >
              <nav aria-label={tr("Main navigation", "Urambazaji mkuu")}>
                {navigation}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <div className={immersive ? "" : "md:pl-64"}>
        <main
          id="main"
          className={
            immersive
              ? "w-full px-2 py-2 sm:px-3 sm:py-3"
              : "w-full px-4 py-5 sm:px-6 sm:py-6 2xl:px-10"
          }
        >
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
