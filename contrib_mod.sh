#!/bin/bash

# contrib_mod.sh - Toggle .cursorrules on/off
# Usage: ./contrib_mod.sh [on|off]

if [ $# -eq 0 ]; then
    echo "Usage: $0 [on|off]"
    echo "  on  - Activate .cursorrules (rename from .cursorrules.off if exists)"
    echo "  off - Deactivate .cursorrules (rename to .cursorrules.off)"
    exit 1
fi

case "$1" in
    "on")
        if [ -f ".cursorrules.off" ]; then
            mv .cursorrules.off .cursorrules
            echo "✅ .cursorrules activated (renamed from .cursorrules.off)"
        elif [ -f ".cursorrules" ]; then
            echo "ℹ️  .cursorrules is already active"
        else
            echo "❌ No .cursorrules or .cursorrules.off file found"
            exit 1
        fi
        ;;
    "off")
        if [ -f ".cursorrules" ]; then
            mv .cursorrules .cursorrules.off
            echo "✅ .cursorrules deactivated (renamed to .cursorrules.off)"
        elif [ -f ".cursorrules.off" ]; then
            echo "ℹ️  .cursorrules is already deactivated"
        else
            echo "❌ No .cursorrules file found"
            exit 1
        fi
        ;;
    *)
        echo "❌ Invalid argument: $1"
        echo "Usage: $0 [on|off]"
        exit 1
        ;;
esac