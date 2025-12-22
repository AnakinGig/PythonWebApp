import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('should render default spinner', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('spinner-border');
  });

  it('should render with custom message', () => {
    render(<LoadingSpinner message="Chargement des données..." />);
    
    expect(screen.getByText('Chargement des données...')).toBeInTheDocument();
  });

  it('should render with custom size', () => {
    render(<LoadingSpinner size="sm" />);
    
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('spinner-border-sm');
  });

  it('should render fullscreen variant', () => {
    const { container } = render(<LoadingSpinner fullscreen />);
    
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('d-flex', 'justify-content-center', 'align-items-center');
    expect(wrapper).toHaveStyle({ minHeight: '100vh' });
  });
});
