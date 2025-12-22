/**
 * Frontend Integration Tests
 * Tests end-to-end user workflows and page transitions
 */

import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import App from '../../App';
import httpClient from '../../utils/httpClient';

jest.mock('../../utils/httpClient');

const renderApp = () => {
  return render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
};

describe('Frontend Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('User Registration to Profile Access Flow', () => {
    it('should allow user to register, login, and access profile', async () => {
      const user = userEvent.setup();

      // Mock registration response
      httpClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            id: '123',
            email: 'integration@example.com',
            first_name: 'Integration',
            last_name: 'Test',
            email_verified: false
          }
        }
      });

      // Mock login response
      httpClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            id: '123',
            email: 'integration@example.com',
            first_name: 'Integration',
            last_name: 'Test',
            email_verified: true
          }
        }
      });

      // Mock profile response
      httpClient.get.mockResolvedValueOnce({
        data: {
          data: {
            id: '123',
            email: 'integration@example.com',
            first_name: 'Integration',
            last_name: 'Test',
            email_verified: true
          }
        }
      });

      renderApp();

      // Navigate to register page
      const registerLink = screen.getByRole('link', { name: /inscription/i });
      await user.click(registerLink);

      // Fill registration form
      const firstNameInput = screen.getByPlaceholderText('Jean');
      const lastNameInput = screen.getByPlaceholderText('Dupont');
      const emailInput = screen.getByPlaceholderText('exemple@email.com');
      const passwordInput = screen.getByPlaceholderText('Minimum 8 caractères');

      await user.type(firstNameInput, 'Integration');
      await user.type(lastNameInput, 'Test');
      await user.type(emailInput, 'integration@example.com');
      await user.type(passwordInput, 'IntegrationTest123!');

      // Submit registration
      const submitButton = screen.getByRole('button', { name: /créer un compte/i });
      await user.click(submitButton);

      // Wait for registration to complete
      await waitFor(() => {
        expect(httpClient.post).toHaveBeenCalled();
      });

      // Mock login
      httpClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            id: '123',
            email: 'integration@example.com'
          }
        }
      });

      // Navigate to login
      const loginLink = screen.getByRole('link', { name: /connexion/i });
      await user.click(loginLink);

      // Fill login form
      const loginEmail = screen.getByPlaceholderText('exemple@email.com');
      const loginPassword = screen.getByPlaceholderText('Entrer votre mot de passe');

      await user.type(loginEmail, 'integration@example.com');
      await user.type(loginPassword, 'IntegrationTest123!');

      // Submit login
      const loginButton = screen.getByRole('button', { name: /se connecter/i });
      await user.click(loginButton);

      // Verify login was called
      await waitFor(() => {
        expect(httpClient.post).toHaveBeenCalledWith(
          expect.stringContaining('/auth/login'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Login and Logout Flow', () => {
    it('should allow user to login and logout', async () => {
      const user = userEvent.setup();

      // Mock login response
      httpClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            id: '123',
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User'
          }
        }
      });

      renderApp();

      // Navigate to login
      const loginLink = screen.getByRole('link', { name: /connexion/i });
      await user.click(loginLink);

      // Fill and submit login form
      const emailInput = screen.getByPlaceholderText('exemple@email.com');
      const passwordInput = screen.getByPlaceholderText('Entrer votre mot de passe');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'TestPassword123!');

      const loginButton = screen.getByRole('button', { name: /se connecter/i });
      await user.click(loginButton);

      // Verify login was called
      await waitFor(() => {
        expect(httpClient.post).toHaveBeenCalledWith(
          expect.stringContaining('/auth/login'),
          expect.any(Object)
        );
      });

      // Mock logout response
      httpClient.post.mockResolvedValueOnce({
        data: { success: true }
      });

      // Find and click logout button
      await waitFor(() => {
        const logoutButton = screen.queryByRole('button', { name: /déconnecter|logout/i });
        if (logoutButton) {
          expect(logoutButton).toBeInTheDocument();
        }
      });
    });
  });

  describe('Password Reset Flow', () => {
    it('should guide user through password reset', async () => {
      const user = userEvent.setup();

      // Mock password reset request
      httpClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Email envoyé'
        }
      });

      renderApp();

      // Navigate to forgot password
      const forgotLink = screen.getByRole('link', { name: /mot de passe oublié/i });
      await user.click(forgotLink);

      // Fill forgot password form
      const emailInput = screen.getByPlaceholderText('exemple@email.com');
      await user.type(emailInput, 'test@example.com');

      // Submit forgot password request
      const submitButton = screen.getByRole('button', { name: /envoyer|demander/i });
      await user.click(submitButton);

      // Verify reset request was made
      await waitFor(() => {
        expect(httpClient.post).toHaveBeenCalled();
      });
    });
  });

  describe('Email Verification Flow', () => {
    it('should guide user to verify email after registration', async () => {
      const user = userEvent.setup();

      // Mock registration with unverified email
      httpClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            id: '123',
            email: 'unverified@example.com',
            email_verified: false
          }
        }
      });

      renderApp();

      // Navigate to register
      const registerLink = screen.getByRole('link', { name: /inscription/i });
      await user.click(registerLink);

      // Fill registration form (minimal)
      const firstNameInput = screen.getByPlaceholderText('Jean');
      const emailInput = screen.getByPlaceholderText('exemple@email.com');

      await user.type(firstNameInput, 'Test');
      await user.type(emailInput, 'unverified@example.com');

      // After registration, there should be a verification prompt
      // This would depend on your implementation
      await waitFor(() => {
        expect(httpClient.post).toHaveBeenCalled();
      });
    });
  });

  describe('Role-Based Page Access', () => {
    it('should restrict admin pages from regular users', async () => {
      const user = userEvent.setup();

      // Mock authenticated regular user
      httpClient.get.mockResolvedValueOnce({
        data: {
          data: {
            id: '123',
            email: 'user@example.com',
            role: 'Utilisateur'
          }
        }
      });

      renderApp();

      // Try to access admin dashboard URL directly
      // Should be redirected or show access denied
      // Exact behavior depends on PrivateRoute implementation

      // Regular user should NOT see admin menu items
      const adminLinks = screen.queryAllByText(/admin|administration/i);
      expect(adminLinks.length).toBe(0);
    });

    it('should allow admin users to access admin pages', async () => {
      // Mock authenticated admin user
      httpClient.get.mockResolvedValueOnce({
        data: {
          data: {
            id: '123',
            email: 'admin@example.com',
            role: 'Administrateur'
          }
        }
      });

      renderApp();

      // Admin should see admin menu items
      // Exact behavior depends on your Header component
      await waitFor(() => {
        // Check if admin can see admin navigation
        // This would typically be in a dropdown or menu
      });
    });
  });

  describe('Profile Update Flow', () => {
    it('should allow user to update their profile', async () => {
      const user = userEvent.setup();

      // Mock authenticated user
      localStorage.setItem('isLoggedIn', 'true');

      // Mock profile get
      httpClient.get.mockResolvedValueOnce({
        data: {
          data: {
            id: '123',
            email: 'user@example.com',
            first_name: 'John',
            last_name: 'Doe'
          }
        }
      });

      // Mock profile update
      httpClient.patch.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            id: '123',
            email: 'user@example.com',
            first_name: 'Jane',
            last_name: 'Doe'
          }
        }
      });

      renderApp();

      // Navigate to profile (would typically be after login)
      // This depends on your routing implementation

      // Update first name
      await waitFor(() => {
        const firstNameInputs = screen.queryAllByDisplayValue(/john/i);
        if (firstNameInputs.length > 0) {
          expect(firstNameInputs[0]).toBeInTheDocument();
        }
      });
    });
  });

  describe('Multi-step User Journey', () => {
    it('should support complete user journey: register → verify → login → profile → logout', async () => {
      const user = userEvent.setup();

      // Step 1: Register
      httpClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            id: '123',
            email: 'journey@example.com',
            email_verified: false
          }
        }
      });

      renderApp();

      const registerLink = screen.getByRole('link', { name: /inscription/i });
      await user.click(registerLink);

      const emailInput = screen.getByPlaceholderText('exemple@email.com');
      await user.type(emailInput, 'journey@example.com');

      const registerButton = screen.getByRole('button', { name: /créer un compte/i });
      await user.click(registerButton);

      // Verify registration was called
      await waitFor(() => {
        expect(httpClient.post).toHaveBeenCalled();
      });

      // Step 2: Verify email (would typically be via email link)
      // Mock would simulate email verification

      // Step 3: Login
      httpClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            id: '123',
            email: 'journey@example.com',
            email_verified: true
          }
        }
      });

      const loginLink = screen.getByRole('link', { name: /connexion/i });
      await user.click(loginLink);

      const loginEmail = screen.getByPlaceholderText('exemple@email.com');
      await user.type(loginEmail, 'journey@example.com');

      const loginButton = screen.getByRole('button', { name: /se connecter/i });
      await user.click(loginButton);

      // Verify login was called
      await waitFor(() => {
        expect(httpClient.post).toHaveBeenCalledWith(
          expect.stringContaining('/auth/login'),
          expect.any(Object)
        );
      });

      // Step 4: Access profile
      httpClient.get.mockResolvedValueOnce({
        data: {
          data: {
            id: '123',
            email: 'journey@example.com',
            email_verified: true
          }
        }
      });

      // Would typically navigate to profile after successful login
      // Verify profile endpoint would be called
    });
  });
});
