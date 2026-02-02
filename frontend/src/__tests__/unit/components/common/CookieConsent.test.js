import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import CookieConsent from '../../../../components/common/CookieConsent';

describe('CookieConsent Component', () => {
  beforeEach(() => {
    localStorage.clear();
    delete window.openCookiePreferences;
  });

  afterEach(() => {
    localStorage.clear();
    delete window.openCookiePreferences;
  });

  test('renders banner for first-time visitors', () => {
    render(<CookieConsent />);
    expect(screen.getByRole('dialog', { name: /consentement aux cookies/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /tout accepter/i })).toBeInTheDocument();
  });

  test('does not render banner when consent is saved', () => {
    const savedConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookieConsent', JSON.stringify(savedConsent));

    render(<CookieConsent />);
    expect(screen.queryByRole('dialog', { name: /consentement aux cookies/i })).not.toBeInTheDocument();
  });

  test('accepts all cookies', async () => {
    render(<CookieConsent />);
    const acceptAllButton = screen.getByRole('button', { name: /tout accepter/i });
    fireEvent.click(acceptAllButton);

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('cookieConsent'));
      expect(saved.analytics).toBe(true);
      expect(saved.marketing).toBe(true);
    });
  });

  test('accepts only necessary cookies', async () => {
    render(<CookieConsent />);
    const buttons = screen.getAllByRole('button', { name: /nécessaires uniquement/i });
    fireEvent.click(buttons[0]);

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('cookieConsent'));
      expect(saved.analytics).toBe(false);
      expect(saved.marketing).toBe(false);
    });
  });

  test('opens preferences modal', async () => {
    render(<CookieConsent />);
    const customizeButton = screen.getByRole('button', { name: /personnaliser les préférences/i });
    fireEvent.click(customizeButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /préférences de cookies/i })).toBeInTheDocument();
    });
  });

  test('toggles analytics preference', async () => {
    render(<CookieConsent />);
    const customizeButton = screen.getByRole('button', { name: /personnaliser les préférences/i });
    fireEvent.click(customizeButton);

    await waitFor(() => {
      const analyticsCheckbox = screen.getByLabelText(/Cookies analytiques/i);
      fireEvent.click(analyticsCheckbox);
      expect(analyticsCheckbox).toBeChecked();
    });
  });

  test('saves custom preferences', async () => {
    render(<CookieConsent />);
    const customizeButton = screen.getByRole('button', { name: /personnaliser les préférences/i });
    fireEvent.click(customizeButton);

    await waitFor(() => {
      const analyticsCheckbox = screen.getByLabelText(/Cookies analytiques/i);
      fireEvent.click(analyticsCheckbox);
    });

    const saveButton = screen.getByRole('button', { name: /enregistrer mes préférences/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('cookieConsent'));
      expect(saved.analytics).toBe(true);
    });
  });

  test('closes modal when clicking close button', async () => {
    render(<CookieConsent />);
    const customizeButton = screen.getByRole('button', { name: /personnaliser les préférences/i });
    fireEvent.click(customizeButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /préférences de cookies/i })).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /fermer/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: /préférences de cookies/i })).not.toBeInTheDocument();
    });
  });

  test('cleans up global function on unmount', () => {
    const { unmount } = render(<CookieConsent />);
    expect(window.openCookiePreferences).toBeDefined();
    unmount();
    expect(window.openCookiePreferences).toBeUndefined();
  });
});
