import { SocialIcon } from "./SocialIcon";
import type { Social } from "@/lib/card-data";

type SocialNavProps = {
  social: Social[];
};

export function SocialNav({ social }: SocialNavProps) {
  return (
    <nav className="social" aria-label="Sosyal medya">
      {social.map((s) => (
        <a
          key={s.href}
          className="social__link"
          href={s.href}
          target="_blank"
          rel="noopener"
          aria-label={s.name}
        >
          <SocialIcon name={s.name} />
        </a>
      ))}
    </nav>
  );
}
