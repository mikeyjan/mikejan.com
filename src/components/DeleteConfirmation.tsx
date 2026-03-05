/**
 * DeleteConfirmation component for confirming city deletion
 * Requirements: 8.6, 8.7
 * 
 * This component:
 * - Displays a confirmation dialog before deleting a city
 * - Shows the city name to confirm the correct item is being deleted
 * - Provides confirm and cancel actions
 * - Prevents accidental deletions
 */

import React from 'react';
import './DeleteConfirmation.css';

/**
 * Props for DeleteConfirmation component
 */
interface DeleteConfirmationProps {
  cityName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

/**
 * DeleteConfirmation component
 * Requirements: 8.6, 8.7
 */
export const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  cityName,
  onConfirm,
  onCancel,
  isDeleting = false
}) => {
  /**
   * Handle background click to close dialog
   */
  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isDeleting) {
      onCancel();
    }
  };

  /**
   * Handle escape key press
   */
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCancel, isDeleting]);

  return (
    <div 
      className="delete-confirmation-overlay" 
      onClick={handleBackgroundClick}
      role="dialog"
      aria-labelledby="delete-confirmation-title"
      aria-describedby="delete-confirmation-description"
    >
      <div className="delete-confirmation-dialog">
        <h2 id="delete-confirmation-title" className="delete-confirmation-title">
          Confirm Deletion
        </h2>
        
        <p id="delete-confirmation-description" className="delete-confirmation-message">
          Are you sure you want to delete <strong>{cityName}</strong>?
          <br />
          This action cannot be undone.
        </p>

        <div className="delete-confirmation-actions">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="delete-confirmation-button delete-confirmation-button-cancel"
            type="button"
          >
            Cancel
          </button>
          
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="delete-confirmation-button delete-confirmation-button-confirm"
            type="button"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmation;
