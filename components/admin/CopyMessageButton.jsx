"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export default function CopyMessageButton({ text }) {
  const [state, setState] = useState("idle"); // idle | copied | failed

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 2500);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 border border-border bg-white px-3 py-2 text-sm hover:border-foreground"
    >
      {state === "copied" ? <Check size={15} /> : <Copy size={15} />}
      {state === "copied" ? "Copied" : state === "failed" ? "Copy failed, select the text" : "Copy message"}
    </button>
  );
}