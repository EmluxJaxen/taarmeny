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