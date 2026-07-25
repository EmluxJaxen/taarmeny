# Repository Extraction: taarmeny

## Directory Tree
```text
taarmeny/
├── app
│   ├── globals.css
│   ├── layout.tsx
│   ├── menyprint
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── page.tsx
├── components
│   ├── AnimateIn.tsx
│   ├── MenuCard.tsx
│   └── ThemeToggle.tsx
├── db
│   ├── client.ts
│   ├── schema.ts
│   └── seed.ts
├── drizzle.config.ts
├── lib
│   ├── dal.ts
│   ├── json-ld.ts
│   └── menu-data.ts
├── llm_ingest.py
├── next-env.d.ts
├── next.config.ts
├── package.json
├── public
│   └── images
├── run_ingestion.sh
├── tailwind.config.ts
└── tsconfig.json
```

## Source Code

### File: drizzle.config.ts
```typescript
import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
```

### File: llm_ingest.py
```python
#!/usr/bin/env python3
"""
Universal LLM Ingestion Architect - Core Engine
Implements Two-Phase Architecture, Deterministic Sorting, and Token Economy.
"""

import os
import argparse
import sys
from pathlib import Path

# --- CORE CONSTRAINTS & SECURITY ---
MAX_FILE_SIZE_BYTES = 250 * 1024 # 250 KB limit to prevent token bloat
IGNORE_DIRS = {
    '.git', 'node_modules', 'build', 'dist', '.turbo', 'coverage', 
    '.next', '.nuxt', '.svelte-kit', 'venv', '.venv', '__pycache__', '.idea', '.vscode'
}
IGNORE_FILES = {
    'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb', 
    'Cargo.lock', 'Gemfile.lock', 'poetry.lock', '.DS_Store'
}
IGNORE_EXTS = {
    '.svg', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.pdf', 
    '.zip', '.tar', '.gz', '.mp4', '.mp3', '.wav', '.woff', '.woff2', '.ttf', '.eot'
}

# Phase 1: Master Whitelist
MASTER_EXT_LIST = {
    '.py', '.js', '.jsx', '.ts', '.tsx', '.json', '.yaml', '.yml', 
    '.md', '.html', '.css', '.scss', '.sh', '.bash', '.rs', '.go', 
    '.java', '.cpp', '.c', '.h', '.vue', '.svelte', '.astro', 
    '.dart', '.sql', '.prisma', '.toml', '.ini', '.env.example'
}

# Markdown Language Mapping
EXT_TO_MD_LANG = {
    '.py': 'python', '.js': 'javascript', '.jsx': 'jsx', '.ts': 'typescript', 
    '.tsx': 'tsx', '.json': 'json', '.yaml': 'yaml', '.yml': 'yaml', 
    '.md': 'markdown', '.html': 'html', '.css': 'css', '.scss': 'scss', 
    '.sh': 'bash', '.bash': 'bash', '.rs': 'rust', '.go': 'go', 
    '.java': 'java', '.cpp': 'cpp', '.c': 'c', '.vue': 'vue', 
    '.svelte': 'svelte', '.astro': 'astro', '.dart': 'dart', 
    '.sql': 'sql', '.prisma': 'prisma', '.toml': 'toml'
}

def is_allowed_file(filepath: Path, active_whitelist: set) -> bool:
    """Security and formatting gatekeeper for individual files."""
    if filepath.name in IGNORE_FILES:
        return False
    # Strict secret exclusion: No hidden files unless explicitly allowed
    if filepath.name.startswith('.') and filepath.name not in {'.env.example', '.gitignore', '.eslintrc.json', '.prettierrc'}:
        return False
    if '.min.' in filepath.name:
        return False
    if filepath.suffix.lower() in IGNORE_EXTS:
        return False
    if filepath.suffix.lower() not in active_whitelist and filepath.name != '.env.example':
        return False
    # Check size limit
    if filepath.stat().st_size > MAX_FILE_SIZE_BYTES:
        return False
    return True

def generate_tree(dir_path: Path, active_whitelist: set, prefix: str = "") -> str:
    """Generates a deterministically sorted topological directory tree."""
    tree_str = ""
    try:
        entries = sorted(list(dir_path.iterdir()), key=lambda x: x.name)
    except PermissionError:
        return ""

    # Filter entries deterministically
    valid_entries = []
    for entry in entries:
        if entry.is_dir():
            if entry.name not in IGNORE_DIRS and not entry.name.startswith('.'):
                valid_entries.append(entry)
        else:
            if is_allowed_file(entry, active_whitelist):
                valid_entries.append(entry)

    for i, entry in enumerate(valid_entries):
        connector = "└── " if i == len(valid_entries) - 1 else "├── "
        tree_str += f"{prefix}{connector}{entry.name}\n"
        if entry.is_dir():
            extension = "    " if i == len(valid_entries) - 1 else "│   "
            tree_str += generate_tree(entry, active_whitelist, prefix + extension)
            
    return tree_str

def main():
    parser = argparse.ArgumentParser(description="Universal LLM Code Extractor")
    parser.add_argument("target_dir", help="Target directory to extract")
    parser.add_argument("output_file", help="Output markdown file (e.g., output.md)")
    args = parser.parse_args()

    target_path = Path(args.target_dir).resolve()
    if not target_path.exists() or not target_path.is_dir():
        print(f"ERROR: Directory {target_path} does not exist.", file=sys.stderr)
        sys.exit(1)

    if not args.output_file.endswith('.md'):
        print("ERROR: Output file MUST be a .md (Markdown) file.", file=sys.stderr)
        sys.exit(1)

    # ==========================================
    # PHASE 1: Auto-Discovery & Whitelisting
    # ==========================================
    discovered_exts = set()
    for root, dirs, files in os.walk(target_path):
        dirs[:] = [d for d in sorted(dirs) if d not in IGNORE_DIRS and not d.startswith('.')]
        for file in files:
            ext = Path(file).suffix.lower()
            if ext in MASTER_EXT_LIST:
                discovered_exts.add(ext)
    
    active_whitelist = discovered_exts.intersection(MASTER_EXT_LIST)
    print(f"[*] Phase 1 Complete. Active extensions: {', '.join(active_whitelist)}")

    # ==========================================
    # PHASE 2: Deterministic Extraction
    # ==========================================
    total_chars = 0
    
    with open(args.output_file, 'w', encoding='utf-8') as out_f:
        out_f.write(f"# Repository Extraction: {target_path.name}\n\n")
        
        # Spatial Awareness: Directory Tree
        out_f.write("## Directory Tree\n```text\n")
        out_f.write(f"{target_path.name}/\n")
        out_f.write(generate_tree(target_path, active_whitelist))
        out_f.write("```\n\n")
        out_f.write("## Source Code\n\n")

        # Walk deterministically
        for root, dirs, files in os.walk(target_path):
            dirs[:] = [d for d in sorted(dirs) if d not in IGNORE_DIRS and not d.startswith('.')]
            files = sorted(files)

            for file in files:
                file_path = Path(root) / file
                if not is_allowed_file(file_path, active_whitelist):
                    continue

                rel_path = file_path.relative_to(target_path)
                md_lang = EXT_TO_MD_LANG.get(file_path.suffix.lower(), 'text')

                try:
                    with open(file_path, 'r', encoding='utf-8') as code_f:
                        content = code_f.read()
                        
                        out_f.write(f"### File: {rel_path}\n")
                        out_f.write(f"```{md_lang}\n")
                        out_f.write(content)
                        if not content.endswith('\n'):
                            out_f.write('\n')
                        out_f.write("```\n\n")
                        
                        total_chars += len(content)
                except UnicodeDecodeError:
                    continue # Skip binary noise masquerading as text
                except Exception as e:
                    print(f"[!] Error reading {rel_path}: {e}", file=sys.stderr)

    # ==========================================
    # TOKEN ECONOMY & METRICS
    # ==========================================
    est_tokens = total_chars // 4
    print(f"[*] Phase 2 Complete. File saved to: {args.output_file}")
    print(f"[*] Estimated Token Count: ~{est_tokens:,} tokens")
    
    if est_tokens > 200000:
        print("\n[WARNING] Massive Context Detected (>200k tokens)!")
        print("Ensure you use Claude 3 Opus/Sonnet (200k), Gemini 1.5 Pro (1M-2M), or enable Prompt Caching.")

if __name__ == "__main__":
    main()
```

### File: next-env.d.ts
```typescript
/// <reference types="next" />
/// <reference types="next/image-types/global" />
/// <reference path="./.next/types/routes.d.ts" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
```

### File: next.config.ts
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

### File: package.json
```json
{
  "name": "taarmeny",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx db/seed.ts"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.110.0",
    "drizzle-orm": "^0.45.2",
    "framer-motion": "^12.38.0",
    "next": "^15.3.2",
    "next-themes": "^0.4.6",
    "postgres": "^3.4.9",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.4.21",
    "dotenv": "^17.4.2",
    "drizzle-kit": "^0.31.10",
    "eslint": "^9",
    "eslint-config-next": "^15.3.2",
    "postcss": "^8.5.14",
    "tailwindcss": "^3.4.17",
    "tsx": "^4.23.0",
    "typescript": "^5"
  }
}
```

### File: run_ingestion.sh
```bash
#!/usr/bin/env bash
# Universal LLM Controller Wrapper

set -e

# Target specific directory requested by user
TARGET_DIR="."
OUTPUT_FILE="taarmeny_extraction.md"
PYTHON_SCRIPT="./llm_ingest.py"

echo "==================================================="
echo " LLM INGESTION ARCHITECT - INITIALIZING EXTRACTION "
echo "==================================================="

# Ensure Python script exists
if [[ ! -f "$PYTHON_SCRIPT" ]]; then
    echo "ERROR: $PYTHON_SCRIPT not found in current directory."
    exit 1
fi

# Apply OS permissions safely (Never sudo)
chmod +x "$PYTHON_SCRIPT"

# Verify target directory exists
if [[ ! -d "$TARGET_DIR" ]]; then
    echo "ERROR: Target directory '$TARGET_DIR' does not exist or is inaccessible."
    echo "Check permissions. If needed, run: chmod -R u+r $TARGET_DIR"
    exit 1
fi

echo "[*] Target identified: $TARGET_DIR"
echo "[*] Output configuration: Strict Markdown (.md)"
echo "[*] Commencing Two-Phase Extraction..."

python3 "$PYTHON_SCRIPT" "$TARGET_DIR" "$OUTPUT_FILE"

echo "==================================================="
echo " PROCESS TERMINATED SUCCESSFULLY "
echo "==================================================="
```

### File: tailwind.config.ts
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        "accent-red": "var(--accent-red)",
        "bg-primary": "var(--bg-primary)",
        "text-primary": "var(--text-primary)",
      },
    },
  },
  plugins: [],
};

export default config;
```

### File: tsconfig.json
```json
{
  "compilerOptions": {
    "lib": [
      "dom",
      "dom.iterable",
      "esnext"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": [
        "./*"
      ]
    },
    "target": "ES2017"
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules"
  ]
}
```

### File: app/globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --bg-primary: #FAF8F5;
    --text-primary: #2C2A28;
    --accent-red: #D9381E;
  }

  .dark {
    --bg-primary: #1A1715;
    --text-primary: #FAF8F5;
    --accent-red: #E64A33;
  }

  body {
    background-color: var(--bg-primary);
    color: var(--text-primary);
    transition: background-color 0.3s ease, color 0.3s ease;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  html {
    scroll-behavior: smooth;
  }
}

@layer utilities {
  .image-blend {
    mix-blend-mode: multiply;
  }

  .dark .image-blend {
    mix-blend-mode: screen;
    filter: invert(1);
    opacity: 0.9;
  }

  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
}
```

### File: app/layout.tsx
```tsx
import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { generateLocalBusinessSchema } from "@/lib/json-ld";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = "https://taarbar.no";
const SITE_TITLE = "Taar — Cocktailbar i Kristiansand";
const SITE_DESCRIPTION =
  "Cocktailkunst i hjertet av Kristiansand. Eksperimentelle smaker i Posebyhaven.";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Taar",
    locale: "nb_NO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

const localBusinessSchema = generateLocalBusinessSchema();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="no"
      suppressHydrationWarning
      className={`${playfair.variable} ${inter.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema),
          }}
        />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### File: app/page.tsx
```tsx
import Image from "next/image";
import MenuCard from "@/components/MenuCard";
import ThemeToggle from "@/components/ThemeToggle";
import AnimateIn from "@/components/AnimateIn";
import { MENU_DATA } from "@/lib/menu-data";

const NAV_ITEMS = [
  { label: "Cocktailmeny", href: "#signatur" },
  { label: "Månedens utvalgte", href: "#manedens" },
  { label: "Alkoholfritt", href: "#alkoholfritt" },
  { label: "Øl", href: "#ol" },
  { label: "Vin", href: "#vin" },
  { label: "Kaffe", href: "#kaffe" },
];

export default function MenuPage() {
  return (
    <main className="min-h-screen pb-24 max-w-2xl mx-auto px-6 pt-12 selection:bg-[var(--accent-red)] selection:text-white">

      {/* Top bar */}
      <div className="flex justify-end mb-6">
        <ThemeToggle />
      </div>

      {/* Hero */}
      <header id="konsept" className="mb-12 text-center flex flex-col items-center">
        <div className="flex justify-center items-center mb-6 h-[180px] md:h-[220px]">
          <Image
            src="/images/taarbarlogo.png"
            alt="Taar logo"
            width={288}
            height={220}
            priority
            className="object-contain w-60 md:w-72 h-auto"
          />
        </div>
        <h1 className="sr-only">Taar Café og Cocktailbar - Menyen</h1>
        <h2 className="font-serif text-[clamp(1.25rem,4vw,2rem)] font-medium mb-2">Menyen</h2>
        <p className="font-sans text-sm opacity-50 tracking-wide">
          Cocktailkunst i hjertet av Kristiansand.
        </p>
      </header>

      {/* Global pricing note */}
      <div className="text-center mb-6">
        <p className="font-sans uppercase tracking-[0.2em] text-sm opacity-80">Alle signatur- & månedscocktails</p>
        <p className="font-serif italic text-2xl mt-2">kr 189,-</p>
        <p className="font-serif italic text-sm opacity-60 mt-3">Vi lager også gjerne klassikeren du elsker!</p>
      </div>

      {/* Sticky category nav */}
      <nav
        id="meny"
        className="sticky top-0 z-50 flex items-center bg-[var(--bg-primary)]/80 backdrop-blur-md pt-[calc(env(safe-area-inset-top)+1rem)] pb-4 md:pt-[calc(env(safe-area-inset-top)+1.25rem)] md:pb-5 mb-12 -mx-6 px-6 border-y border-black/10 dark:border-white/10 overflow-x-auto no-scrollbar"
        aria-label="Menykategorier"
      >
        <ul className="flex gap-2 items-center font-sans text-xs uppercase tracking-widest font-semibold opacity-70 w-max">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="block px-4 py-2 hover:text-[var(--accent-red)] transition-colors"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Menu sections */}
      <section className="flex flex-col gap-14">
        {MENU_DATA.map((section) => (
          <div key={section.category} id={section.id} className="scroll-mt-32">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="font-serif text-2xl font-bold border-l-4 border-[var(--accent-red)] pl-4 leading-tight">
                {section.category}
              </h2>
              {section.price && (
                <span className="font-serif italic text-sm opacity-50 ml-4 shrink-0">
                  {section.price}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              {section.items.map((drink, index) => (
                <AnimateIn key={drink.name} delay={index * 0.05}>
                  <MenuCard
                    {...drink}
                    imageSize={drink.imagePath === '/images/rocks.png' ? 55 : 80}
                  />
                </AnimateIn>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Booking CTA */}
      <section
        id="booking"
        className="mt-20 py-14 px-8 rounded-2xl border border-black/10 dark:border-white/10 text-center"
      >
        <p className="font-sans uppercase tracking-[0.2em] text-xs opacity-50 mb-4">
          Reserver plass
        </p>
        <h2 className="font-serif text-3xl font-bold mb-3">Bestill bord</h2>
        <p className="font-sans text-sm opacity-60 mb-8 max-w-xs mx-auto leading-relaxed">
          Vi har begrenset kapasitet. Send oss en melding for å sikre din plass hos oss.
        </p>
        <a
          href="mailto:hei@taarbar.no"
          className="inline-block font-sans text-[0.7rem] uppercase tracking-widest font-semibold px-8 py-3 border border-[var(--accent-red)] text-[var(--accent-red)] rounded-full hover:bg-[var(--accent-red)] hover:text-white transition-all duration-300"
        >
          Send forespørsel
        </a>
      </section>

      {/* Footer */}
      <footer className="mt-10 pt-8 border-t border-black/10 dark:border-white/10 text-center space-y-2">
        <p className="font-sans text-xs uppercase tracking-widest opacity-50">
          Bestill bord{" "}
          <a href="mailto:hei@taarbar.no" className="hover:text-[var(--accent-red)] transition-colors">
            hei@taarbar.no
          </a>
        </p>
        <p className="font-sans text-xs uppercase tracking-widest opacity-50">
          Ønsker du å arrangere noe hos oss?{" "}
          <a href="mailto:hei@taarbar.no" className="hover:text-[var(--accent-red)] transition-colors">
            hei@taarbar.no
          </a>
        </p>
        <p className="font-sans text-xs uppercase tracking-widest opacity-30 pt-2">
          Posebyhaven · Kristiansand
        </p>
      </footer>
    </main>
  );
}
```

### File: app/menyprint/layout.tsx
```tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Taar — Print Meny (A4)',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PrintLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

### File: app/menyprint/page.tsx
```tsx
'use client';

import { useRef, useState } from 'react';

const MENU_DATA = [
  {
    id: "signatur",
    category: "Cocktailmeny",
    items: [
      { name: "Thai basilikum", flavor: "Grønn, aromatisk, floral, leskende", ingredients: "Thai basilikum-infusert gin · bergamotlikør · tequila · sukkerlake · eplesyre · kullsyrevann" },
      { name: "Venezuela's ånd", flavor: "Frisk, urtepreget, krydret, syrlig, tropisk", ingredients: "Lys rom, Green Chartreuse, falernum, kanelsirup, sitron, lime, agurk" },
      { name: "Blomsten fra Jerez", flavor: "Tørr, nøttepreget, fruktig, syrlig, rund", ingredients: "Amontillado sherry · rom · aprikoslikør · sukkerlake · sitron · Angostura bitters" },
      { name: "Te-tid", flavor: "Lys, te-aroma, ren syre, subtil sødme, frisk", ingredients: "Darjeeling-infusert melkevasket vodka, honningsirup, sitron" },
      { name: "Siste blomst", flavor: "Røykfylt, floral, urtepreget, spenstig", ingredients: "Mezcal, St-Germain, Bénédictine D.O.M., sitron" },
      { name: "Eksperimentet", flavor: "Mørk, krydret, aromatisk, med mange lag", ingredients: "Bourbon · fino sherry · Cocchi Americano · Bénédictine · Angostura bitters · orange bitters · Peychaud's bitters" },
      { name: "Bivoks", flavor: "Varm, aromatisk, mild honning, sofistikert", ingredients: "Bivoks-infusert bourbon · cognac · sukkerlake · Angostura bitters · Peychaud's bitters" },
    ],
  },
  {
    id: "manedens",
    category: "Månedens Utvalgte",
    items: [
      { name: "Månedens Margarita", flavor: "Fruktig, spicy, saftig", ingredients: "Jalapeño-infusert tequila, Cointreau, klarifisert jordbær, agave, lime" },
      { name: "Månedens Tiki", flavor: "Tropisk, rund, fyldig, frisk", ingredients: "Smørvasket jamaicansk rom, bananlikør, lønnesirup, lime" },
      { name: "Månedens Negroni", flavor: "Frisk, lett bitter, floral, sitruspreget", ingredients: "Aperol · Lillet Blanc · Hendrick's gin" },
    ],
  },
  {
    id: "olvin",
    category: "Øl & Vin",
    items: [
      { name: "Husets Øl", flavor: "Spør oss om dagens utvalg", ingredients: "Lokalt og internasjonalt håndverksøl på tapp og flaske" },
      { name: "Husets Vin", flavor: "Utvalgte glass og flasker", ingredients: "Naturvin, rødt, hvitt, oransje eller friske bobler fra kjelleren" },
    ],
  },
];

export default function PrintMenuPage() {
  const [scale, setScale] = useState(0.75);
  const canvasRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-neutral-800 text-neutral-100 p-4 md:p-8 flex flex-col items-center select-none font-sans print:p-0 print:bg-white print:text-black">

        {/* ── SCREEN-ONLY CONTROL PANEL ── */}
        <div className="w-full max-w-5xl bg-neutral-900 border border-neutral-700 rounded-xl p-6 mb-8 shadow-xl print:hidden">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-serif text-xl font-bold text-[#D9381E] mb-1">
                Utskriftssentral · Taar
              </h1>
              <p className="text-xs text-neutral-400 max-w-xl">
                Denne ruten genererer en fysisk, brettbar meny tilpasset{' '}
                <strong className="text-neutral-200">A4 Liggende</strong>. Innholdet
                synkroniseres automatisk med live-nettsiden.
              </p>
            </div>
            <button
              onClick={() => window.print()}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-6 py-3 rounded-lg shadow transition-all duration-200 active:scale-95 shrink-0"
            >
              Åpne utskriftsdialog
            </button>
          </div>

          {/* Scale slider */}
          <div className="mt-4 pt-4 border-t border-neutral-800 flex items-center gap-4">
            <label className="text-xs text-neutral-400 shrink-0 font-semibold uppercase tracking-wider">
              Forhåndsvisning
            </label>
            <input
              type="range"
              min={0.3}
              max={1}
              step={0.05}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-40 accent-[#D9381E]"
            />
            <span className="text-xs text-neutral-500 w-10">{Math.round(scale * 100)}%</span>
          </div>

          {/* Print setup checklist */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs text-neutral-400">
            {[
              { title: '1. Størrelse / Layout', body: <>Sett papirstørrelse til <span className="text-white">A4</span> og retning til <span className="text-white">Liggende</span>.</> },
              { title: '2. Marger', body: <>Sett marger til <span className="text-white">Ingen</span> eller <span className="text-white">Minimum</span>.</> },
              { title: '3. Bakgrunnsgrafikk', body: <>Huk av for <span className="text-white">"Skriv ut bakgrunnsgrafikk"</span> for å bevare fargetonene.</> },
              { title: '4. Etterbehandling', body: <>Brett arket nøyaktig i to ved den stiplede linjen for en A5-brosjyre.</> },
            ].map(({ title, body }) => (
              <div key={title} className="p-3 bg-neutral-950 rounded-lg border border-neutral-800">
                <span className="block font-bold text-neutral-200 mb-1">{title}</span>
                {body}
              </div>
            ))}
          </div>
        </div>

        {/* ── SCALED PREVIEW WRAPPER ── */}
        <div
          className="w-full flex justify-center items-start overflow-auto py-4 print:p-0 print:overflow-visible print:block"
          style={{ minHeight: `calc(${210 * scale}mm + 2rem)` }}
        >
          {/* ── PHYSICAL A4 LANDSCAPE CANVAS ── */}
          <div
            ref={canvasRef}
            id="print-canvas"
            className="relative bg-[#FAF8F5] text-[#2C2A28] shadow-2xl overflow-hidden flex-shrink-0 grid grid-cols-2 print:shadow-none print:m-0 print:border-none"
            style={{
              width: '297mm',
              height: '210mm',
              transformOrigin: 'top center',
              transform: `scale(${scale})`,
              boxSizing: 'border-box',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            }}
          >

            {/* ═══════════════════════════════════════════════ */}
            {/* COLUMN 1 — Left A5 (back cover / secondary)    */}
            {/* ═══════════════════════════════════════════════ */}
            <div className="w-[148.5mm] h-[210mm] p-[15mm] box-border flex flex-col justify-between bg-[#FAF8F5]">
              <div className="flex flex-col gap-[8mm]">

                {/* Månedens Utvalgte */}
                <section>
                  <h2 className="font-serif text-[13pt] font-bold tracking-tight mb-[4mm] border-l-[3px] border-[#D9381E] pl-[3mm] uppercase text-[#2C2A28]">
                    {MENU_DATA[1].category}
                  </h2>
                  <div className="flex flex-col gap-[3.5mm]">
                    {MENU_DATA[1].items.map((item) => (
                      <div key={item.name} className="break-inside-avoid">
                        <h3 className="font-serif text-[10.5pt] font-bold tracking-tight text-black">{item.name}</h3>
                        <p className="font-serif italic text-[9.5pt] text-black/80 leading-snug mt-[0.5mm]">{item.flavor}</p>
                        <p className="font-sans text-[7.5pt] uppercase text-black/50 font-medium leading-relaxed mt-[0.5mm]" style={{ letterSpacing: '0.02em' }}>
                          {item.ingredients}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Øl & Vin */}
                <section>
                  <h2 className="font-serif text-[13pt] font-bold tracking-tight mb-[4mm] border-l-[3px] border-[#D9381E] pl-[3mm] uppercase text-[#2C2A28]">
                    {MENU_DATA[2].category}
                  </h2>
                  <div className="flex flex-col gap-[3.5mm]">
                    {MENU_DATA[2].items.map((item) => (
                      <div key={item.name} className="break-inside-avoid">
                        <h3 className="font-serif text-[10.5pt] font-bold tracking-tight text-black">{item.name}</h3>
                        <p className="font-serif italic text-[9.5pt] text-black/80 leading-snug mt-[0.5mm]">{item.flavor}</p>
                        <p className="font-sans text-[7.5pt] uppercase text-black/50 font-medium leading-relaxed mt-[0.5mm]" style={{ letterSpacing: '0.02em' }}>
                          {item.ingredients}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

              </div>

              <footer className="text-center pt-[5mm] border-t border-black/5">
                <p className="font-sans text-[7pt] uppercase font-semibold text-black/40" style={{ letterSpacing: '0.25em' }}>
                  Posebyhaven · Kristiansand
                </p>
              </footer>
            </div>

            {/* ═══════════════════════════════════════════════ */}
            {/* COLUMN 2 — Right A5 (front cover + cocktails)  */}
            {/* ═══════════════════════════════════════════════ */}
            <div className="w-[148.5mm] h-[210mm] p-[15mm] box-border border-l border-dashed border-black/10 flex flex-col justify-between bg-[#FAF8F5] relative">
              <div className="flex flex-col">

                {/* Brand mark */}
                <div className="w-full flex justify-center mb-[4mm] pt-[2mm]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/taarbarlogo.png"
                    alt="Taar Logo"
                    width={130}
                    height={90}
                    style={{ objectFit: "contain" }}
                  />
                </div>

                {/* Pricing declaration */}
                <div className="text-center mb-[5mm] pb-[4mm] border-b border-black/5">
                  <p className="font-sans uppercase text-[7pt] text-black/60 font-semibold" style={{ letterSpacing: '0.2em' }}>
                    Alle signatur- & månedscocktails
                  </p>
                  <p className="font-serif italic text-[14pt] font-bold text-[#D9381E] mt-[1mm]">kr 189,-</p>
                </div>

                {/* Cocktailmeny */}
                <section>
                  <h2 className="font-serif text-[13pt] font-bold tracking-tight mb-[4mm] border-l-[3px] border-[#D9381E] pl-[3mm] uppercase text-[#2C2A28]">
                    {MENU_DATA[0].category}
                  </h2>
                  <div className="grid grid-cols-1 gap-[3mm]">
                    {MENU_DATA[0].items.map((item) => (
                      <div key={item.name} className="break-inside-avoid">
                        <h3 className="font-serif text-[10.5pt] font-bold tracking-tight text-black">{item.name}</h3>
                        <p className="font-serif italic text-[9.5pt] text-black/80 leading-snug mt-[0.5mm]">{item.flavor}</p>
                        <p className="font-sans text-[7.5pt] uppercase text-black/50 font-medium leading-relaxed mt-[0.5mm]" style={{ letterSpacing: '0.02em' }}>
                          {item.ingredients}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

              </div>
            </div>

          </div>
        </div>

        {/* ── GLOBAL PRINT OVERRIDES ── */}
        <style>{`
          @media print {
            body, html {
              background: white !important;
              color: #000000 !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            @page {
              size: A4 landscape;
              margin: 0;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #print-canvas {
              transform: none !important;
              width: 297mm !important;
              height: 210mm !important;
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
            }
          }
        `}</style>

    </div>
  );
}
```

### File: components/AnimateIn.tsx
```tsx
'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimateInProps {
  children: ReactNode;
  delay?: number;
}

export default function AnimateIn({ children, delay = 0 }: AnimateInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
```

### File: components/MenuCard.tsx
```tsx
import Image from 'next/image';

interface MenuCardProps {
  name: string;
  flavor?: string;
  ingredients?: string;
  imagePath?: string;
  imageSize?: number;
  price?: string;
  subtitle?: string;
}

export default function MenuCard({ name, flavor, ingredients, imagePath, imageSize = 80, price, subtitle }: MenuCardProps) {
  return (
    <article className="flex items-center gap-6 md:gap-8 mb-10 w-full">
      {imagePath && (
        <div className="w-[80px] shrink-0 flex justify-center items-center">
          <div className="relative aspect-square" style={{ width: imageSize, height: imageSize }}>
            <Image
              alt={name}
              className="object-contain mix-blend-multiply dark:invert dark:mix-blend-screen dark:opacity-90"
              fill
              sizes={`${imageSize}px`}
              src={imagePath}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col justify-center flex-1">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-serif text-xl font-bold tracking-tight">
            {name}
          </h3>
          {price && (
            <span className="font-serif italic text-black/80 dark:text-white/90 shrink-0">
              {price}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="font-sans text-sm text-black/50 dark:text-white/50 leading-relaxed uppercase tracking-wider mt-1">
            {subtitle}
          </p>
        )}
        {flavor && (
          <p className="font-serif italic text-[1.1rem] leading-snug text-black/80 dark:text-white/90 mt-1 mb-1">
            {flavor}
          </p>
        )}
        {ingredients && (
          <p className="font-sans text-sm text-black/50 dark:text-white/50 leading-relaxed uppercase tracking-wider">
            {ingredients}
          </p>
        )}
      </div>
    </article>
  );
}
```

### File: components/ThemeToggle.tsx
```tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-8 h-8" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      className="w-8 h-8 flex items-center justify-center rounded-full opacity-60 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-red)]"
    >
      {theme === "dark" ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
```

### File: db/client.ts
```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// For server-side usage (Next.js Server Components, Route Handlers, etc.)
// We use a single connection for migrations/seed scripts and a pool for the app.
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
```

### File: db/schema.ts
```typescript
import {
  pgTable,
  serial,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    category: text("category").notNull(),
    price: text("price"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [uniqueIndex("categories_slug_idx").on(table.slug)]
);

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  price: text("price"),
  flavor: text("flavor"),
  subtitle: text("subtitle"),
  ingredients: text("ingredients"),
  imagePath: text("image_path"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  items: many(menuItems),
}));

export const menuItemsRelations = relations(menuItems, ({ one }) => ({
  category: one(categories, {
    fields: [menuItems.categoryId],
    references: [categories.id],
  }),
}));
```

### File: db/seed.ts
```typescript
/**
 * One-time seed script. Run with:
 *   npx tsx db/seed.ts
 *
 * Requires DATABASE_URL to be set in .env.local (loaded by dotenv below).
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { categories, menuItems } from "./schema";
import { MENU_DATA } from "../lib/menu-data";

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set. Add it to .env.local");
  }

  const client = postgres(connectionString, { prepare: false });
  const db = drizzle(client);

  console.log("🌱  Seeding database…");

  for (let i = 0; i < MENU_DATA.length; i++) {
    const section = MENU_DATA[i];

    const [inserted] = await db
      .insert(categories)
      .values({
        slug: section.id,
        category: section.category,
        price: section.price ?? null,
        sortOrder: i,
      })
      .returning({ id: categories.id });

    console.log(`  ✓ Category: ${section.category} (id=${inserted.id})`);

    for (let j = 0; j < section.items.length; j++) {
      const item = section.items[j];
      await db.insert(menuItems).values({
        categoryId: inserted.id,
        name: item.name,
        price: item.price ?? null,
        flavor: item.flavor ?? null,
        subtitle: item.subtitle ?? null,
        ingredients: item.ingredients ?? null,
        imagePath: item.imagePath ?? null,
        sortOrder: j,
      });
      console.log(`      • ${item.name}`);
    }
  }

  console.log("\n✅  Seed complete.");
  await client.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

### File: lib/dal.ts
```typescript
import { db } from "@/db/client";
import { categories, menuItems } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import type { MenuCategory, MenuItem } from "@/lib/menu-data";

/**
 * Fetches all menu categories and their items from the database,
 * returning them in the exact same shape as the static MENU_DATA array
 * so existing page components require zero changes.
 */
export async function getMenuData(): Promise<MenuCategory[]> {
  const rows = await db
    .select({
      categoryId: categories.id,
      categorySlug: categories.slug,
      categoryName: categories.category,
      categoryPrice: categories.price,
      categorySortOrder: categories.sortOrder,
      itemId: menuItems.id,
      itemName: menuItems.name,
      itemPrice: menuItems.price,
      itemFlavor: menuItems.flavor,
      itemSubtitle: menuItems.subtitle,
      itemIngredients: menuItems.ingredients,
      itemImagePath: menuItems.imagePath,
      itemSortOrder: menuItems.sortOrder,
    })
    .from(categories)
    .leftJoin(menuItems, eq(menuItems.categoryId, categories.id))
    .orderBy(asc(categories.sortOrder), asc(menuItems.sortOrder));

  // Group flat rows into the MenuCategory[] shape
  const categoryMap = new Map<number, MenuCategory>();

  for (const row of rows) {
    if (!categoryMap.has(row.categoryId)) {
      categoryMap.set(row.categoryId, {
        id: row.categorySlug,
        category: row.categoryName,
        price: row.categoryPrice,
        items: [],
      });
    }

    if (row.itemId !== null) {
      const item: MenuItem = { name: row.itemName! };
      if (row.itemPrice) item.price = row.itemPrice;
      if (row.itemFlavor) item.flavor = row.itemFlavor;
      if (row.itemSubtitle) item.subtitle = row.itemSubtitle;
      if (row.itemIngredients) item.ingredients = row.itemIngredients;
      if (row.itemImagePath) item.imagePath = row.itemImagePath;

      categoryMap.get(row.categoryId)!.items.push(item);
    }
  }

  return Array.from(categoryMap.values());
}
```

### File: lib/json-ld.ts
```typescript
import { MENU_DATA, MenuCategory, MenuItem } from "@/lib/menu-data";

const SITE_URL = "https://taarbar.no";

/**
 * Extracts the first numeric price value from strings like "kr 189,-"
 * or "Glass kr 129,- / Flaske kr 649,-". Returns null for unparseable formats.
 */
function parseFirstPrice(
  priceStr: string
): { price: string; priceCurrency: string } | null {
  const match = priceStr.match(/kr\s+(\d+)/i);
  if (match) {
    return { price: match[1], priceCurrency: "NOK" };
  }
  return null;
}

function buildSchemaMenuItem(item: MenuItem, categoryPrice: string | null) {
  const rawPrice = item.price ?? categoryPrice;
  const offerData = rawPrice ? parseFirstPrice(rawPrice) : null;

  const descParts: string[] = [];
  if (item.flavor) descParts.push(item.flavor);
  if (item.ingredients) descParts.push(item.ingredients);
  if (item.subtitle) descParts.push(item.subtitle);

  const schemaItem: Record<string, unknown> = {
    "@type": "MenuItem",
    name: item.name,
  };

  if (descParts.length > 0) {
    schemaItem.description = descParts.join(". ");
  }

  if (offerData) {
    schemaItem.offers = {
      "@type": "Offer",
      price: offerData.price,
      priceCurrency: offerData.priceCurrency,
    };
  }

  return schemaItem;
}

function buildSchemaMenuSection(category: MenuCategory) {
  return {
    "@type": "MenuSection",
    name: category.category,
    hasMenuItem: category.items.map((item) =>
      buildSchemaMenuItem(item, category.price)
    ),
  };
}

export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "BarOrPub",
    name: "Taar",
    description:
      "Cocktailkunst i hjertet av Kristiansand. Eksperimentelle smaker i Posebyhaven.",
    url: SITE_URL,
    email: "hei@taarbar.no",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Posebyhaven",
      addressLocality: "Kristiansand",
      addressRegion: "Agder",
      addressCountry: "NO",
    },
    hasMenu: {
      "@type": "Menu",
      hasMenuSection: MENU_DATA.map(buildSchemaMenuSection),
    },
  };
}
```

### File: lib/menu-data.ts
```typescript
export interface MenuItem {
  name: string;
  price?: string;       // e.g. "kr 189,-" or "Glass kr 129,- / Flaske kr 649,-"
  flavor?: string;      // ONLY for cocktail tasting notes
  ingredients?: string; // cocktail ingredient list
  subtitle?: string;    // format descriptor, e.g. "0,5 l på tapp" or "Flaske · 0,33l"
  imagePath?: string;
}

export interface MenuCategory {
  id: string;
  category: string;
  price: string | null;
  items: MenuItem[];
}

export const MENU_DATA: MenuCategory[] = [
  {
    id: "signatur",
    category: "Cocktailmeny",
    price: "kr 189,-",
    items: [
      { name: "Thai basilikum", flavor: "Grønn, aromatisk, floral, leskende", ingredients: "Thai basilikum-infusert gin · bergamotlikør · tequila · sukkerlake · eplesyre · kullsyrevann", imagePath: "/images/highball.png" },
      { name: "Venezuela's ånd", flavor: "Frisk, urtepreget, krydret, syrlig, tropisk", ingredients: "Lys rom · Green Chartreuse · falernum · kanelsirup · sitron · lime · agurk", imagePath: "/images/highball.png" },
      { name: "Blomsten fra Jerez", flavor: "Tørr, nøttepreget, fruktig, syrlig, rund", ingredients: "Amontillado sherry · rom · aprikoslikør · sukkerlake · sitron · Angostura bitters", imagePath: "/images/coupe.png" },
      { name: "Te-tid", flavor: "Lys, te-aroma, ren syre, subtil sødme, frisk", ingredients: "Darjeeling-infusert melkevasket vodka · honningsirup · sitron", imagePath: "/images/coupe.png" },
      { name: "Siste blomst", flavor: "Røykfylt, floral, urtepreget, spenstig", ingredients: "Mezcal · St-Germain · Bénédictine D.O.M. · sitron", imagePath: "/images/nick&nora.png" },
      { name: "Eksperimentet", flavor: "Mørk, krydret, aromatisk, med mange lag", ingredients: "Bourbon · fino sherry · Cocchi Americano · Bénédictine · Angostura orange & Peychaud's bitters", imagePath: "/images/nick&nora.png" },
      { name: "Bivoks", flavor: "Varm, aromatisk, mild honning", ingredients: "Bivoks-infusert bourbon · cognac · sukkerlake · Angostura bitters · Peychaud's bitters", imagePath: "/images/rocks.png" },
    ],
  },
  {
    id: "manedens",
    category: "Månedens Utvalgte",
    price: "kr 189,-",
    items: [
      { name: "Månedens Margarita", flavor: "Fruktig, spicy, saftig", ingredients: "Jalapeño-infusert tequila · Cointreau · klarifisert jordbær · agave · lime", imagePath: "/images/rocks.png" },
      { name: "Månedens Tiki", flavor: "Tropisk, rund, fyldig, frisk", ingredients: "Smørvasket jamaicansk rom · bananlikør · lønnesirup · lime", imagePath: "/images/tiki.png" },
      { name: "Månedens Negroni", flavor: "Frisk, lett bitter, floral, sitruspreget", ingredients: "Aperol · Lillet Blanc · Hendrick's gin", imagePath: "/images/rocks.png" },
    ],
  },
  {
    id: "alkoholfritt",
    category: "Alkoholfritt",
    price: null,
    items: [
      { name: "Alkoholfri cocktail", price: "kr 129,-", subtitle: "Spør oss om dagens smaker og ferske råvarer" },
      { name: "Alkoholfritt øl", price: "kr 79,-", subtitle: "Flaske · 0,33l" },
      { name: "Brus & mineralvann", price: "kr 54,-", subtitle: "Glassflaske · 0,33l, utvalg" },
    ],
  },
  {
    id: "ol",
    category: "Øl",
    price: null,
    items: [
      { name: "Husets øl (CB)", price: "kr 139,-", subtitle: "0,5 l på tapp" },
      { name: "Nøgne Ø Blonde", price: "kr 139,-", subtitle: "0,5 l på tapp" },
    ],
  },
  {
    id: "vin",
    category: "Vin",
    price: null,
    items: [
      { name: "Husets vin", price: "Glass kr 129,- / Flaske kr 649,-", subtitle: "Rødt, hvitt, oransje eller friske bobler" },
    ],
  },
  {
    id: "kaffe",
    category: "Kaffe",
    price: null,
    items: [
      { name: "Espresso, enkel", price: "kr 35,-" },
      { name: "Espresso, dobbel", price: "kr 45,-" },
      { name: "Americano", price: "kr 45,-" },
      { name: "Macchiato", price: "kr 48,-" },
      { name: "Cortado", price: "kr 53,-" },
      { name: "Cappuccino", price: "kr 55,-" },
      { name: "Caffe latte", price: "kr 59,-" },
    ],
  },
];
```

