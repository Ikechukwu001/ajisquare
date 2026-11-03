"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/utils/whatsapp";

const inputClass = (error) =>
  `w-full border bg-white px-3 py-2.5 text-sm outline-none focus:border-foreground ${
    error ? "border-red-500" : "border-border"
  }`;

export default function ContactForm({ whatsapp, brandName }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  function handleSubmit(e) {
    e.preventDefault();

    const next = {};
    if (name.trim().length < 2) next.name = "Please enter your name.";
    if (message.trim().length < 5) next.message = "Please write a short message.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const text = `Hello ${brandName}, my name is ${name.trim()}.\n\n${message.trim()}`;
    window.open(whatsappLink(whatsapp, text), "_blank", "noopener,noreferrer");
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium">Your name</label>
        <input
          id="contact-name"
          type="text"
          autoComplete="name"
          maxLength={80}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((er) => ({ ...er, name: undefined }));
          }}
          className={inputClass(errors.name)}
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
        />
        {errors.name && (
          <p id="contact-name-error" role="alert" className="mt-1 text-xs text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium">Message</label>
        <textarea
          id="contact-message"
          rows={5}
          maxLength={1000}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            if (errors.message) setErrors((er) => ({ ...er, message: undefined }));
          }}
          className={inputClass(errors.message)}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
        />
        {errors.message && (
          <p id="contact-message-error" role="alert" className="mt-1 text-xs text-red-600">{errors.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 bg-foreground py-3.5 text-sm uppercase tracking-wider text-white transition-colors hover:bg-accent"
      >
        <MessageCircle size={18} /> Continue on WhatsApp
      </button>

      <p className="text-xs text-muted">
        This opens WhatsApp with your message ready. Press send there to reach us.
      </p>
    </form>
  );
}