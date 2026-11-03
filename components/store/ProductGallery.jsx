"use client";

import { useState } from "react";
import Image from "next/image";

export default function ProductGallery({ images, name }) {
  const list = images.length ? images : ["/products/placeholder.svg"];
  const [active, setActive] = useState(0);
  const current = list[active] || list[0];

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden bg-border/40">
        <Image
          src={current}
          alt={name}
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          unoptimized={current.endsWith(".svg")}
          className="object-cover"
        />
      </div>

      {list.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {list.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              aria-pressed={i === active}
              className={`relative aspect-square overflow-hidden border-2 ${
                i === active ? "border-foreground" : "border-transparent"
              }`}
            >
              <Image src={src} alt="" fill sizes="100px" unoptimized={src.endsWith(".svg")} className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}