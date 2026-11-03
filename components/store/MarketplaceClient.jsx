"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import ProductCard from "@/components/store/ProductCard";
import { isPreorder } from "@/lib/utils/product";

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name: A to Z" },
];

const AVAILABILITY = [
  { value: "all", label: "All availability" },
  { value: "in_stock", label: "In stock" },
  { value: "preorder", label: "Pre-order" },
];

const selectClass =
  "border border-border bg-white px-3 py-2.5 text-sm outline-none focus:border-foreground";

export default function MarketplaceClient({ products, categories, initialCategory = "all" }) {
  const validInitial = categories.some((c) => c.id === initialCategory) ? initialCategory : "all";

  const [category, setCategory] = useState(validInitial);
  const [availability, setAvailability] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = products.filter((p) => {
      if (category !== "all" && p.categoryId !== category) return false;

      if (availability === "preorder" && !isPreorder(p)) return false;
      if (availability === "in_stock" && (isPreorder(p) || (Number(p.stock) || 0) <= 0)) return false;

      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.colors || []).some((c) => c.toLowerCase().includes(q))
      );
    });

    const sorted = [...filtered];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    else sorted.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
    return sorted;
  }, [products, category, availability, query, sort]);

  const hasFilters = category !== "all" || availability !== "all" || query.trim() !== "";

  function clearFilters() {
    setCategory("all");
    setAvailability("all");
    setQuery("");
  }

  const chipClass = (active) =>
    `shrink-0 border px-4 py-2 text-sm transition-colors ${
      active ? "border-foreground bg-foreground text-white" : "border-border hover:border-foreground"
    }`;

  return (
    <div>
      {/* Search, availability, and sort */}
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products"
            aria-label="Search products"
            className="w-full border border-border bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-foreground"
          />
        </div>
        <select
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          aria-label="Filter by availability"
          className={selectClass}
        >
          {AVAILABILITY.map((a) => (
            <option key={a.value} value={a.value}>{a.label}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products" className={selectClass}>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Category chips */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        <button type="button" onClick={() => setCategory("all")} className={chipClass(category === "all")}>
          All
        </button>
        {categories.map((c) => (
          <button key={c.id} type="button" onClick={() => setCategory(c.id)} className={chipClass(category === c.id)}>
            {c.name}
          </button>
        ))}
      </div>

      <p className="mt-6 text-sm text-muted">
        {results.length} {results.length === 1 ? "product" : "products"}
      </p>

      {/* Grid or empty state */}
      {results.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-serif text-xl">No products found</p>
          <p className="mt-2 text-sm text-muted">Try a different search, category, or availability.</p>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-5 inline-flex items-center gap-2 border border-foreground px-5 py-2 text-sm hover:bg-foreground hover:text-white"
            >
              <X size={16} /> Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {results.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}