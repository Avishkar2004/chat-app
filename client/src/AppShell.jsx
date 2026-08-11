import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { THEMES, useTheme } from "./theme/ThemeContext";
import Button, { IconButton } from "./components/ui/Button";
import {
  ChatIcon,
  LogoutIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
} from "./components/ui/icons";
import { displayHandle } from "./lib/usernames";

const THEME_ICONS = {
  light: SunIcon,
  dark: MoonIcon,
  system: MonitorIcon,
};

/**
 * The frame around every screen: one hairline-separated bar on top, everything
 * else below it. No blurred blobs, no glow layer, no translucent panels — the
 * messages are the only thing that should pull your eye.
 *
 * The shell is exactly one viewport tall and never scrolls, so on a phone the
 * message box stays put when the keyboard opens.
 */
export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex h-screen-dvh flex-col bg-canvas text-fg">
      <header className="flex-none border-b border-line bg-surface">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-3 py-2">
          <Link
            to="/"
            className="flex min-w-0 items-center gap-2 rounded-lg py-1 pr-1"
          >
            <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-accent text-accent-fg">
              <ChatIcon className="h-5 w-5" />
            </span>
            <span className="truncate text-msg font-semibold text-fg">
              ChatApp
            </span>
          </Link>

          <div className="flex flex-1 items-center justify-end gap-2">
            <ThemeToggle theme={theme} setTheme={setTheme} />

            {user ? (
              <>
                <span className="hidden truncate text-label text-fg-muted sm:inline">
                  {displayHandle(user.username)}
                </span>
                <Button
                  size="sm"
                  onClick={logout}
                  className="hidden sm:inline-flex"
                >
                  <LogoutIcon className="h-4 w-4" />
                  Log out
                </Button>
                <IconButton
                  size="iconSm"
                  label="Log out"
                  onClick={logout}
                  className="sm:hidden"
                >
                  <LogoutIcon className="h-4 w-4" />
                </IconButton>
              </>
            ) : (
              <>
                <Button as={Link} to="/login" size="sm">
                  Log in
                </Button>
                <Button as={Link} to="/signup" size="sm">
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
    </div>
  );
}

/**
 * Three choices, not six: Light, Dark, and System (follow the device).
 * Each segment shows an icon and carries a spoken label.
 */
function ThemeToggle({ theme, setTheme }) {
  return (
    <div
      role="group"
      aria-label="Colour theme"
      className="flex flex-none items-center gap-0.5 rounded-lg border border-line bg-surface-2 p-0.5"
    >
      {THEMES.map((t) => {
        const Icon = THEME_ICONS[t.id];
        const selected = theme === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setTheme(t.id)}
            aria-label={`${t.label} theme`}
            aria-pressed={selected}
            title={`${t.label} theme`}
            className={[
              "grid h-8 w-8 place-items-center rounded-md transition",
              selected
                ? "bg-surface text-fg shadow-none ring-1 ring-line"
                : "text-fg-subtle hover:text-fg",
            ].join(" ")}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
