import { ContactIcon } from "./ContactIcon";
import type { Contact } from "@/lib/card-data";

type ContactListProps = {
  contacts: Contact[];
};

export function ContactList({ contacts }: ContactListProps) {
  return (
    <ul className="contact">
      {contacts.map((c) => {
        const external = c.href.startsWith("http");
        return (
          <li className="contact__item" key={c.href}>
            <a
              className="contact__link"
              href={c.href}
              {...(external ? { target: "_blank", rel: "noopener" } : {})}
            >
              <span className="contact__icon" aria-hidden="true">
                <ContactIcon type={c.type} />
              </span>
              <span className="contact__text">{c.label}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
