# Repository Extraction: taarmeny

## Directory Tree
```text
taarmeny/
├── app
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components
│   ├── AnimateIn.tsx
│   ├── GlassIcon.tsx
│   ├── MenuCard.tsx
│   └── ThemeToggle.tsx
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
    "lint": "next lint"
  },
  "dependencies": {
    "framer-motion": "^12.38.0",
    "next": "^15.3.2",
    "next-themes": "^0.4.6",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.5.0",
    "eslint": "^9",
    "eslint-config-next": "^15.3.2",
    "autoprefixer": "^10.4.21",
    "postcss": "^8.5.14",
    "tailwindcss": "^3.4.17",
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

export const metadata: Metadata = {
  title: "Taar — Menyen",
  description: "Eksperimentelle smaker i hjertet av Posebyhaven.",
};

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
import MenuCard from "@/components/MenuCard";
import ThemeToggle from "@/components/ThemeToggle";
import AnimateIn from "@/components/AnimateIn";

const MENU_DATA = [
  {
    id: "signaturcocktails",
    category: "Signaturcocktails",
    price: "kr 189,-",
    items: [
      {
        name: "Thai basilikum",
        flavor: "Grønn, aromatisk, floral, leskende",
        ingredients:
          "Thai basilikum · gin · tequila · bergamot · sukkerlake · eplesyre · kullsyrevann",
        glass: "Highball",
      },
      {
        name: "Venezuela's ånd",
        flavor: "Frisk, urtepreget, krydret, syrlig, tropisk",
        ingredients:
          "Lys rom · Green Chartreuse · falernum · kanelsirup · sitron · lime · agurk",
        glass: "Tiki",
      },
      {
        name: "Blomsten fra Jerez",
        flavor: "Tørr, nøttepreget, fruktig, syrlig, rund",
        ingredients:
          "Amontillado sherry · rom · aprikoslikør · sukkerlake · sitron · Angostura",
        glass: "Coupe",
      },
      {
        name: "Røkt Negroni",
        flavor: "Bitter, kompleks, røkt, balansert",
        ingredients:
          "Gin · Campari · søt vermouth · røkt rosemarin · appelsinskall",
        glass: "Nick & Nora",
      },
      {
        name: "Spiced Mango Sour",
        flavor: "Søt, syrlig, krydret, tropisk",
        ingredients:
          "Tequila · mango · limejuice · jalapeño · agavesirup · eggehvite",
        glass: "Coupe",
      },
    ],
  },
  {
    id: "manedens-cocktail",
    category: "Månedens cocktail",
    price: "kr 189,-",
    items: [
      {
        name: "Vårens Løfte",
        flavor: "Blomstrete, lyst, elegant, lett syrlig",
        ingredients:
          "Vodka · hylleblomstkordial · sitron · elderflower tonic · friske urter",
        glass: "Coupe",
      },
      {
        name: "Midnattshagen",
        flavor: "Mørk, urtete, bittersøt, lang finish",
        ingredients:
          "Mezcal · Cynar · benediktine · sort pepper · sitron · timian",
        glass: "Highball",
      },
    ],
  },
  {
    id: "ol-og-vin",
    category: "Øl & Vin",
    price: null,
    items: [
      {
        name: "Fatøl",
        flavor: "Frisk, lett, hvetepreget",
        ingredients: "Lokal bryggeri · 0,4 l",
        glass: "Beer",
      },
      {
        name: "Naturvin — hvit",
        flavor: "Mineralsk, tørr, fruktig",
        ingredients: "Skjenkes etter sesong · glass",
        glass: "Wine",
      },
      {
        name: "Naturvin — rød",
        flavor: "Jordlig, saftig, lavtannin",
        ingredients: "Skjenkes etter sesong · glass",
        glass: "Wine",
      },
    ],
  },
  {
    id: "alkoholfritt",
    category: "Alkoholfritt",
    price: "kr 129,-",
    items: [
      {
        name: "Havtorn & Ingefær",
        flavor: "Syrlig, krydret, livlig, frisk",
        ingredients:
          "Havtornpuré · ingefærsirup · sitron · kullsyrevann · urter",
        glass: "Highball",
      },
      {
        name: "Rosenblad Lemonade",
        flavor: "Blomstrete, søt, forfriskende",
        ingredients: "Rosenvann · sitron · agavesirup · tonic · roseknopper",
        glass: "Highball",
      },
    ],
  },
];

const NAV_ITEMS = [
  { label: "Signatur", href: "#signaturcocktails" },
  { label: "Måneden", href: "#manedens-cocktail" },
  { label: "Øl & Vin", href: "#ol-og-vin" },
  { label: "Alkoholfritt", href: "#alkoholfritt" },
  { label: "Bestill", href: "#booking" },
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
        <div className="mb-6" aria-hidden="true">
          <TaarLogo />
        </div>
        <h1 className="font-serif text-[clamp(2.5rem,8vw,4.5rem)] font-extrabold text-[var(--accent-red)] mb-4 tracking-tighter leading-none">
          Taar
        </h1>
        <h2 className="font-serif text-[clamp(1.25rem,4vw,2rem)] font-medium mb-2">Menyen</h2>
        <p className="font-sans text-sm opacity-50 tracking-wide">
          Eksperimentelle smaker i hjertet av Posebyhaven.
        </p>
      </header>

      {/* Global pricing note */}
      <div className="text-center mb-10 pb-10 border-b border-black/10 dark:border-white/10">
        <p className="font-sans uppercase tracking-[0.2em] text-xs opacity-60 mb-2">
          Alle signatur- &amp; månedscocktails
        </p>
        <p className="font-serif italic text-2xl">kr 189,–</p>
      </div>

      {/* Sticky category nav */}
      <nav
        id="meny"
        className="sticky top-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-md py-4 mb-10 -mx-6 px-6 border-b border-black/5 dark:border-white/5"
        aria-label="Menykategorier"
      >
        <ul className="flex overflow-x-auto flex-nowrap whitespace-nowrap no-scrollbar gap-1 font-sans text-[0.65rem] uppercase tracking-widest font-semibold opacity-60">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="flex items-center px-4 py-3 hover:text-[var(--accent-red)] hover:opacity-100 transition-all duration-200"
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
          <div key={section.category} id={section.id}>
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
                <AnimateIn key={drink.name} delay={index * 0.1}>
                  <MenuCard {...drink} />
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
          Vi har begrenset kapasitet. Send oss en melding for å sikre din plass i Posebyhaven.
        </p>
        <a
          href="mailto:hei@taar.no"
          className="inline-block font-sans text-[0.7rem] uppercase tracking-widest font-semibold px-8 py-3 border border-[var(--accent-red)] text-[var(--accent-red)] rounded-full hover:bg-[var(--accent-red)] hover:text-white transition-all duration-300"
        >
          Send forespørsel
        </a>
      </section>

      {/* Footer */}
      <footer className="mt-10 pt-8 border-t border-black/10 dark:border-white/10 text-center">
        <p className="font-sans text-xs uppercase tracking-widest opacity-30">
          Posebyhaven · Kristiansand
        </p>
      </footer>
    </main>
  );
}

function TaarLogo() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: "clamp(48px, 8vw, 72px)", height: "auto", aspectRatio: "1" }}
    >
      <circle
        cx="24"
        cy="24"
        r="22"
        stroke="var(--accent-red)"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M24 10 L24 38 M14 18 Q24 14 34 18"
        stroke="var(--accent-red)"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
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

### File: components/GlassIcon.tsx
```tsx
interface GlassIconProps {
  glass: string;
  className?: string;
}

export default function GlassIcon({ glass, className = "" }: GlassIconProps) {
  const base = {
    viewBox: "0 0 80 80",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true as const,
    className: `w-full h-full ${className}`,
  };

  switch (glass) {
    case "Highball":
      return (
        <svg {...base}>
          <path
            d="M22 12 L25 68 L55 68 L58 12 Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M23.5 26 L24.8 68 L55.2 68 L56.5 26 Z"
            fill="currentColor"
            fillOpacity="0.08"
          />
          <rect
            x="30"
            y="32"
            width="9"
            height="9"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.2"
            transform="rotate(-8 34.5 36.5)"
          />
          <rect
            x="41"
            y="35"
            width="8"
            height="8"
            rx="1.5"
            stroke="currentColor"
            strokeWidth="1.2"
            transform="rotate(6 45 39)"
          />
          <line
            x1="46"
            y1="12"
            x2="52"
            y2="42"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="27" cy="50" r="1.2" fill="currentColor" fillOpacity="0.2" />
          <circle cx="28" cy="57" r="0.9" fill="currentColor" fillOpacity="0.15" />
        </svg>
      );

    case "Coupe":
    case "Nick & Nora":
      return (
        <svg {...base}>
          <path
            d="M14 16 Q14 46 40 50 Q66 46 66 16 Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M17 22 Q18 44 40 47 Q62 44 63 22 Z"
            fill="currentColor"
            fillOpacity="0.08"
          />
          <line
            x1="40"
            y1="50"
            x2="40"
            y2="66"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="28"
            y1="66"
            x2="52"
            y2="66"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M52 18 Q56 14 58 18 Q60 22 56 24"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      );

    case "Tiki":
      return (
        <svg {...base}>
          <path
            d="M20 18 L23 68 L57 68 L60 18 Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M22 32 L23 68 L57 68 L58 32 Z"
            fill="currentColor"
            fillOpacity="0.08"
          />
          <line
            x1="20"
            y1="22"
            x2="60"
            y2="22"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.4"
          />
          <path
            d="M24 31 Q30 27 36 31"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M44 31 Q50 27 56 31"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="30" cy="37" r="3.5" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="50" cy="37" r="3.5" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M36 45 Q40 49 44 45"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M27 54 Q40 60 53 54"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <line
            x1="33"
            y1="54"
            x2="33"
            y2="58"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <line
            x1="40"
            y1="56"
            x2="40"
            y2="60"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <line
            x1="47"
            y1="54"
            x2="47"
            y2="58"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
          />
        </svg>
      );

    case "Beer":
      return (
        <svg {...base}>
          <path
            d="M18 22 L20 66 L52 66 L54 22 Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M54 30 Q66 30 66 44 Q66 58 54 58"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M16 22 Q22 16 28 22 Q34 16 40 22 Q46 16 52 22 Q55 16 58 22"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M19.5 34 L20.8 66 L51.2 66 L52.5 34 Z"
            fill="currentColor"
            fillOpacity="0.07"
          />
          <circle cx="32" cy="52" r="1.5" fill="currentColor" fillOpacity="0.2" />
          <circle cx="38" cy="44" r="1" fill="currentColor" fillOpacity="0.2" />
          <circle cx="42" cy="55" r="1.2" fill="currentColor" fillOpacity="0.2" />
        </svg>
      );

    case "Wine":
      return (
        <svg {...base}>
          <path
            d="M20 12 Q20 38 40 44 Q60 38 60 12 Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M24 28 Q25 40 40 44 Q55 40 56 28 Z"
            fill="currentColor"
            fillOpacity="0.09"
          />
          <line
            x1="40"
            y1="44"
            x2="40"
            y2="64"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="27"
            y1="64"
            x2="53"
            y2="64"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M34 43 Q36 47 40 48 Q44 47 46 43"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      );

    default:
      return null;
  }
}
```

### File: components/MenuCard.tsx
```tsx
import GlassIcon from "./GlassIcon";

interface MenuCardProps {
  name: string;
  flavor: string;
  ingredients: string;
  glass: string;
}

export default function MenuCard({ name, flavor, ingredients, glass }: MenuCardProps) {
  return (
    <article className="flex items-start gap-5 mb-10 w-full">
      <div className="w-[72px] shrink-0 flex justify-center items-center pt-1">
        <div className="w-full aspect-square text-black/60 dark:text-white/50">
          <GlassIcon glass={glass} />
        </div>
      </div>

      <div className="flex flex-col justify-center min-w-0">
        <h3 className="font-serif text-xl font-bold tracking-tight mb-1 leading-tight">
          {name}
        </h3>
        <p className="font-serif italic text-[1.05rem] leading-snug text-black/75 dark:text-white/85 mb-2">
          {flavor}
        </p>
        <p className="font-sans text-[0.7rem] text-black/45 dark:text-white/45 leading-relaxed uppercase tracking-widest">
          {ingredients}
        </p>
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

