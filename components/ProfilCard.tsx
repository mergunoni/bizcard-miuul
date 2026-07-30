import { Avatar } from "./Avatar";
import { ContactList } from "./ContactList";
import { QrCode } from "./QrCode";
import { SocialNav } from "./SocialNav";
import { ThemeToggle } from "./ThemeToggle";
import { DEPLOY_URL } from "@/lib/config";
import type { Profile } from "@/lib/card-data";

type ProfilCardProps = {
  profile: Profile;
};

export function ProfilCard({ profile }: ProfilCardProps) {
  return (
    <main className="card" aria-label="Dijital kartvizit">
      <ThemeToggle />

      <header className="card__header">
        <Avatar initials={profile.initials} />
        <h1 className="card__name">{profile.name}</h1>
        <p className="card__title">{profile.title}</p>
      </header>

      <ContactList contacts={profile.contacts} />

      <SocialNav social={profile.social} />

      <QrCode url={DEPLOY_URL} />
    </main>
  );
}
