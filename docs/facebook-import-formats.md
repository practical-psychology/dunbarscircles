# Facebook Import Format Support

The Dunbar Circles application now supports both old and new Facebook export formats for importing friend data.

## Supported Formats

### New Format (friends_v2) - Recommended

The new Facebook API v2 format uses a simplified structure:

```json
{
  "friends_v2": [
    {
      "name": "Martin K",
      "timestamp": 1694403736
    },
    {
      "name": "Yuri K",
      "timestamp": 1672874610
    },
    {
      "name": "Leyla S",
      "timestamp": 1661808787
    }
  ],
  "metadata": {
    "version": "2.0",
    "export_date": "2023-09-11T10:15:36+0000"
  }
}
```

### Legacy Format (friends.data) - Still Supported

The older Facebook export format with extended information:

```json
{
  "friends": {
    "data": [
      {
        "name": "John Smith",
        "timestamp": 1625097600,
        "contact_info": {
          "email": "john.smith@example.com"
        },
        "about": "Software engineer at Tech Corp",
        "hometown": {
          "name": "New York, NY"
        }
      }
    ],
    "paging": {
      "cursors": {
        "before": "QVFIUjRsc2ZA...",
        "after": "QVFIUjRsc2ZA..."
      }
    },
    "summary": {
      "total_count": 10
    }
  },
  "metadata": {
    "version": "1.0",
    "export_date": "2023-04-15T14:30:00+0000"
  }
}
```

## Import Behavior

### Format Detection

The application automatically detects which format is being imported:

1. **Priority**: If `friends_v2` is present, it will be used (even if `friends.data` is also present)
2. **Fallback**: If only `friends.data` is present, the legacy format will be processed
3. **Error**: If neither format is found, an error will be thrown

### Relationship Strength Calculation

The application calculates relationship strength differently based on available data:

#### New Format (friends_v2)

- **Base strength**: 0.5
- **Recent connection bonus**: +0.2 (if contacted within last year)
- **Total possible**: 0.7

#### Legacy Format (friends.data)

- **Base strength**: 0.5
- **Recent connection bonus**: +0.2 (if contacted within last year)
- **Email available**: +0.1
- **About information**: +0.1
- **Location information**: +0.05
- **Total possible**: 0.95

### Data Mapping

Both formats map to the same internal structure:

```typescript
interface Person {
  id: string; // Generated: fb_{timestamp}_{index}
  name: string; // From friend.name
  levelId: string; // Assigned during categorization
  lastContact: Date; // From friend.timestamp (converted from Unix)
  contactFrequency: number; // Calculated based on relationship strength
  strength: number; // Calculated as described above
  decayRate: number; // Default: 0.1
  platform: string; // Set to "facebook"
}
```

## Usage

### File Upload

Users can upload either format through the import dialog:

1. Click "Import Social Graph Data"
2. Select Facebook JSON file
3. The application will automatically detect and process the format
4. Contacts will be categorized into Dunbar levels based on relationship strength

### Sample Files

- **New format**: `data/facebook_friends_v2.json`
- **Legacy format**: `data/facebook_friends.json`

## Migration Notes

- **Backward compatibility**: Existing imports using the old format will continue to work
- **Forward compatibility**: New Facebook exports will be automatically supported
- **No action required**: Users don't need to do anything - the format detection is automatic
- **Data quality**: Legacy format provides richer relationship strength calculation due to additional metadata

## Testing

The format support is thoroughly tested with:

- Unit tests for both format parsers
- Integration tests for file upload workflows
- Error handling for invalid formats
- Priority testing when both formats are present

See `src/test/facebook-import.test.ts` and `src/test/integration/data-import-workflows.test.tsx` for comprehensive test coverage.
