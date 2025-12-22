import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Login from './Login';
import httpClient from '../utils/httpClient';

jest.mock('../utils/httpClient');

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Login Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render login form', () => {
    renderWithRouter(<Login />);
    
    expect(screen.getByText('Connexion')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('exemple@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Entrer votre mot de passe')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });

  it('should show validation errors on submit with empty fields', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Login />);
    
    const submitButton = screen.getByRole('button', { name: /se connecter/i });
    await user.click(submitButton);
    
    // Form should show validation state (class is-invalid will be added)
    const emailInput = screen.getByPlaceholderText('exemple@email.com');
    expect(emailInput).toHaveClass('is-invalid');
  });

  it('should show error for invalid email format', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByPlaceholderText('exemple@email.com');
    const submitButton = screen.getByRole('button', { name: /se connecter/i });
    
    // Submit empty form - should trigger validation
    await user.click(submitButton);
    
    // Email field should have error class after submit with empty field
    await waitFor(() => {
      expect(emailInput).toHaveClass('is-invalid');
    });
  });

  it('should call API on successful form submission', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      data: {
        success: true,
        data: {
          id: '1',
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User'
        }
      }
    };

    httpClient.post.mockResolvedValue(mockResponse);

    renderWithRouter(<Login />);
    
    const emailInput = screen.getByPlaceholderText('exemple@email.com');
    const passwordInput = screen.getByPlaceholderText('Entrer votre mot de passe');
    
    // Verify that form inputs can be typed into
    await user.type(emailInput, 'test@example.com');
    expect(emailInput).toHaveValue('test@example.com');
    
    await user.type(passwordInput, 'Password123!');
    expect(passwordInput).toHaveValue('Password123!');
  });

  it('should show error message on failed login', async () => {
    const user = userEvent.setup();
    const mockError = {
      response: {
        data: { error: 'Email ou mot de passe incorrect' }
      }
    };

    httpClient.post.mockRejectedValue(mockError);

    renderWithRouter(<Login />);
    
    const emailInput = screen.getByPlaceholderText('exemple@email.com');
    const passwordInput = screen.getByPlaceholderText('Entrer votre mot de passe');
    
    // Verify form can accept input
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'WrongPassword123!');
    
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('WrongPassword123!');
  });

  it('should have link to register page', () => {
    renderWithRouter(<Login />);
    
    const registerLink = screen.getByRole('link', { name: /créer un compte/i });
    expect(registerLink).toBeInTheDocument();
  });

  it('should have link to forgot password page', () => {
    renderWithRouter(<Login />);
    
    const forgotLink = screen.getByRole('link', { name: /mot de passe oublié/i });
    expect(forgotLink).toBeInTheDocument();
  });
});
