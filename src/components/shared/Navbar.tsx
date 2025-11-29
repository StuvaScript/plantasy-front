import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState<boolean>(false);
  const { token, logout } = useAuth();

  useEffect(() => {
    const onResize = (): void => {
      if (window.innerWidth >= 768) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return (): void => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent): false | void =>
      e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return (): void => window.removeEventListener("keydown", onKey);
  }, []);

  const linkBase =
    "block px-4 py-2 rounded-md hover:bg-green-700/40 focus:outline-none focus:ring-2 focus:ring-white/50";
  const link = ({ isActive }: { isActive: boolean }): string =>
    `${linkBase} ${isActive ? "bg-green-700/60" : ""}`;

  return (
    <nav className="bg-green-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="text-2xl font-bold tracking-wide">
          <Link to="/" onClick={() => setOpen(false)}>
            Plantasy
          </Link>
        </div>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-2">
          <NavLink to="/" className={link}>
            Home
          </NavLink>

          {!token ? (
            <>
              <NavLink to="/login" className={link}>
                Log In
              </NavLink>
              <NavLink to="/signup" className={link}>
                Sign Up
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/explorer" className={link}>
                Explore
              </NavLink>
              <NavLink to="/plants" className={link}>
                My Collection
              </NavLink>
              <button onClick={logout} className={linkBase}>
                Log Out
              </button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-green-700/40 focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-controls="mobile-menu"
          aria-expanded={open}
          aria-label={open ? "Close main menu" : "Open main menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            className={`h-6 w-6 ${open ? "hidden" : "block"}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg
            className={`h-6 w-6 ${open ? "block" : "hidden"}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Backdrop */}
      <div
        className={`md:hidden fixed inset-0 bg-black/30 transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile panel */}
      <div
        id="mobile-menu"
        className={`md:hidden absolute left-0 right-0 top-[56px] sm:top-[60px] bg-green-800 shadow-lg transition-all duration-200 origin-top ${
          open
            ? "scale-y-100 opacity-100"
            : "scale-y-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="px-2 py-2 space-y-1">
          <NavLink to="/" className={link} onClick={() => setOpen(false)}>
            Home
          </NavLink>

          {!token ? (
            <>
              <NavLink
                to="/login"
                className={link}
                onClick={() => setOpen(false)}
              >
                Log In
              </NavLink>
              <NavLink
                to="/signup"
                className={link}
                onClick={() => setOpen(false)}
              >
                Sign Up
              </NavLink>
            </>
          ) : (
            <>
              {/* Keep both, matching desktop */}
              <NavLink
                to="/explorer"
                className={link}
                onClick={() => setOpen(false)}
              >
                Explore
              </NavLink>
              <NavLink
                to="/plants"
                className={link}
                onClick={() => setOpen(false)}
              >
                My Collection
              </NavLink>

              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className={linkBase}
              >
                Log Out
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
