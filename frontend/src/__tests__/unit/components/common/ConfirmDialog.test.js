import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ConfirmDialog from '../../../../components/common/ConfirmDialog';

describe('ConfirmDialog Component', () => {
  const mockOnConfirm = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when show is false', () => {
    render(
      <ConfirmDialog
        show={false}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        title="Test Title"
        message="Test Message"
      />
    );

    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });

  it('should render when show is true', () => {
    render(
      <ConfirmDialog
        show={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        title="Test Title"
        message="Test Message"
      />
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('should call onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ConfirmDialog
        show={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        title="Test Title"
        message="Test Message"
      />
    );

    const confirmButton = screen.getByText('Confirmer');
    await user.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <ConfirmDialog
        show={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        title="Test Title"
        message="Test Message"
      />
    );

    const cancelButton = screen.getByText('Annuler');
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('should render custom button labels', () => {
    render(
      <ConfirmDialog
        show={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        title="Test Title"
        message="Test Message"
        confirmText="Oui"
        cancelText="Non"
      />
    );

    expect(screen.getByText('Oui')).toBeInTheDocument();
    expect(screen.getByText('Non')).toBeInTheDocument();
  });

  it('should apply danger variant to confirm button', () => {
    render(
      <ConfirmDialog
        show={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        title="Test Title"
        message="Test Message"
        variant="danger"
      />
    );

    const confirmButton = screen.getByText('Confirmer');
    expect(confirmButton).toHaveClass('btn-danger');
  });
});
