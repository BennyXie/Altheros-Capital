#!/bin/bash

# Auth Bypass Toggle Script
# Usage: ./toggle-auth.sh [on|off]

ENV_FILE="client/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Error: $ENV_FILE not found!"
    exit 1
fi

case "$1" in
    "on"|"true"|"enable")
        # Enable auth bypass
        if grep -q "REACT_APP_BYPASS_AUTH=" "$ENV_FILE"; then
            sed -i 's/REACT_APP_BYPASS_AUTH=.*/REACT_APP_BYPASS_AUTH=true/' "$ENV_FILE"
        else
            echo "REACT_APP_BYPASS_AUTH=true" >> "$ENV_FILE"
        fi
        echo "✅ Auth bypass ENABLED"
        echo "🔄 Please restart your development server for changes to take effect"
        ;;
    "off"|"false"|"disable")
        # Disable auth bypass
        if grep -q "REACT_APP_BYPASS_AUTH=" "$ENV_FILE"; then
            sed -i 's/REACT_APP_BYPASS_AUTH=.*/REACT_APP_BYPASS_AUTH=false/' "$ENV_FILE"
        else
            echo "REACT_APP_BYPASS_AUTH=false" >> "$ENV_FILE"
        fi
        echo "✅ Auth bypass DISABLED"
        echo "🔄 Please restart your development server for changes to take effect"
        ;;
    "status"|"")
        # Show current status
        if grep -q "REACT_APP_BYPASS_AUTH=true" "$ENV_FILE"; then
            echo "🟠 Auth bypass is currently ENABLED"
        else
            echo "🟢 Auth bypass is currently DISABLED"
        fi
        echo ""
        echo "Current setting:"
        grep "REACT_APP_BYPASS_AUTH" "$ENV_FILE" || echo "REACT_APP_BYPASS_AUTH not set (defaults to false)"
        ;;
    *)
        echo "Usage: $0 [on|off|status]"
        echo ""
        echo "Commands:"
        echo "  on/enable    - Enable auth bypass for development"
        echo "  off/disable  - Disable auth bypass (normal mode)"
        echo "  status       - Show current bypass status"
        echo ""
        echo "Examples:"
        echo "  $0 on        # Enable bypass"
        echo "  $0 off       # Disable bypass"
        echo "  $0 status    # Check current status"
        exit 1
        ;;
esac
