# Dashboard User Guide

Welcome to the Smartico Gamification Dashboard! This guide will help you customize your dashboard experience.

## Table of Contents

- [Getting Started](#getting-started)
- [Customizing Your Theme](#customizing-your-theme)
- [Managing Widget Layout](#managing-widget-layout)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Troubleshooting](#troubleshooting)

## Getting Started

The dashboard displays 14 widgets showing your gamification progress, achievements, missions, and more. You can customize both the visual theme and which widgets are visible.

### Dashboard Overview

Your dashboard includes:
- **Daily Challenge** - Today's mission with countdown timer
- **Level Progress** - Your current level and XP
- **Active Missions** - Ongoing missions and progress
- **Recent Achievements** - Recently unlocked achievements
- **Leaderboard** - Top players and your rank
- **Bonus Tracker** - Active bonuses to claim
- **Personal Goals** - Your custom goals
- **Streak Tracker** - Daily login streak
- **Reward Calendar** - Monthly login rewards
- **VIP Status** - Your VIP tier and benefits
- **Jackpot** - Current jackpot and your tickets
- **Tournament** - Active tournament standings
- **Mini Games** - Available games to play
- **Activity Feed** - Recent activity timeline

## Customizing Your Theme

### Opening the Theme Customizer

1. Look for the **Theme** button in the top-right corner of the dashboard
2. Click the Theme button to open the customization panel

### Choosing a Preset Theme

The dashboard comes with 6 beautiful preset themes:

#### 1. Royal Purple (Default)
- **Colors**: Purple (#9333ea) + Pink (#ec4899)
- **Vibe**: Elegant, modern, premium
- **Best for**: Default experience

#### 2. Ocean Blue
- **Colors**: Sky Blue (#0ea5e9) + Cyan (#06b6d4)
- **Vibe**: Calm, professional, trustworthy
- **Best for**: Long work sessions

#### 3. Neon Cyber
- **Colors**: Green (#10b981) + Purple (#8b5cf6)
- **Vibe**: Vibrant, energetic, futuristic
- **Best for**: Gaming enthusiasts

#### 4. Nature Zen
- **Colors**: Green (#22c55e) + Lime (#84cc16)
- **Vibe**: Fresh, natural, balanced
- **Best for**: Wellness-focused users

#### 5. Sunset Orange
- **Colors**: Orange (#f97316) + Red (#ef4444)
- **Vibe**: Warm, bold, passionate
- **Best for**: Creative work

#### 6. Custom
- **Colors**: Your choice!
- **Vibe**: Personalized to your preferences
- **Best for**: Making it truly yours

**To select a preset:**
1. Open the Theme Customizer
2. Click on any preset card
3. Preview the changes in real-time
4. Click "Save Theme" to apply

### Creating a Custom Theme

Want complete control? Create your own theme:

1. Open the Theme Customizer
2. Select the **Custom** preset
3. Adjust the **Primary Color**:
   - Use HSL sliders for precise control
   - Or enter a hex code directly (e.g., #9333EA)
   - Watch the live preview update
4. Adjust the **Accent Color** the same way
5. Check the contrast validation:
   - ✓ Green = WCAG AA compliant (great!)
   - ⚠️ Yellow = Below recommended contrast (consider adjusting)

**Contrast Tips:**
- Lighter colors work better on dark backgrounds
- Aim for at least 4.5:1 contrast ratio
- Test readability before saving

### Adjusting Display Settings

#### Light/Dark Mode

Toggle between light and dark themes:
- **Dark Mode** (default): Easy on the eyes, great for low-light environments
- **Light Mode**: Clean, bright, perfect for daytime use

**To switch:**
1. Open Theme Customizer
2. Click the "Light" or "Dark" button
3. Preview the change
4. Save when satisfied

#### Font Size

Choose your preferred reading size:
- **14px**: Compact, shows more content
- **16px** (default): Balanced, comfortable
- **18px**: Larger, easier to read

**To change:**
1. Open Theme Customizer
2. Select 14, 16, or 18
3. Watch text resize in real-time
4. Save your preference

#### Animation Intensity

Control how much motion you see:
- **None**: No animations (respects accessibility preferences)
- **Subtle**: Minimal, gentle animations
- **Moderate** (default): Balanced animation experience
- **Energetic**: Full animations with extra flair

**To adjust:**
1. Open Theme Customizer
2. Select your preferred intensity
3. Animations update immediately
4. Save when happy

### Importing/Exporting Themes

Share your theme or backup your settings:

#### Export Your Theme

1. Open Theme Customizer
2. Click "Export Config" button
3. A JSON file downloads with your settings
4. Save this file to backup or share

#### Import a Theme

1. Open Theme Customizer
2. Click "Import Config" button
3. Select a theme JSON file
4. Preview the imported theme
5. Click "Save Theme" to apply

**Example theme JSON:**
```json
{
  "mode": "dark",
  "preset": "custom",
  "primaryColor": "#9333ea",
  "accentColor": "#ec4899",
  "fontSize": 16,
  "animationIntensity": "moderate"
}
```

### Resetting to Default

Made changes you don't like? Reset easily:

1. Open Theme Customizer
2. Click "Reset to Default" button
3. Confirm the reset
4. Royal Purple theme is restored

**Note:** This resets ALL theme settings to factory defaults.

## Managing Widget Layout

### Opening the Layout Customizer

1. Look for the **Layout** button in the top-right corner
2. Click the Layout button to open the customization panel

### Showing/Hiding Widgets

Control which widgets appear on your dashboard:

1. Open the Layout Customizer
2. Browse the list of 14 widgets
3. Each widget shows:
   - Icon/emoji
   - Widget name
   - Description of what it does
4. **Check** the box to show a widget
5. **Uncheck** the box to hide a widget
6. Changes preview immediately (not saved yet)
7. Click "Save Layout" to persist your changes

**Widget Categories:**
- **Core Progress**: Daily Challenge, Level Progress
- **Goals & Missions**: Active Missions, Personal Goals
- **Achievements**: Recent Achievements, Streak Tracker
- **Competition**: Leaderboard, Tournament
- **Rewards**: Bonus Tracker, Reward Calendar, Jackpot
- **Engagement**: Mini Games, Activity Feed
- **Status**: VIP Status

### Use Cases

#### Focused View
Hide distractions and show only what matters:
- Keep: Daily Challenge, Active Missions, Level Progress
- Hide: Everything else

#### Completionist View
Track all progress and achievements:
- Keep: All widgets
- Perfect for achievement hunters

#### Rewards-Only View
Focus on claiming bonuses and rewards:
- Keep: Bonus Tracker, Reward Calendar, Jackpot, VIP Status
- Hide: Progress and mission widgets

#### Competitive View
Focus on rankings and tournaments:
- Keep: Leaderboard, Tournament, Active Missions
- Hide: Personal progress widgets

### Resetting Layout

Return to default widget visibility:

1. Open Layout Customizer
2. Click "Reset Layout" button
3. Confirm the reset
4. All 14 widgets are shown

### Empty State

If you hide all widgets:
- A helpful message appears
- Click "Open Layout Customizer" button
- Re-enable some widgets to see your dashboard

## Keyboard Shortcuts

### Navigation
- `Tab` - Move between interactive elements
- `Shift + Tab` - Move backwards
- `Enter` or `Space` - Activate buttons
- `Escape` - Close open modals

### Customization Panels
- `Escape` - Close Theme or Layout Customizer
- `Enter` - Save changes (when focused on Save button)

### Accessibility
- Screen reader compatible
- All widgets have proper ARIA labels
- Keyboard navigation works throughout

## Troubleshooting

### Theme Not Changing

**Problem**: Selected a new theme but colors didn't update

**Solutions:**
1. Make sure you clicked "Save Theme" button
2. Check that you're not in a custom theme with similar colors
3. Try refreshing the page
4. Clear browser cache if issue persists

### Widgets Not Showing After Layout Change

**Problem**: Checked widgets in Layout Customizer but they're still hidden

**Solutions:**
1. Ensure you clicked "Save Layout" button
2. Try clicking "Reset Layout" to restore defaults
3. Refresh the page
4. Check browser console for errors

### Settings Not Persisting

**Problem**: Theme or layout resets when you reload the page

**Solutions:**
1. Check that browser allows localStorage
2. Ensure you're not in private/incognito mode
3. Check browser settings for site data permissions
4. Try a different browser to isolate the issue

### Animations Too Fast/Slow

**Problem**: Animations don't match your preference

**Solutions:**
1. Open Theme Customizer
2. Adjust "Animation Intensity" setting
3. Try "None" if you prefer no motion
4. Save and test again

### Custom Colors Look Wrong

**Problem**: Custom colors have poor contrast or look off

**Solutions:**
1. Check the contrast validation indicator
2. Aim for green checkmark (4.5:1 ratio or higher)
3. Use HSL sliders for fine-tuning
4. Test on both light and dark mode
5. Consider using a preset theme instead

### Can't Find a Widget

**Problem**: Looking for a specific widget but can't see it

**Solutions:**
1. Open Layout Customizer
2. Check if widget is unchecked (hidden)
3. Enable the widget and save
4. Widget should appear in the grid

### Performance Issues

**Problem**: Dashboard feels slow or laggy

**Solutions:**
1. Hide unused widgets to reduce rendering load
2. Set Animation Intensity to "None" or "Subtle"
3. Close other browser tabs
4. Update your browser to the latest version
5. Check system resources (CPU, RAM)

### Import Config Not Working

**Problem**: Importing a theme JSON file fails

**Solutions:**
1. Verify JSON file is valid (check for syntax errors)
2. Ensure all required fields are present
3. Try exporting your current theme to see the correct format
4. Copy and paste the JSON content manually

## Tips & Best Practices

### Theme Selection

- **Use presets first**: Try all 6 presets before creating a custom theme
- **Match your environment**: Dark mode for evening, light mode for daytime
- **Consider your display**: Some colors look different on different monitors
- **Test accessibility**: Ensure good contrast for readability

### Layout Management

- **Start with defaults**: Use the dashboard for a week before customizing
- **Hide, don't delete**: You can always bring widgets back
- **Organize by priority**: Show most important widgets first (top-left)
- **Regular review**: Check monthly if your layout still serves your needs

### Performance

- **Fewer widgets = faster**: Hide widgets you don't use
- **Reduce animations**: Lower intensity on slower devices
- **Keep browser updated**: Latest browsers perform best
- **Regular restarts**: Restart browser occasionally to clear memory

### Backup Your Settings

- **Export regularly**: Save your theme configuration
- **Document layouts**: Screenshot your ideal layouts
- **Test changes**: Preview before saving
- **Keep defaults in mind**: You can always reset

## Need More Help?

- Check the [Developer Documentation](./DEVELOPER_GUIDE.md) for technical details
- View the [Dashboard README](../DASHBOARD.md) for complete feature list
- Report issues on GitHub Issues
- Contact Smartico support for account-specific help

---

**Enjoy your customized dashboard experience!** 🎨✨
