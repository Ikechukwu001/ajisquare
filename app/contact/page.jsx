import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Container from "@/components/ui/Container";
import ContactForm from "@/components/contact/ContactForm";
import { siteConfig } from "@/lib/config/site";
import { whatsappLink } from "@/lib/utils/whatsapp";

export const metadata = { title: "Contact Us" };

function InfoRow({ icon: Icon, label, children }) {
  return (
    <li className="flex items-start gap-4 border-b border-border py-4">
      <Icon size={20} className="mt-0.5 shrink-0 text-accent" />
      <div>
        <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
        <div className="mt-1 text-sm">{children}</div>
      </div>
    </li>
  );
}

const pillClass =
  "inline-flex items-center gap-1.5 border border-border bg-white px-3 py-2 hover:border-foreground";

export default function ContactPage() {
  const { contact, social } = siteConfig;
  const socials = Object.entries(social).filter(([, url]) => url);

  return (
    <Container className="py-10 sm:py-14">
      <h1 className="font-serif text-3xl sm:text-4xl">Contact us</h1>
      <p className="mt-2 max-w-xl text-muted">
        Questions about a product, an order, or bulk procurement? Reach out and we'll get back to you.
      </p>

      <div className="mt-10 grid gap-12 md:grid-cols-2">
        <section aria-labelledby="reach-us">
          <h2 id="reach-us" className="font-serif text-2xl uppercase">{siteConfig.name}</h2>
          <p className="mt-1 text-sm text-muted">{contact.heading}</p>

          <ul className="mt-4 border-t border-border">
            {contact.lines.map((line) => (
              <InfoRow key={line.phone} icon={Phone} label="Phone and WhatsApp">
                <p className="font-medium">{line.phone}</p>
                <div className="mt-2 flex flex-wrap gap-3">
                  <a href={`tel:${line.phone.replace(/\s/g, "")}`} className={pillClass}>
                    <Phone size={15} /> Call
                  </a>
                  <a
                    href={whatsappLink(line.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={pillClass}
                  >
                    <MessageCircle size={15} /> WhatsApp
                  </a>
                </div>
              </InfoRow>
            ))}

            {contact.email && (
              <InfoRow icon={Mail} label="Email">
                <a href={`mailto:${contact.email}`} className="hover:text-accent">{contact.email}</a>
              </InfoRow>
            )}

            {contact.address && <InfoRow icon={MapPin} label="Address">{contact.address}</InfoRow>}
          </ul>

          {socials.length > 0 && (
            <div className="mt-6">
              <p className="text-xs uppercase tracking-wider text-muted">Follow us</p>
              <div className="mt-2 flex flex-wrap gap-5 text-sm">
                {socials.map(([name, url]) => (
                  <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="capitalize hover:text-accent">
                    {name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>

        <section aria-labelledby="send-message">
          <h2 id="send-message" className="font-serif text-2xl">Send a message</h2>
          <div className="mt-4">
            <ContactForm whatsapp={contact.whatsapp} brandName={siteConfig.name} />
          </div>
        </section>
      </div>
    </Container>
  );
}