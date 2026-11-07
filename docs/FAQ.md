# Frequently Asked Questions (FAQ)

## General Questions

### What is Dunbar's Circles?

Dunbar's Circles (Yet Another Knowledge Worker) is a web application that helps you visualize and understand your social relationships using Robin Dunbar's theory of social cognition. It provides interactive tools to explore how your relationships are distributed across different levels of social connection.

### Do I need to create an account?

No! Dunbar's Circles works without any registration or account creation. You can start using it immediately. There's an optional Google sign-in for personalization, but it's not required for core functionality.

### Is Dunbar's Circles free to use?

Yes, Dunbar's Circles is completely free and open-source. There are no premium features, subscriptions, or hidden costs.

### What browsers are supported?

Dunbar's Circles works best on modern browsers:

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ❌ Internet Explorer (not supported)

## Privacy & Security

### Is my data safe?

Yes! Your data is completely private:

- All processing happens locally in your browser
- No data is sent to any servers
- No tracking or analytics
- Your relationship information never leaves your device

### What happens to my imported social media data?

When you import Facebook or LinkedIn data:

1. The file is processed entirely in your browser
2. Only the relationship information you choose is stored locally
3. The original file data is discarded after processing
4. No raw social media data is permanently stored

### Can I delete my data?

Yes, you can:

- Clear individual contacts from the Contacts page
- Clear all data by clearing your browser's local storage
- Export your data first if you want to keep a backup

### Does Dunbar's Circles track my usage?

No. Dunbar's Circles doesn't use any analytics, tracking pixels, or user behavior monitoring. Your usage patterns are completely private.

## Using the Application

### How do I get started?

1. Visit the homepage at `/`
2. Click "Tutorial & Guide" to take the interactive tutorial
3. Optionally import your social media data
4. Start exploring the visualizations

### What social media platforms can I import from?

Currently supported:

- **Facebook**: Friends list (JSON format)
- **LinkedIn**: Connections (CSV format)

More platforms may be added in future updates.

### How accurate is the auto-categorization?

The auto-categorization makes educated guesses based on:

- Connection dates
- Available interaction data
- Platform context (professional vs personal)

However, you know your relationships best! Always review and adjust the categories as needed.

### Can I use Dunbar's Circles without importing social media data?

Absolutely! You can:

- Add contacts manually
- Use the theoretical examples and educational content
- Explore the visualizations with sample data
- Learn about Dunbar's theory without personal data

## Technical Questions

### Why is the app running slowly?

Common causes and solutions:

- **Too many browser tabs**: Close unnecessary tabs
- **Large dataset**: Try working with smaller groups of contacts
- **Browser cache**: Clear cache and cookies
- **Old browser**: Update to the latest version

### Can I use Dunbar's Circles on mobile?

Yes! Dunbar's Circles is responsive and works on mobile devices, though some features work better on larger screens:

- Touch gestures work for navigation
- Rotate to landscape for better visualization viewing
- Some complex interactions are easier on desktop

### How do I backup my data?

1. Go to any visualization page
2. Click the "Export" button
3. Choose "JSON" format
4. Save the file to a secure location
5. You can restore this data later by importing the JSON file

### What if I lose my data?

If your browser data is cleared:

- Restore from a JSON backup if you have one
- Re-import your original social media exports
- Unfortunately, manually entered data cannot be recovered without backups

## Understanding Dunbar's Theory

### What exactly is Dunbar's Number?

Dunbar's Number (approximately 150) represents the cognitive limit to the number of people with whom one can maintain stable social relationships. It's based on research by anthropologist Robin Dunbar.

### Are the relationship levels fixed?

The levels are based on research averages, but individual variation is normal:

- Some people may have larger or smaller circles
- Cultural differences can affect relationship patterns
- Life circumstances influence relationship capacity

### How should I categorize borderline relationships?

For people who seem to fit between levels:

- Consider contact frequency as the primary factor
- Think about emotional investment required
- When in doubt, place them in the higher-maintenance level
- You can always adjust categories later

### What if my network doesn't match Dunbar's theory?

That's completely normal! The theory describes averages, not rules:

- Individual differences are expected
- Life stages affect relationship patterns
- Cultural background influences social behavior
- Use the theory as a guide, not a strict framework

## Features & Functionality

### What's the difference between the visualization types?

- **Radial View**: Shows relationship levels as concentric circles, good for understanding distribution
- **Network Diagram**: Interactive graph showing connections between people, good for exploring patterns
- **Level Details**: Educational content about each relationship level

### Can I export my visualizations?

Yes! You can export:

- **Images**: PNG and SVG formats for presentations
- **Data**: JSON and CSV formats for other tools
- **Reports**: Formatted summaries of your relationship analysis

### How do I add someone to my network?

1. Go to the Contacts page (`/contacts`)
2. Click "Add Contact"
3. Fill in their information
4. Choose their Dunbar level
5. Save the contact

### Can I track relationship changes over time?

Currently, Dunbar's Circles provides:

- Last contact date tracking
- Relationship strength indicators
- Decay warnings for neglected relationships

Future versions may include more detailed historical tracking.

## Troubleshooting

### The tutorial won't load

Try these steps:

1. Refresh the page
2. Clear your browser cache
3. Try a different browser
4. Check if JavaScript is enabled

### Import is failing

Common issues:

- **Wrong file format**: Use JSON for Facebook, CSV for LinkedIn
- **File too large**: Try importing smaller batches
- **Corrupted file**: Re-download from the social media platform
- **Browser compatibility**: Try Chrome if using another browser

### Visualizations appear blank

This usually means:

- No contacts have been added yet
- Browser compatibility issues
- JavaScript errors (check browser console)
- Try refreshing the page

### Can't see all my contacts

Check if:

- You're viewing the correct page
- Filters are applied that might hide contacts
- The data imported correctly
- Browser storage limits haven't been exceeded

## Getting Help

### Where can I find more detailed help?

- **User Guide**: Complete documentation at `docs/USER_GUIDE.md`
- **Interactive Tutorial**: Step-by-step guide at `/onboarding`
- **Quick Start**: Fast overview at `docs/QUICK_START.md`

### How do I report bugs or request features?

- Check the GitHub repository for the project
- Look for existing issues before creating new ones
- Provide detailed information about your browser and steps to reproduce problems

### Is there a community or forum?

Check the project's GitHub repository for:

- Discussion forums
- User community
- Feature requests
- Bug reports

---

_Don't see your question here? Check the [User Guide](USER_GUIDE.md) for more detailed information._
