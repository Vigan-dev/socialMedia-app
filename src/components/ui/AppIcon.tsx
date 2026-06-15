import type { ReactNode, SVGProps } from 'react';

type IconName =
  | 'block'
  | 'chat'
  | 'cookie'
  | 'edit'
  | 'eyeOff'
  | 'flag'
  | 'heart'
  | 'mute'
  | 'paperPlane'
  | 'reply'
  | 'shield'
  | 'trash'
  | 'userPlus';

type AppIconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
};

const paths: Record<IconName, ReactNode> = {
  block: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="m7.8 7.8 8.4 8.4" />
    </>
  ),
  chat: (
    <>
      <path d="M5 6.5h14v9H9l-4 3v-12Z" />
      <path d="M8.5 10h7" />
      <path d="M8.5 13h4.5" />
    </>
  ),
  cookie: (
    <>
      <path d="M20 12.5A8 8 0 1 1 11.5 4a3 3 0 0 0 3.8 3.8A3 3 0 0 0 20 12.5Z" />
      <circle cx="9" cy="10" r="1" />
      <circle cx="12" cy="15" r="1" />
      <circle cx="15.5" cy="12" r="1" />
    </>
  ),
  edit: (
    <>
      <path d="M5 19h4l9.5-9.5a2.1 2.1 0 0 0-3-3L6 16v3Z" />
      <path d="m14 8 2 2" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M3.5 12s3-5 8.5-5c1.4 0 2.6.3 3.7.8" />
      <path d="M20.5 12s-3 5-8.5 5c-1.4 0-2.7-.3-3.8-.9" />
      <path d="m4 4 16 16" />
      <path d="M10.5 10.5a2.1 2.1 0 0 0 3 3" />
    </>
  ),
  flag: (
    <>
      <path d="M6 20V5" />
      <path d="M6 5h10l-1.5 4L16 13H6" />
    </>
  ),
  heart: (
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />
  ),
  mute: (
    <>
      <path d="M4 10v4h3l5 4V6l-5 4H4Z" />
      <path d="m16 10 4 4" />
      <path d="m20 10-4 4" />
    </>
  ),
  paperPlane: (
    <>
      <path d="m4 12 16-7-7 16-2-7-7-2Z" />
      <path d="m11 13 4-4" />
    </>
  ),
  reply: (
    <>
      <path d="m9 8-4 4 4 4" />
      <path d="M5 12h9a5 5 0 0 1 5 5v1" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 19 6v5c0 4.4-2.8 7.4-7 10-4.2-2.6-7-5.6-7-10V6l7-3Z" />
      <path d="m9.5 12 1.8 1.8 3.7-4" />
    </>
  ),
  trash: (
    <>
      <path d="M5 7h14" />
      <path d="M9 7V5h6v2" />
      <path d="M8 10v8" />
      <path d="M16 10v8" />
      <path d="M6.5 7 8 20h8l1.5-13" />
    </>
  ),
  userPlus: (
    <>
      <path d="M15 19a5 5 0 0 0-10 0" />
      <circle cx="10" cy="8" r="3" />
      <path d="M18 8v6" />
      <path d="M15 11h6" />
    </>
  ),
};

export function AppIcon({ name, className = '', ...props }: AppIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={`h-4 w-4 shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
