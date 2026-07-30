import { ProfilCard } from "@/components/ProfilCard";
import { profile } from "@/lib/card-data";

export default function Home() {
  return <ProfilCard profile={profile} />;
}
