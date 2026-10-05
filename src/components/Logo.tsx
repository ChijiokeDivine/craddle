// components/Logo.tsx
interface LogoProps {
  size?: number;
  className?: string;
}

/** Hub with two branches: the shape of a dependency graph. */
export function Logo({ size = 22, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="square"
      className={className}
      aria-hidden="true"
    >
      <rect x="9" y="9" width="6" height="6" fill="currentColor" stroke="none" />
      <path d="M3 5h5v4M21 5h-5v4M12 15v5" />
      <rect x="1.5" y="3.5" width="3" height="3" fill="currentColor" stroke="none" />
      <rect x="19.5" y="3.5" width="3" height="3" fill="currentColor" stroke="none" />
      <rect x="10.5" y="19.5" width="3" height="3" fill="currentColor" stroke="none" />
    </svg>
  );
}
