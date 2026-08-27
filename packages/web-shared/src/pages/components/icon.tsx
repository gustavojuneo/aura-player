export type IconName =
  | "radio"
  | "clapperboard"
  | "refresh"
  | "menu"
  | "mail"
  | "lock"
  | "close";

export function Icon({ name }: { name: IconName }) {
  const paths = {
    radio: (
      <>
        <circle cx="12" cy="12" r="2.5" />
        <path d="M5.64 18.36a9 9 0 0 1 0-12.72M18.36 5.64a9 9 0 0 1 0 12.72M2.81 21.19a13 13 0 0 1 0-18.38M21.19 2.81a13 13 0 0 1 0 18.38" />
      </>
    ),
    clapperboard: (
      <>
        <path d="M4 8h16v12H4zM4 4h16v4H4zM8 4v4M12 4v4M16 4v4" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 11a8.1 8.1 0 0 0-14.9-3L3 11" />
        <path d="M3 5v6h6M4 13a8.1 8.1 0 0 0 14.9 3L21 13" />
        <path d="M21 19v-6h-6" />
      </>
    ),
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    mail: (
      <>
        <rect height="14" rx="2" width="18" x="3" y="5" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
    lock: (
      <>
        <rect height="11" rx="2" width="14" x="5" y="10" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </>
    ),
    close: <path d="m6 6 12 12M18 6 6 18" />,
  };

  return (
    <svg
      aria-hidden="true"
      className="size-5"
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      >
        {paths[name]}
      </g>
    </svg>
  );
}
