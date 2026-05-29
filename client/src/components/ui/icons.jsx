import React from "react";

/**
 * Shared icon set. Crisp 24x24 line icons used across the chat UI so we don't
 * rely on emoji glyphs (which render inconsistently across platforms).
 * Each icon inherits `currentColor` and accepts a `className` for sizing.
 */
function Svg({ children, className = "h-5 w-5", stroke = true, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={stroke ? "none" : "currentColor"}
      stroke={stroke ? "currentColor" : "none"}
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const SendIcon = (p) => (
  <Svg stroke={false} {...p}>
    <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2 .01 7z" />
  </Svg>
);

export const MicIcon = (p) => (
  <Svg {...p}>
    <rect x="9" y="2" width="6" height="12" rx="3" />
    <path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8" />
  </Svg>
);

export const SmileIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 14.5a4.5 4.5 0 0 0 7 0" />
    <path d="M9 9.5h.01M15 9.5h.01" strokeWidth="2.2" />
  </Svg>
);

export const PaperclipIcon = (p) => (
  <Svg {...p}>
    <path d="M21 11.5 12.5 20a5 5 0 0 1-7-7l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7L9.7 17.5a1.7 1.7 0 0 1-2.4-2.4l7.8-7.8" />
  </Svg>
);

export const FileIcon = (p) => (
  <Svg {...p}>
    <path d="M14 3v5h5" />
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
  </Svg>
);

export const SearchIcon = (p) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </Svg>
);

export const UserPlusIcon = (p) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="4" />
    <path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6" />
    <path d="M19 8v6M22 11h-6" />
  </Svg>
);

export const InboxIcon = (p) => (
  <Svg {...p}>
    <path d="M3 12h5l1.5 2.5h5L16 12h5" />
    <path d="M5 5h14l2 7v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5z" />
  </Svg>
);

export const ChatIcon = (p) => (
  <Svg {...p}>
    <path d="M21 12a8 8 0 0 1-11.5 7.2L4 21l1.8-5.5A8 8 0 1 1 21 12z" />
  </Svg>
);

export const CheckIcon = (p) => (
  <Svg {...p}>
    <path d="m20 6-11 11-5-5" />
  </Svg>
);

export const CloseIcon = (p) => (
  <Svg {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Svg>
);

export const TrashIcon = (p) => (
  <Svg {...p}>
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
  </Svg>
);

export const LogoutIcon = (p) => (
  <Svg {...p}>
    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
    <path d="M10 17 5 12l5-5M5 12h12" />
  </Svg>
);

export const ChevronDownIcon = (p) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);

export const PaletteIcon = (p) => (
  <Svg {...p}>
    <path d="M12 3a9 9 0 1 0 0 18c1 0 1.7-.8 1.7-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H16a5 5 0 0 0 5-5c0-3.9-4-7-9-7z" />
    <path d="M7.5 11.5h.01M10.5 7.5h.01M14.5 7.5h.01" strokeWidth="2.2" />
  </Svg>
);
