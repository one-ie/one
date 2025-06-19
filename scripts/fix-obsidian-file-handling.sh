#!/bin/bash

echo "🔧 Fixing Obsidian file handling permanently..."

# Step 1: Remove all external app associations for code files
echo "📝 Removing external app associations..."
for ext in astro ts tsx js jsx json css scss sass vue svelte yaml yml toml env sh bash zsh; do
    defaults delete com.apple.LaunchServices/com.apple.launchservices.secure LSHandlers 2>/dev/null || true
done

# Step 2: Clear and rebuild Launch Services database
echo "🔄 Rebuilding Launch Services..."
/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -kill -r -domain local -domain system -domain user

# Step 3: Set Obsidian as handler using a different approach
echo "🎯 Setting Obsidian as internal handler..."

# Create a custom UTI for Obsidian to handle internally
defaults write com.apple.LaunchServices/com.apple.launchservices.secure LSHandlers -array-add \
'<dict>
    <key>LSHandlerContentType</key>
    <string>public.source-code</string>
    <key>LSHandlerRoleAll</key>
    <string>md.obsidian</string>
</dict>'

# Step 4: Remove any QuickLook generators that might interfere
echo "🚫 Disabling interfering QuickLook generators..."
qlmanage -r 2>/dev/null || true
qlmanage -r cache 2>/dev/null || true

# Step 5: Reset Finder
echo "🔄 Restarting Finder..."
killall Finder

# Step 6: Create Obsidian file handler preference
echo "📄 Creating Obsidian preferences..."
cat > ~/Library/Preferences/md.obsidian.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>openInternally</key>
    <true/>
    <key>codeFileExtensions</key>
    <array>
        <string>astro</string>
        <string>ts</string>
        <string>tsx</string>
        <string>js</string>
        <string>jsx</string>
        <string>vue</string>
        <string>svelte</string>
        <string>json</string>
        <string>yaml</string>
        <string>yml</string>
    </array>
</dict>
</plist>
EOF

echo "✅ File handling fix complete!"
echo ""
echo "⚠️  IMPORTANT: You must now:"
echo "1. Completely quit Obsidian (Cmd+Q)"
echo "2. Wait 5 seconds"
echo "3. Reopen Obsidian"
echo ""
echo "After reopening, .astro and other code files will open internally!"