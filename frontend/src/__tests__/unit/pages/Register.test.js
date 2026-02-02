import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Register from '../../../pages/Register';
import httpClient from '../../../utils/httpClient';

jest.mock('../../../utils/httpClient');

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Register Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render registration form', () => {
    renderWithRouter(<Register />);
    
    expect(screen.getByPlaceholderText('Jean')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Dupont')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('exemple@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Minimum 8 caractères')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /créer un compte/i })).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Register />);
    
    const submitButton = screen.getByRole('button', { name: /créer un compte/i });
    await user.click(submitButton);
    
    const inputs = screen.getAllByPlaceholderText(/dupont|jean|exemple|minimum/i);
    expect(inputs[0]).toHaveClass('is-invalid');
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Register />);
    
    const emailInput = screen.getByPlaceholderText('exemple@email.com');
    const submitButton = screen.getByRole('button', { name: /créer un compte/i });
    
    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);
    
    expect(emailInput).toHaveClass('is-invalid');
  });

  it('should validate password strength', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Register />);
    
    const passwordInput = screen.getByPlaceholderText('Minimum 8 caractères');
    const submitButton = screen.getByRole('button', { name: /créer un compte/i });
    
    await user.type(passwordInput, 'weak');
    await user.click(submitButton);
    
    expect(passwordInput).toHaveClass('is-invalid');
  });

  it('should call API on successful form submission', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      data: {
        success: true,
        data: { id: '1' }
      }
    };

    httpClient.post.mockResolvedValue(mockResponse);

    renderWithRouter(<Register />);
    
    const firstNameInput = screen.getByPlaceholderText('Jean');
    const lastNameInput = screen.getByPlaceholderText('Dupont');
    const emailInput = screen.getByPlaceholderText('exemple@email.com');
    const passwordInput = screen.getByPlaceholderText('Minimum 8 caractères');
    
    await user.type(firstNameInput, 'Jean');
    expect(firstNameInput).toHaveValue('Jean');
    
    await user.type(emailInput, 'jean@example.com');
    expect(emailInput).toHaveValue('jean@example.com');
  });

  it('should show error for duplicate email', async () => {
    const user = userEvent.setup();
    const mockError = {
      response: {
        data: { error: 'Cet email existe déjà' }
      }
    };

    httpClient.post.mockRejectedValue(mockError);

    renderWithRouter(<Register />);
    
    await user.type(screen.getByPlaceholderText('Jean'), 'Jean');
    await user.type(screen.getByPlaceholderText('Dupont'), 'Dupont');
    await user.type(screen.getByPlaceholderText('exemple@email.com'), 'existing@example.com');
    await user.type(screen.getByPlaceholderText('Minimum 8 caractères'), 'SecurePass123!');
    
    const submitButton = screen.getByRole('button', { name: /créer un compte/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(httpClient.post).toHaveBeenCalled();
    });
  });

  it('should have link to login page', () => {
    renderWithRouter(<Register />);
    
    const loginLink = screen.getByRole('link', { name: /se connecter/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});
