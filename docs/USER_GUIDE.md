# Dunbar's Circles User Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Understanding Dunbar's Number](#understanding-dunbars-number)
3. [Navigation Guide](#navigation-guide)
4. [Visualization Features](#visualization-features)
5. [Data Management](#data-management)
6. [Advanced Features](#advanced-features)
7. [Troubleshooting](#troubleshooting)
8. [Privacy & Security](#privacy--security)

## Getting Started

### What is Dunbar's Circles?

Dunbar's Circles (Yet Another Knowledge Worker) is a web application that helps you visualize and understand your social relationships using Robin Dunbar's theory of social cognition. The app provides interactive visualizations to explore how your relationships are distributed across different levels of social connection.

### Quick Start

1. **Visit the Homepage** - Start at `/` to get an overview of the application
2. **Take the Tutorial** - Click "Tutorial & Guide" to learn the basics
3. **Import Your Data** - Go to Dashboard to import social media data
4. **Explore Visualizations** - Use the navigation to explore different views

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- No registration or account required
- Works offline after initial load

## Understanding Dunbar's Number

### The Theory

Robin Dunbar's research suggests that humans can maintain stable social relationships with approximately 150 people. This theory breaks down into five distinct layers:

#### The Five Levels

1. **Inner Circle (5 people)**

   - Daily contact required
   - Highest emotional investment
   - Family and closest friends
   - Color: Red

2. **Sympathy Group (15 people)**

   - Weekly contact typical
   - Close friends you confide in
   - People you'd seek comfort from
   - Color: Orange

3. **Affinity Group (50 people)**

   - Monthly contact sufficient
   - Party invitation list
   - Good friends and family
   - Color: Yellow

4. **Active Network (150 people)**

   - Quarterly contact needed
   - Meaningful conversations
   - Professional and social contacts
   - Color: Green

5. **Recognition Group (500 people)**
   - Yearly contact or less
   - Faces and names you remember
   - Acquaintances and distant contacts
   - Color: Blue

### Cognitive Load

Each level requires different amounts of mental energy to maintain:

- Inner levels require more frequent contact and emotional investment
- Outer levels need less maintenance but more people can be included
- The total cognitive load represents your social bandwidth#

# Navigation Guide

### Main Pages

#### Home Page (`/`)

- **Purpose**: Overview and introduction to Dunbar's theory
- **Features**: Interactive network diagram, quick access to all features
- **Best for**: First-time users, getting oriented

#### Onboarding (`/onboarding`)

- **Purpose**: Step-by-step tutorial and learning guide
- **Features**: Interactive tutorial with 8 comprehensive steps
- **Best for**: Learning how to use all features effectively

#### Radial View (`/radial`)

- **Purpose**: Concentric circles visualization of relationships
- **Features**: Interactive circles, mental load indicators, level details
- **Best for**: Understanding relationship distribution and cognitive load

#### Network Diagram (`/network`)

- **Purpose**: Force-directed graph of relationship connections
- **Features**: Interactive nodes, drag/zoom, connection visualization
- **Best for**: Exploring relationship patterns and clusters

#### Levels Page (`/levels`)

- **Purpose**: Detailed breakdown of each Dunbar level
- **Features**: Level characteristics, contact frequencies, examples
- **Best for**: Learning about relationship theory and categories

#### Dashboard (`/dashboard`)

- **Purpose**: User management and authentication
- **Features**: Google sign-in, profile management, user settings
- **Best for**: Personalizing your experience

#### Contacts (`/contacts`)

- **Purpose**: Relationship inventory and management
- **Features**: Add/edit contacts, import data, relationship tracking
- **Best for**: Managing your personal relationship data

#### Digital Parallels (`/digital`)

- **Purpose**: How Dunbar's theory applies to digital relationships
- **Features**: Social media analysis, digital vs. offline comparison
- **Best for**: Understanding modern relationship dynamics

#### Life Stages (`/lifecycle`)

- **Purpose**: Relationship patterns across different life phases
- **Features**: Age-based analysis, life stage comparisons
- **Best for**: Understanding how relationships change over time

### Navigation Tips

- Use the theme toggle (top-right) to switch between light/dark modes
- All pages are responsive and work on mobile devices
- Browser back/forward buttons work for navigation
- Bookmark specific pages for quick access

## Visualization Features

### Interactive Network Diagram

#### Controls

- **Click and Drag**: Pan around the visualization
- **Mouse Wheel**: Zoom in and out
- **Node Click**: Select and highlight a relationship level
- **Hover**: Show tooltips with level information

#### Understanding the Display

- **Node Size**: Represents the number of people in each level
- **Node Color**: Matches the Dunbar level color scheme
- **Node Position**: Automatically arranged for optimal viewing
- **Animations**: Smooth transitions when interacting

#### Best Practices

- Start zoomed out to see the full network
- Click on levels to focus on specific relationship categories
- Use hover tooltips to understand what each node represents

### Radial Diagram

#### Features

- **Concentric Circles**: Each ring represents a Dunbar level
- **Mental Load Visualization**: Progress bars show cognitive effort
- **Interactive Selection**: Click circles to focus on specific levels
- **Animated Background**: Subtle animations enhance the experience

#### Interpretation

- **Circle Size**: Larger circles = more people in that level
- **Fill Percentage**: How full each level is compared to Dunbar's theory
- **Color Intensity**: Darker colors indicate higher relationship intensity
- **Progress Indicators**: Show mental bandwidth usage

### Relationship Inventory

#### Management Features

- **Add Contacts**: Manually enter relationship information
- **Edit Details**: Update contact frequency, strength, notes
- **Categorization**: Assign people to appropriate Dunbar levels
- **Health Tracking**: Monitor relationship decay over time

#### Data Fields

- **Name**: Person's full name
- **Level**: Which Dunbar category they belong to
- **Contact Frequency**: How often you interact
- **Relationship Strength**: Emotional closeness rating
- **Last Contact**: When you last communicated
- **Notes**: Personal observations and reminders## D
  ata Management

### Importing Social Media Data

#### Supported Formats

**Facebook Friends Export**

- **File Type**: JSON (.json)
- **How to Get**: Facebook Settings > Your Facebook Information > Download Your Information
- **What's Included**: Friend names, connection dates, mutual friends
- **Privacy**: The file is processed in your browser

**LinkedIn Connections Export**

- **File Type**: CSV (.csv)
- **How to Get**: LinkedIn Settings > Data Privacy > Get a copy of your data
- **What's Included**: Connection names, companies, positions, connection dates
- **Privacy**: The file is processed in your browser

#### Import Process

1. **Navigate to Contacts Page** (`/contacts`)
2. **Click "Import Data"** button
3. **Select File Type** (Facebook JSON or LinkedIn CSV)
4. **Choose Your File** from your computer
5. **Review Auto-Categorization** - the app will suggest Dunbar levels
6. **Adjust Categories** if needed
7. **Confirm Import** to add contacts to your inventory

#### Auto-Categorization Logic

The app uses several factors to automatically assign Dunbar levels:

- **Connection Date**: Older connections often indicate closer relationships
- **Interaction Frequency**: Based on available social media data
- **Mutual Connections**: Shared contacts suggest closer relationships
- **Platform Context**: LinkedIn = professional, Facebook = personal

### Manual Data Entry

#### Adding Individual Contacts

1. Go to Contacts page (`/contacts`)
2. Click "Add Contact" button
3. Fill in the contact form:
   - **Name** (required)
   - **Dunbar Level** (select from dropdown)
   - **Contact Frequency** (daily, weekly, monthly, etc.)
   - **Relationship Strength** (1-10 scale)
   - **Last Contact Date**
   - **Notes** (optional personal observations)
4. Click "Save Contact"

#### Editing Existing Contacts

1. Find the contact in your list
2. Click the "Edit" button
3. Update any fields as needed
4. Save changes

#### Bulk Operations

- **Select Multiple**: Use checkboxes to select multiple contacts
- **Bulk Edit**: Change level or other properties for multiple people
- **Bulk Delete**: Remove multiple contacts at once
- **Export Selection**: Export only selected contacts

### Data Export Options

#### Visual Exports

- **PNG Images**: High-quality raster images of visualizations
- **SVG Graphics**: Scalable vector graphics for presentations
- **PDF Reports**: Formatted reports with multiple visualizations

#### Data Exports

- **JSON Format**: Complete relationship data with all metadata
- **CSV Format**: Spreadsheet-compatible contact lists
- **Backup Files**: Full application state for restoration

#### Export Process

1. Navigate to any visualization page
2. Look for the "Export" button (usually top-right corner)
3. Choose your preferred format
4. Select what to include (data, visualization, or both)
5. Click "Download" - file saves automatically

### Data Storage

#### Local Storage

- Contacts are stored in your browser's local storage
- Optional cloud backup to your own account if you sign in with Google
- Data persists between browser sessions
- Clearing browser data will remove your information

#### Backup Recommendations

- Regularly export your data as JSON backup files
- Store backups in multiple locations (cloud drive, USB, etc.)
- Test restore process periodically
- Consider exporting before major browser updates

## Advanced Features

### Digital Parallels Analysis

#### Understanding Digital Relationships

The Digital Parallels page (`/digital`) explores how traditional Dunbar levels map to modern digital communication:

**Social Media Connections**

- **Facebook Friends**: Often inflated compared to real relationships
- **LinkedIn Connections**: Professional network, different maintenance needs
- **Instagram Followers**: Visual connection, lower maintenance
- **Twitter Followers**: Interest-based, minimal relationship maintenance

**Communication Channels**

- **Text Messages**: Inner circle and sympathy group primarily
- **Email**: Professional and formal relationships
- **Social Media Comments**: Broader network engagement
- **Video Calls**: Intimate and close relationships

#### Digital vs. Offline Comparison

The app helps you understand:

- How many digital connections you actually maintain actively
- Which platforms correspond to which Dunbar levels
- Whether your digital behavior aligns with relationship theory
- Opportunities to strengthen offline relationships

### Life Stage Analysis

#### Relationship Patterns by Age

The Life Stages page (`/lifecycle`) examines how relationships change throughout life:

**Childhood (0-12)**

- Small, family-centered networks
- Geographic proximity important
- Limited relationship maintenance skills

**Adolescence (13-18)**

- Peer relationships become central
- Identity formation through social groups
- Emotional intensity in friendships

**Young Adulthood (19-30)**

- Network expansion through education/career
- Romantic relationships become important
- Geographic mobility affects relationships

**Middle Age (31-50)**

- Family and career focus
- Network stabilization
- Quality over quantity emphasis

**Later Life (50+)**

- Network contraction but deepening
- Loss of relationships through life changes
- Wisdom in relationship maintenance

#### Using Life Stage Insights

- Compare your current network to typical patterns
- Understand normal relationship changes
- Plan for future relationship needs
- Identify areas for improvement

### Level Details Deep Dive

#### Comprehensive Level Analysis

The Levels page (`/levels`) provides detailed information about each Dunbar level:

**For Each Level You'll Find:**

- **Typical Characteristics**: What defines relationships at this level
- **Contact Frequency**: How often maintenance contact is needed
- **Emotional Investment**: Level of emotional energy required
- **Examples**: Real-world examples of people who fit this category
- **Maintenance Tips**: How to keep relationships healthy
- **Warning Signs**: Indicators that relationships need attention

**Research Background**

- Original anthropological studies
- Cross-cultural validation
- Modern research updates
- Practical applications## Troubles
  hooting

### Common Issues and Solutions

#### Data Import Problems

**File Won't Upload**

- Check file format (JSON for Facebook, CSV for LinkedIn)
- Ensure file size is under 10MB
- Try a different browser if issues persist
- Clear browser cache and try again

**Auto-Categorization Seems Wrong**

- Review and manually adjust categories after import
- The algorithm makes best guesses based on limited data
- Your personal knowledge is more accurate than automated analysis
- Use the edit function to correct assignments

**Missing Data After Import**

- Check if browser storage is full
- Ensure you didn't accidentally clear browser data
- Try importing smaller batches of data
- Export and re-import if data appears corrupted

#### Visualization Issues

**Network Diagram Not Loading**

- Refresh the page
- Check if you have contacts added to your inventory
- Try a different browser (Chrome recommended)
- Disable browser extensions that might interfere

**Animations Are Choppy**

- Close other browser tabs to free up memory
- Update your browser to the latest version
- Try disabling hardware acceleration in browser settings
- Reduce the number of contacts for better performance

**Mobile Display Problems**

- Rotate device to landscape for better visualization viewing
- Use pinch-to-zoom gestures on touch screens
- Some features work better on desktop/laptop screens
- Consider using tablet or larger screen for complex visualizations

#### Performance Issues

**App Runs Slowly**

- Clear browser cache and cookies
- Close unnecessary browser tabs
- Restart your browser
- Check available system memory

**Large Dataset Problems**

- Consider breaking large contact lists into smaller groups
- Export and work with subsets of your data
- Use filtering options to focus on specific relationship levels
- Upgrade browser or device if consistently slow

### Browser Compatibility

#### Recommended Browsers

- **Chrome**: Best performance and full feature support
- **Firefox**: Good compatibility, some animation differences
- **Safari**: Works well on Mac/iOS, occasional rendering differences
- **Edge**: Good performance on Windows systems

#### Known Limitations

- Internet Explorer is not supported
- Very old browser versions may have issues
- Some mobile browsers have limited Canvas API support
- Ad blockers may interfere with certain features

### Data Recovery

#### If You Lose Your Data

**Browser Data Cleared**

- Check if you have exported backup files
- Look for auto-exported files in Downloads folder
- Data cannot be recovered if not backed up
- Start fresh and import social media data again

**Accidental Deletion**

- Use browser's "Undo" function immediately (Ctrl+Z)
- Check if you have recent export files
- Restore from JSON backup if available
- Re-import from original social media exports

#### Prevention Tips

- Export data regularly as JSON backups
- Store backups in cloud storage (Google Drive, Dropbox, etc.)
- Test restore process occasionally
- Consider keeping original social media export files

## Privacy & Security

### Data Protection Principles

#### Local First

- **Processed in Your Browser**: Imports and visualizations run in your browser
- **Optional Cloud Backup**: If you sign in, contacts are also saved to your own account, protected so only you can read them
- **No Account Required**: You can use the app without signing in
- **Analytics**: Basic Firebase Analytics may collect anonymous usage data

#### What Data Is Stored

**In Your Browser (always):**

- Contact names and relationship information you enter
- Imported social media data (processed locally)
- Your categorization choices and notes
- Application preferences and settings

**Never Stored:**

- Your social media login credentials
- Raw social media export files (processed then discarded)
- Personal identifying information beyond what you choose to enter

### Security Best Practices

#### Protecting Your Data

**Browser Security**

- Keep your browser updated to the latest version
- Use strong passwords for your computer/device
- Log out of shared computers after use
- Consider using private/incognito browsing on shared devices

**Data Backup Security**

- Encrypt backup files if they contain sensitive information
- Store backups in secure locations (password-protected cloud storage)
- Don't share backup files unless necessary
- Delete old backups periodically

**Social Media Export Security**

- Delete original export files after importing to Dunbar's Circles
- Be cautious about where you download social media exports
- Don't share export files with others
- Use secure connections when downloading from social platforms

### Compliance and Standards

#### Privacy Compliance

- **GDPR Compliant**: No personal data processing on servers
- **CCPA Compliant**: No sale or sharing of personal information
- **No Cookies**: Only essential browser storage used
- **Data Minimization**: Only processes data you explicitly provide

#### Open Source Transparency

- Source code is available for review
- No hidden data collection or transmission
- Community-driven development and security reviews
- Regular security updates and improvements

### Recommendations for Sensitive Data

#### If You Work with Confidential Relationships

- Use a dedicated browser profile for Dunbar's Circles
- Consider using a separate device for sensitive relationship mapping
- Regularly clear browser data after use
- Avoid using on shared or public computers

#### For Professional Use

- Check your organization's data handling policies
- Consider whether relationship mapping falls under professional confidentiality
- Use generic names or initials for highly sensitive contacts
- Export and store data according to your organization's security requirements

---

## Getting Help

### Support Resources

- **Tutorial**: Complete the interactive onboarding at `/onboarding`
- **Documentation**: This user guide and technical documentation in `/docs`
- **Source Code**: Available on GitHub for technical users
- **Community**: User discussions and feature requests

### Reporting Issues

If you encounter bugs or have feature requests:

1. Check this documentation first
2. Try the troubleshooting steps above
3. Report issues through the project's GitHub repository
4. Include browser version, operating system, and steps to reproduce

### Contributing

Dunbar's Circles is open source and welcomes contributions:

- **Bug Reports**: Help identify and fix issues
- **Feature Requests**: Suggest new functionality
- **Documentation**: Improve user guides and help content
- **Code Contributions**: Submit improvements and new features

---

_Last updated: [Current Date]_
_Version: 1.0_
