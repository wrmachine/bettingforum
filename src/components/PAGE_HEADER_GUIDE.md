# Adding New Pages with the Page Header Design

Use this pattern to add more pages with the dark header, metadata strip, intro, and sidebar.

## Step 1: Create a page header component

Create `src/components/[Section]PageHeader.tsx` (e.g. `CategoriesPageHeader.tsx`):

```tsx
"use client";

import { usePathname } from "next/navigation";
import { PageHeader } from "./PageHeader";

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function CategoriesPageHeader() {
  const pathname = usePathname();
  const isIndex = pathname === "/categories" || pathname === "/categories/";

  if (!isIndex) return null;

  return (
    <PageHeader
      title="BETTING CATEGORIES"
      author="Betting Forum"
      authorUrl="/"
      role="Category Guide"
      date={formatDate()}
      factChecked
      intro={
        <>
          Browse betting products by category —{" "}
          <strong>sportsbooks</strong>, <strong>casinos</strong>, and more.
        </>
      }
    />
  );
}
```

**PageHeader props:**
- `title` (required) – Main heading
- `intro` – JSX for the paragraph below (use `<strong>` to highlight terms)
- `author` – Display name
- `authorUrl` – Link (e.g. `/u/username` or `/`)
- `avatarUrl` – Optional image URL for avatar
- `role` – e.g. "Product Reviews", "Editor"
- `date` – Formatted date string
- `factChecked` – Show/hide the fact-checked badge

## Step 2: Create a layout for the section

Create `src/app/[section]/layout.tsx`:

```tsx
import { HomeSidebar } from "@/components/HomeSidebar";
import { CategoriesPageHeader } from "@/components/CategoriesPageHeader";

export default function CategoriesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <CategoriesPageHeader />
      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <div className="min-w-0 flex-1">{children}</div>
        <HomeSidebar />
      </div>
    </div>
  );
}
```

## Step 3: Update the page content

Remove the old `h1` and intro from the page — they're now in the header:

```tsx
export default function CategoriesPage() {
  return (
    <div className="min-w-0">
      {/* Your page content — cards, list, etc. */}
    </div>
  );
}
```

## Examples

- **Products** – `ProductsPageHeader` + `products/layout.tsx`
- **Listicles** – `ListiclesPageHeader` + `listicles/layout.tsx`
