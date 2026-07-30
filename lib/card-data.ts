export type Contact = {
  type: "phone" | "mail" | "web";
  label: string;
  href: string;
};

export type Social = {
  name: "LinkedIn" | "X" | "Instagram" | "GitHub";
  href: string;
};

export type Profile = {
  initials: string;
  name: string;
  title: string;
  contacts: Contact[];
  social: Social[];
};

export const profile: Profile = {
  initials: "ME",
  name: "Mehmet Ergün",
  title: "Müzik Telif Uzmanı · MSG",
  contacts: [
    { type: "phone", label: "+90 535 765 06 68", href: "tel:+905357650668" },
    { type: "mail", label: "mergunoni@gmail.com", href: "mailto:mergunoni@gmail.com" },
    { type: "web", label: "msg.org.tr", href: "https://msg.org.tr" },
  ],
  social: [
    { name: "LinkedIn", href: "https://linkedin.com/in/kullanici" },
    { name: "X", href: "https://x.com/kullanici" },
    { name: "Instagram", href: "https://instagram.com/kullanici" },
    { name: "GitHub", href: "https://github.com/kullanici" },
  ],
};
