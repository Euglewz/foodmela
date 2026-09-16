import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Food Mela",
};

const CONTACT = {
  name: "Food Mela",
  phone: "(000) 000-0001",
  email: "hello@foodmela.example",
};

export default function ContactPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-1 flex-col px-6 py-24">
      <h1 className="text-center font-serif text-4xl font-semibold text-maroon">
        Contact Us
      </h1>
      <p className="mx-auto mt-4 max-w-lg text-center text-base text-ink/80">
        Placeholder text — we would love to hear from you. Reach out to us
        below.
      </p>

      <div className="mx-auto mt-12 w-full max-w-md rounded-2xl border border-maroon/20 bg-maroon/5 p-8">
        <h2 className="text-center font-serif text-xl font-semibold text-maroon">
          {CONTACT.name}
        </h2>
        <dl className="mt-4 space-y-2 text-sm text-ink/80">
          <div className="flex gap-2">
            <dt className="font-medium text-maroon">Phone:</dt>
            <dd>{CONTACT.phone}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium text-maroon">Email:</dt>
            <dd>{CONTACT.email}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
