# Export Functionality

## Overview

Added comprehensive export functionality to the YAKW application, allowing users to export their relationship data in multiple formats from both the Dashboard and Relationship Inventory pages.

## Export Options

### 1. JSON Format

- **Description**: Complete data export with metadata
- **Use Case**: Full backup, data migration, or programmatic access
- **Includes**: All contact details, relationship levels, network statistics, and export metadata
- **File Format**: `yakw_contacts_YYYY-MM-DD.json` or `yakw_relationships_YYYY-MM-DD.json`

### 2. CSV Format

- **Description**: Spreadsheet-compatible format
- **Use Case**: Analysis in Excel, Google Sheets, or other spreadsheet applications
- **Includes**: Contact details, relationship levels, strength percentages, decay status
- **File Format**: `yakw_contacts_YYYY-MM-DD.csv` or `yakw_relationships_YYYY-MM-DD.csv`

### 3. Print Report

- **Description**: Formatted HTML report optimized for printing
- **Use Case**: Physical documentation, presentations, or offline reference
- **Features**:
  - Professional layout with statistics overview
  - Organized by Dunbar levels
  - Relationship health indicators
  - Print-friendly styling

### 4. Share Summary

- **Description**: Share network statistics via native sharing or clipboard
- **Use Case**: Social sharing or quick statistics sharing
- **Includes**: Total contacts, network health percentage, and app link
- **Fallback**: Copies to clipboard if native sharing unavailable

## Implementation Details

### Export Dialog

- **Location**: Available in both Dashboard and Relationship Inventory
- **Trigger**: "Export" button in the Actions section
- **Design**: Modal dialog with clear options and descriptions
- **State Management**: Proper loading states and error handling

### Data Preparation

- **Network Health Calculation**: Percentage of healthy relationships (not decaying)
- **Metadata Generation**: Export timestamp, version, contact counts
- **File Naming**: Automatic timestamp-based naming for organization

### Export Functions (lib/export-utils.ts)

- `exportToJSON()` - JSON file download
- `exportToCSV()` - CSV file download with proper escaping
- `printReport()` - Opens formatted print dialog
- `shareData()` - Native sharing with clipboard fallback
- `generateFilename()` - Timestamp-based file naming

## User Interface

### Dashboard Export

- **Button**: Green "Export" button with download icon
- **State**: Disabled when no contacts or loading
- **Context**: Exports all imported contacts from Firebase/localStorage

### Relationship Inventory Export

- **Button**: "Export Data" button with download icon
- **State**: Disabled when no relationships loaded
- **Context**: Exports current relationship network analysis

### Export Dialog Features

- **Visual Icons**: Clear icons for each export type
- **Descriptions**: Helpful descriptions for each format
- **Responsive**: Works on mobile and desktop
- **Accessible**: Proper ARIA labels and keyboard navigation

## CSV Export Format

The CSV export includes the following columns:

- Name
- Level (ID)
- Level Name
- Last Contact (date)
- Contact Frequency (days)
- Relationship Strength (percentage)
- Decay Rate
- Platform
- Days Since Contact
- Status (Healthy/Needs Attention)

## JSON Export Structure

```json
{
  "people": [...], // Array of contact objects
  "levels": [...], // Array of Dunbar level definitions
  "metadata": {
    "exportDate": "2024-01-01T00:00:00.000Z",
    "version": "1.0.0",
    "totalContacts": 150,
    "networkHealth": 85.5
  }
}
```

## Print Report Features

- **Professional Layout**: Clean, organized design
- **Statistics Overview**: Key metrics at the top
- **Level Sections**: Contacts organized by Dunbar levels
- **Health Indicators**: Visual indicators for decaying relationships
- **Page Breaks**: Proper pagination for printing
- **Print Optimization**: Removes unnecessary UI elements

## Browser Compatibility

- **Modern Browsers**: Full functionality including native sharing
- **Older Browsers**: Graceful fallback to clipboard copying
- **Mobile**: Touch-friendly interface with native sharing support
- **File Downloads**: Standard blob-based downloads work across all browsers

## Future Enhancements

- **Filtered Exports**: Export specific levels or sources only
- **Scheduled Exports**: Automatic periodic backups
- **Cloud Storage**: Direct export to Google Drive, Dropbox, etc.
- **Import Functionality**: Re-import exported JSON files
- **Advanced Formatting**: Custom CSV column selection
- **Email Export**: Send exports via email integration
