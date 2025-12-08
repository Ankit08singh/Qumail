import Image from "next/image";

interface LogoProps {
  className?: string;
  priority?: boolean;
  alt?: string;
}

export default function Logo({ className = "", priority = false, alt = "QuMail logo" }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt={alt}
      width={160}
      height={48}
      priority={priority}
      className={`h-auto w-auto ${className}`.trim()}
    />
  );
}
