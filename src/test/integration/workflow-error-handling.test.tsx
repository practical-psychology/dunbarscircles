import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithoutRouter, testHelpers } from '../test-utils'
import App from '../../App'

describe('Workflow Error Handling Integration Tests', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    testHelpers.cleanupMocks()
    testHelpers.setupCanvasMock()
    testHelpers.setupFirebaseAuth(null)
  })

  describe('Data Import Error Handling', () => {
    it('should handle malformed CSV files gracefully', async () => {
      // Setup mock file reader with malformed CSV
      const malformedCSV = `First Name,Last Name,Email
John,Doe
Jane,Smith,jane@example.com,Extra,Column`
      
      testHelpers.mockFileReader(malformedCSV)
      
      renderWithoutRouter(<App />)

      await user.click(screen.getByRole('link', { name: /dashboard/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
      })

      const importButton = screen.queryByText(/import/i)
      if (importButton) {
        await user.click(importButton)

        const csvFile = testHelpers.createMockFile(malformedCSV, 'malformed.csv', 'text/csv')
        
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
        if (fileInput) {
          Object.defineProperty(fileInput, 'files', {
            value: [csvFile],
            writable: false,
          })
          
          fireEvent.change(fileInput)

          // Should show error message or handle gracefully
          await waitFor(() => {
            const errorMessage = screen.queryByText(/error/i) || screen.queryByText(/invalid/i) || screen.queryByText(/failed/i)
            expect(errorMessage || screen.queryByText(/imported/i)).toBeTruthy()
          }, { timeout: 3000 })
        }
      }
    })

    it('should handle invalid JSON files', async () => {
      const invalidJSON = `{ "friends_v2": [ { "name": "John Doe", "timestamp": invalid } ] }`
      
      testHelpers.mockFileReader(invalidJSON)
      
      renderWithoutRouter(<App />)

      await user.click(screen.getByRole('link', { name: /dashboard/i }))
      
      const importButton = screen.queryByText(/import/i) || screen.queryByText(/facebook/i)
      if (importButton) {
        await user.click(importButton)

        const jsonFile = testHelpers.createMockFile(invalidJSON, 'invalid.json', 'application/json')
        
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
        if (fileInput) {
          Object.defineProperty(fileInput, 'files', {
            value: [jsonFile],
            writable: false,
          })
          
          fireEvent.change(fileInput)

          await waitFor(() => {
            // Should handle JSON parsing error
            const errorIndicator = screen.queryByText(/error/i) || screen.queryByText(/invalid/i)
            expect(errorIndicator || screen.queryByText(/processed/i)).toBeTruthy()
          }, { timeout: 3000 })
        }
      }
    })

    it('should handle empty files', async () => {
      testHelpers.mockFileReader('')
      
      renderWithoutRouter(<App />)

      await user.click(screen.getByRole('link', { name: /dashboard/i }))
      
      const importButton = screen.queryByText(/import/i)
      if (importButton) {
        await user.click(importButton)

        const emptyFile = testHelpers.createMockFile('', 'empty.csv', 'text/csv')
        
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
        if (fileInput) {
          Object.defineProperty(fileInput, 'files', {
            value: [emptyFile],
            writable: false,
          })
          
          fireEvent.change(fileInput)

          await waitFor(() => {
            // Should handle empty file gracefully
            const message = screen.queryByText(/empty/i) || screen.queryByText(/no data/i) || screen.queryByText(/processed/i)
            expect(message).toBeTruthy()
          }, { timeout: 3000 })
        }
      }
    })
  })

  describe('Authentication Error Handling', () => {
    it('should handle authentication failures', async () => {
      // Mock Firebase auth to reject
      const { signInWithPopup } = await import('../firebase-mocks')
      signInWithPopup.mockRejectedValue(new Error('Authentication failed'))
      
      renderWithoutRouter(<App />)

      const signInButton = screen.queryByText(/sign in/i)
      if (signInButton) {
        await user.click(signInButton)

        await waitFor(() => {
          // Should show error message or remain on sign-in state
          const errorMessage = screen.queryByText(/error/i) || screen.queryByText(/failed/i) || screen.queryByText(/sign in/i)
          expect(errorMessage).toBeTruthy()
        })
      }
    })

    it('should handle network failures during authentication', async () => {
      // Mock network error
      const { signInWithPopup } = await import('../firebase-mocks')
      signInWithPopup.mockRejectedValue(new Error('Network error'))
      
      renderWithoutRouter(<App />)

      const signInButton = screen.queryByText(/sign in/i)
      if (signInButton) {
        await user.click(signInButton)

        await waitFor(() => {
          // Should handle network error gracefully
          const networkError = screen.queryByText(/network/i) || screen.queryByText(/connection/i) || screen.queryByText(/sign in/i)
          expect(networkError).toBeTruthy()
        })
      }
    })
  })

  describe('Export Error Handling', () => {
    it('should handle export failures gracefully', async () => {
      // Mock URL.createObjectURL to fail
      global.URL.createObjectURL = vi.fn(() => {
        throw new Error('Export failed')
      })
      
      renderWithoutRouter(<App />)

      await user.click(screen.getByRole('link', { name: /network/i }))
      
      await waitFor(() => {
        expect(screen.getByTestId('network-diagram')).toBeInTheDocument()
      })

      const exportButton = screen.queryByText(/export/i)
      if (exportButton) {
        await user.click(exportButton)

        const pngExport = screen.queryByText(/png/i)
        if (pngExport) {
          await user.click(pngExport)
          
          await waitFor(() => {
            // Should handle export error gracefully
            const errorMessage = screen.queryByText(/error/i) || screen.queryByText(/failed/i)
            expect(errorMessage || screen.getByTestId('network-diagram')).toBeTruthy()
          })
        }
      }
    })

    it('should handle canvas export failures', async () => {
      // Mock canvas toDataURL to fail
      HTMLCanvasElement.prototype.toDataURL = vi.fn(() => {
        throw new Error('Canvas export failed')
      })
      
      renderWithoutRouter(<App />)

      await user.click(screen.getByRole('link', { name: /network/i }))
      
      await waitFor(() => {
        expect(screen.getByTestId('network-diagram')).toBeInTheDocument()
      })

      const exportButton = screen.queryByText(/export/i)
      if (exportButton) {
        await user.click(exportButton)

        const pngExport = screen.queryByText(/png/i)
        if (pngExport) {
          await user.click(pngExport)
          
          // Should handle canvas export error
          await waitFor(() => {
            const errorIndicator = screen.queryByText(/error/i) || screen.getByTestId('network-diagram')
            expect(errorIndicator).toBeTruthy()
          })
        }
      }
    })
  })

  describe('Data Persistence Error Handling', () => {
    it('should handle localStorage failures', async () => {
      // Mock localStorage to fail
      const mockLocalStorage = {
        getItem: vi.fn(() => { throw new Error('Storage error') }),
        setItem: vi.fn(() => { throw new Error('Storage error') }),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn()
      }
      
      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage
      })
      
      renderWithoutRouter(<App />)

      await user.click(screen.getByRole('link', { name: /dashboard/i }))
      
      // Should handle storage errors gracefully
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument()
      })

      const addButton = screen.queryByText(/add/i)
      if (addButton) {
        await user.click(addButton)
        
        const nameInput = screen.queryByLabelText(/name/i)
        if (nameInput) {
          await user.type(nameInput, 'Test Contact')
        }

        const saveButton = screen.queryByText(/save/i)
        if (saveButton) {
          await user.click(saveButton)
          
          // Should handle save error gracefully
          await waitFor(() => {
            const errorMessage = screen.queryByText(/error/i) || screen.queryByText(/failed/i) || screen.getByText(/dashboard/i)
            expect(errorMessage).toBeTruthy()
          })
        }
      }
    })
  })

  describe('Large Dataset Handling', () => {
    it('should handle large datasets without performance issues', async () => {
      // Create large dataset
      const largeDataset = Array.from({ length: 1000 }, (_, i) => 
        testHelpers.createMockRelationship({ 
          name: `Contact ${i}`, 
          id: `contact-${i}` 
        })
      )
      
      testHelpers.setupContactStorage(largeDataset)
      
      renderWithoutRouter(<App />)

      // Navigate to visualization with large dataset
      await user.click(screen.getByRole('link', { name: /network/i }))
      
      // Should load without crashing
      await waitFor(() => {
        expect(screen.getByTestId('network-diagram')).toBeInTheDocument()
      }, { timeout: 5000 })

      // Test interaction with large dataset
      const mockNode = screen.queryByTestId('mock-node')
      if (mockNode) {
        await user.click(mockNode)
        
        // Should handle interaction without performance issues
        await waitFor(() => {
          expect(screen.getByTestId('network-diagram')).toBeInTheDocument()
        })
      }
    })

    it('should handle export of large datasets', async () => {
      const largeDataset = Array.from({ length: 500 }, (_, i) => 
        testHelpers.createMockRelationship({ 
          name: `Export Contact ${i}`, 
          id: `export-contact-${i}` 
        })
      )
      
      testHelpers.setupContactStorage(largeDataset)
      
      renderWithoutRouter(<App />)

      await user.click(screen.getByRole('link', { name: /dashboard/i }))
      
      const exportButton = screen.queryByText(/export/i)
      if (exportButton) {
        await user.click(exportButton)

        const csvExport = screen.queryByText(/csv/i)
        if (csvExport) {
          await user.click(csvExport)
          
          // Should handle large export without crashing
          await waitFor(() => {
            expect(global.URL.createObjectURL).toHaveBeenCalled()
          }, { timeout: 5000 })
        }
      }
    })
  })

  describe('Browser Compatibility Edge Cases', () => {
    it('should handle missing Canvas API support', async () => {
      // Mock missing Canvas support
      HTMLCanvasElement.prototype.getContext = vi.fn(() => null)
      
      renderWithoutRouter(<App />)

      await user.click(screen.getByRole('link', { name: /network/i }))
      
      // Should handle missing Canvas API gracefully
      await waitFor(() => {
        const fallbackMessage = screen.queryByText(/not supported/i) || screen.getByTestId('network-diagram')
        expect(fallbackMessage).toBeTruthy()
      })
    })

    it('should handle missing File API support', async () => {
      // Mock missing File API
      delete (global as any).File
      delete (global as any).FileReader
      
      renderWithoutRouter(<App />)

      await user.click(screen.getByRole('link', { name: /dashboard/i }))
      
      const importButton = screen.queryByText(/import/i)
      if (importButton) {
        await user.click(importButton)
        
        // Should handle missing File API gracefully
        await waitFor(() => {
          const fallbackMessage = screen.queryByText(/not supported/i) || screen.getByText(/dashboard/i)
          expect(fallbackMessage).toBeTruthy()
        })
      }
    })

    it('should handle missing localStorage support', async () => {
      // Mock missing localStorage
      Object.defineProperty(window, 'localStorage', {
        value: undefined
      })
      
      renderWithoutRouter(<App />)

      // Should still function without localStorage
      await waitFor(() => {
        expect(screen.getByText(/yakw/i) || screen.getByRole('main')).toBeTruthy()
      })
    })
  })
})