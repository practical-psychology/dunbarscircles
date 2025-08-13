// Integration test exports
export * from './user-workflows.test'
export * from './workflow-error-handling.test'
export * from './complete-user-journey.test'

// Test suite documentation
/**
 * Integration Tests for YAKW Application
 * 
 * This test suite covers complete user workflows and integration scenarios:
 * 
 * 1. user-workflows.test.tsx
 *    - Data import workflow: file upload → parsing → categorization → visualization
 *    - Relationship management workflow: add → edit → categorize → export
 *    - Authentication workflow: sign-in → dashboard → data persistence → sign-out
 *    - Export workflow: select data → choose format → generate file → download
 * 
 * 2. workflow-error-handling.test.tsx
 *    - Error handling for malformed data imports
 *    - Authentication failure scenarios
 *    - Export error recovery
 *    - Large dataset performance testing
 *    - Browser compatibility edge cases
 * 
 * 3. complete-user-journey.test.tsx
 *    - End-to-end user journey from onboarding to export
 *    - Error recovery scenarios
 *    - Authentication retry workflows
 *    - Data persistence across sessions
 * 
 * Requirements Coverage:
 * - FR-5: Social Media Import
 * - FR-6: Auto-categorization
 * - FR-10: Data Export
 * - FR-11: User Authentication
 * - NFR-3: Data Processing Performance
 * - NFR-5: Browser Compatibility
 * - NFR-8: Input Validation
 */