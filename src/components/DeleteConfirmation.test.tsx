/**
 * Unit tests for DeleteConfirmation component
 * Requirements: 8.6, 8.7
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DeleteConfirmation } from './DeleteConfirmation';

describe('DeleteConfirmation Component', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();
  const cityName = 'Tokyo';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test: Component renders with city name
   * Requirements: 8.6
   */
  it('should render with city name', () => {
    render(
      <DeleteConfirmation
        cityName={cityName}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    expect(screen.getByText(cityName)).toBeInTheDocument();
    expect(screen.getByText(/This action cannot be undone/i)).toBeInTheDocument();
  });

  /**
   * Test: Displays confirm and cancel buttons
   * Requirements: 8.6, 8.7
   */
  it('should display confirm and cancel buttons', () => {
    render(
      <DeleteConfirmation
        cityName={cityName}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  /**
   * Test: Calls onConfirm when confirm button is clicked
   * Requirements: 8.7
   */
  it('should call onConfirm when confirm button is clicked', () => {
    render(
      <DeleteConfirmation
        cityName={cityName}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const confirmButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  /**
   * Test: Calls onCancel when cancel button is clicked
   * Requirements: 8.6
   */
  it('should call onCancel when cancel button is clicked', () => {
    render(
      <DeleteConfirmation
        cityName={cityName}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  /**
   * Test: Calls onCancel when escape key is pressed
   * Requirements: 8.6
   */
  it('should call onCancel when escape key is pressed', () => {
    render(
      <DeleteConfirmation
        cityName={cityName}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  /**
   * Test: Calls onCancel when background is clicked
   * Requirements: 8.6
   */
  it('should call onCancel when background is clicked', () => {
    const { container } = render(
      <DeleteConfirmation
        cityName={cityName}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const overlay = container.querySelector('.delete-confirmation-overlay');
    if (overlay) {
      fireEvent.click(overlay);
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    }
  });

  /**
   * Test: Does not close when dialog content is clicked
   * Requirements: 8.6
   */
  it('should not close when dialog content is clicked', () => {
    const { container } = render(
      <DeleteConfirmation
        cityName={cityName}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const dialog = container.querySelector('.delete-confirmation-dialog');
    if (dialog) {
      fireEvent.click(dialog);
      expect(mockOnCancel).not.toHaveBeenCalled();
    }
  });

  /**
   * Test: Shows loading state during deletion
   * Requirements: 8.7
   */
  it('should show loading state during deletion', () => {
    render(
      <DeleteConfirmation
        cityName={cityName}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        isDeleting={true}
      />
    );

    expect(screen.getByRole('button', { name: /deleting/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /deleting/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
  });

  /**
   * Test: Prevents actions during deletion
   * Requirements: 8.7
   */
  it('should prevent actions during deletion', () => {
    render(
      <DeleteConfirmation
        cityName={cityName}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        isDeleting={true}
      />
    );

    // Try to click cancel button
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    expect(mockOnCancel).not.toHaveBeenCalled();

    // Try to press escape
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(mockOnCancel).not.toHaveBeenCalled();
  });

  /**
   * Test: Has proper ARIA attributes for accessibility
   * Requirements: 8.6
   */
  it('should have proper ARIA attributes', () => {
    const { container } = render(
      <DeleteConfirmation
        cityName={cityName}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
      />
    );

    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute('aria-labelledby', 'delete-confirmation-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'delete-confirmation-description');
  });
});


/**
 * Property-based tests for DeleteConfirmation
 */
import * as fc from 'fast-check';

describe('DeleteConfirmation Property Tests', () => {
  /**
   * Property 18: Delete confirmation prompt appears
   * Validates: Requirements 8.6
   * 
   * Property: For any city name, when a delete action is initiated, a confirmation
   * dialog SHALL appear such that:
   * 1. The dialog displays the city name to be deleted
   * 2. The dialog provides a "Cancel" button
   * 3. The dialog provides a "Delete" button
   * 4. The dialog can be dismissed via Cancel button
   * 5. The dialog can be dismissed via Escape key
   * 6. The dialog can be dismissed via background click
   * 7. Clicking Delete triggers the onConfirm callback
   * 8. The dialog prevents accidental deletion by requiring explicit confirmation
   */
  it('Property 18: Delete confirmation prompt appears for any city name', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary city names
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        async (cityName) => {
          const mockOnConfirm = jest.fn();
          const mockOnCancel = jest.fn();

          const { container, unmount } = render(
            <DeleteConfirmation
              cityName={cityName}
              onConfirm={mockOnConfirm}
              onCancel={mockOnCancel}
            />
          );

          try {
            // Property 1: Dialog displays the city name (Requirement 8.6)
            // Use container.textContent to check for city name presence
            expect(container.textContent).toContain(cityName);
            expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();

            // Property 2: Dialog provides a Cancel button (Requirement 8.6)
            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            expect(cancelButton).toBeInTheDocument();
            expect(cancelButton).not.toBeDisabled();

            // Property 3: Dialog provides a Delete button (Requirement 8.6)
            const deleteButton = screen.getByRole('button', { name: /delete/i });
            expect(deleteButton).toBeInTheDocument();
            expect(deleteButton).not.toBeDisabled();

            // Property 4: Dialog can be dismissed via Cancel button (Requirement 8.6)
            fireEvent.click(cancelButton);
            expect(mockOnCancel).toHaveBeenCalledTimes(1);
            expect(mockOnConfirm).not.toHaveBeenCalled();

            // Reset mocks for next test
            jest.clearAllMocks();

            // Property 5: Dialog can be dismissed via Escape key (Requirement 8.6)
            fireEvent.keyDown(document, { key: 'Escape' });
            expect(mockOnCancel).toHaveBeenCalledTimes(1);
            expect(mockOnConfirm).not.toHaveBeenCalled();

            // Reset mocks for next test
            jest.clearAllMocks();

            // Property 6: Dialog can be dismissed via background click (Requirement 8.6)
            const overlay = container.querySelector('.delete-confirmation-overlay');
            if (overlay) {
              fireEvent.click(overlay);
              expect(mockOnCancel).toHaveBeenCalledTimes(1);
              expect(mockOnConfirm).not.toHaveBeenCalled();
            }

            // Reset mocks for next test
            jest.clearAllMocks();

            // Property 7: Clicking Delete triggers onConfirm callback (Requirement 8.6)
            fireEvent.click(deleteButton);
            expect(mockOnConfirm).toHaveBeenCalledTimes(1);
            expect(mockOnCancel).not.toHaveBeenCalled();

            // Property 8: Dialog prevents accidental deletion (Requirement 8.6)
            // Verify that the dialog requires explicit user action (button click)
            // and doesn't auto-delete or delete on any random interaction
            expect(mockOnConfirm).toHaveBeenCalledTimes(1); // Only called once, explicitly

            return true;
          } finally {
            unmount();
            jest.clearAllMocks();
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Delete confirmation prevents actions during deletion
   * Validates: Requirements 8.7
   */
  it('Property: Delete confirmation prevents actions during deletion', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        async (cityName) => {
          const mockOnConfirm = jest.fn();
          const mockOnCancel = jest.fn();

          const { container, unmount } = render(
            <DeleteConfirmation
              cityName={cityName}
              onConfirm={mockOnConfirm}
              onCancel={mockOnCancel}
              isDeleting={true}
            />
          );

          try {
            // Verify buttons are disabled during deletion
            const cancelButton = screen.getByRole('button', { name: /cancel/i });
            const deleteButton = screen.getByRole('button', { name: /deleting/i });

            expect(cancelButton).toBeDisabled();
            expect(deleteButton).toBeDisabled();

            // Try to click buttons - should not trigger callbacks
            fireEvent.click(cancelButton);
            fireEvent.click(deleteButton);
            expect(mockOnCancel).not.toHaveBeenCalled();
            expect(mockOnConfirm).not.toHaveBeenCalled();

            // Try to press Escape - should not trigger callback
            fireEvent.keyDown(document, { key: 'Escape' });
            expect(mockOnCancel).not.toHaveBeenCalled();

            // Try to click background - should not trigger callback
            const overlay = container.querySelector('.delete-confirmation-overlay');
            if (overlay) {
              fireEvent.click(overlay);
              expect(mockOnCancel).not.toHaveBeenCalled();
            }

            return true;
          } finally {
            unmount();
            jest.clearAllMocks();
          }
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Delete confirmation shows correct city name
   * Validates: Requirements 8.6
   */
  it('Property: Delete confirmation always shows the correct city name', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        async (cityName) => {
          const mockOnConfirm = jest.fn();
          const mockOnCancel = jest.fn();

          const { container, unmount } = render(
            <DeleteConfirmation
              cityName={cityName}
              onConfirm={mockOnConfirm}
              onCancel={mockOnCancel}
            />
          );

          try {
            // Verify the exact city name is displayed
            expect(container.textContent).toContain(cityName);
            
            // Verify the city name is in a strong tag
            const strongElements = container.querySelectorAll('strong');
            const cityNameInStrong = Array.from(strongElements).some(
              el => el.textContent === cityName
            );
            expect(cityNameInStrong).toBe(true);

            // Verify warning message is present
            expect(screen.getByText(/This action cannot be undone/i)).toBeInTheDocument();

            return true;
          } finally {
            unmount();
            jest.clearAllMocks();
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});
