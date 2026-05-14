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