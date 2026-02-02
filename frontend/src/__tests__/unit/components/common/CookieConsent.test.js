import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CookieConsent from '../../../../components/common/CookieConsent';

describe('CookieConsent Component', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    delete window.openCookiePreferences;
  });

  afterEach(() => {
    localStorage.clear();
    delete window.openCookiePreferences;
  });

  test('renders banner for first-time visitors (no saved consent)', () => {
    render(<CookieConsent />);
    
    expect(screen.getByText(/Nous utilisons des cookies/i)).toBeInTheDocument();
    expect(screen.getByText(/Tout accepter/i)).toBeInTheDocument();
    expect(screen.getByText(/Nécessaires uniquement/i)).toBeInTheDocument();
    expect(screen.getByText(/Personnaliser/i)).toBeInTheDocument();
  });

  test('does not render banner when consent is already saved', () => {
    const savedConsent = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookieConsent', JSON.stringify(savedConsent));

    render(<CookieConsent />);
    
    expect(screen.queryByText(/Nous utilisons des cookies/i)).not.toBeInTheDocument();
  });

  test('accepts all cookies and saves to localStorage', async () => {
    render(<CookieConsent />);
    
    const acceptAllButton = screen.getByText(/Tout accepter/i);
    fireEvent.click(acceptAllButton);

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('cookieConsent'));
      expect(saved.necessary).toBe(true);
      expect(saved.analytics).toBe(true);
      expect(saved.marketing).toBe(true);
      expect(saved.timestamp).toBeDefined();
    });

    // Banner should be hidden after accepting
    expect(screen.queryByText(/Nous utilisons des cookies/i)).not.toBeInTheDocument();
  });

  test('accepts only necessary cookies and saves to localStorage', async () => {
    render(<CookieConsent />);
    
    const necessaryOnlyButton = screen.getByText(/Nécessaires uniquement/i);
    fireEvent.click(necessaryOnlyButton);

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('cookieConsent'));
      expect(saved.necessary).toBe(true);
      expect(saved.analytics).toBe(false);
      expect(saved.marketing).toBe(false);
      expect(saved.timestamp).toBeDefined();
    });

    // Banner should be hidden after accepting
    expect(screen.queryByText(/Nous utilisons des cookies/i)).not.toBeInTheDocument();
  });

  test('opens preferences modal when clicking "Personnaliser"', () => {
    render(<CookieConsent />);
    
    const customizeButton = screen.getByText(/Personnaliser/i);
    fireEvent.click(customizeButton);

    // Modal should be visible
    expect(screen.getByText(/Préférences de cookies/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cookies nécessaires/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cookies analytiques/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cookies marketing/i)).toBeInTheDocument();
  });

  test('necessary cookies checkbox is always checked and disabled', () => {
    render(<CookieConsent />);
    
    const customizeButton = screen.getByText(/Personnaliser/i);
    fireEvent.click(customizeButton);

    const necessaryCheckbox = screen.getByLabelText(/Cookies nécessaires/i);
    expect(necessaryCheckbox).toBeChecked();
    expect(necessaryCheckbox).toBeDisabled();
  });

  test('toggles analytics and marketing cookies in preferences modal', () => {
    render(<CookieConsent />);
    
    const customizeButton = screen.getByText(/Personnaliser/i);
    fireEvent.click(customizeButton);

    const analyticsCheckbox = screen.getByLabelText(/Cookies analytiques/i);
    const marketingCheckbox = screen.getByLabelText(/Cookies marketing/i);

    // Initially unchecked
    expect(analyticsCheckbox).not.toBeChecked();
    expect(marketingCheckbox).not.toBeChecked();

    // Toggle analytics
    fireEvent.click(analyticsCheckbox);
    expect(analyticsCheckbox).toBeChecked();

    // Toggle marketing
    fireEvent.click(marketingCheckbox);
    expect(marketingCheckbox).toBeChecked();

    // Toggle marketing off
    fireEvent.click(marketingCheckbox);
    expect(marketingCheckbox).not.toBeChecked();
  });

  test('saves custom preferences from modal', async () => {
    render(<CookieConsent />);
    
    const customizeButton = screen.getByText(/Personnaliser/i);
    fireEvent.click(customizeButton);

    // Enable only analytics
    const analyticsCheckbox = screen.getByLabelText(/Cookies analytiques/i);
    fireEvent.click(analyticsCheckbox);

    // Save preferences
    const saveButton = screen.getByText(/Enregistrer mes préférences/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('cookieConsent'));
      expect(saved.necessary).toBe(true);
      expect(saved.analytics).toBe(true);
      expect(saved.marketing).toBe(false);
    });

    // Modal should be closed
    expect(screen.queryByText(/Préférences de cookies/i)).not.toBeInTheDocument();
  });

  test('closes preferences modal when clicking close button', () => {
    render(<CookieConsent />);
    
    const customizeButton = screen.getByText(/Personnaliser/i);
    fireEvent.click(customizeButton);

    // Modal should be visible
    expect(screen.getByText(/Préférences de cookies/i)).toBeInTheDocument();

    const closeButton = screen.getByLabelText(/Fermer/i);
    fireEvent.click(closeButton);

    // Modal should be closed, banner should still be visible
    expect(screen.queryByText(/Préférences de cookies/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Nous utilisons des cookies/i)).toBeInTheDocument();
  });

  test('exposes global function to reopen preferences', () => {
    render(<CookieConsent />);
    
    // Accept all to hide banner
    const acceptAllButton = screen.getByText(/Tout accepter/i);
    fireEvent.click(acceptAllButton);

    // Banner should be hidden
    expect(screen.queryByText(/Nous utilisons des cookies/i)).not.toBeInTheDocument();

    // Call global function
    expect(window.openCookiePreferences).toBeDefined();
    window.openCookiePreferences();

    // Preferences modal should open
    expect(screen.getByText(/Préférences de cookies/i)).toBeInTheDocument();
  });

  test('handles invalid localStorage data gracefully', () => {
    // Set invalid data in localStorage
    localStorage.setItem('cookieConsent', 'invalid-json');

    render(<CookieConsent />);
    
    // Should show banner due to parsing error
    expect(screen.getByText(/Nous utilisons des cookies/i)).toBeInTheDocument();
  });

  test('cleans up global function on unmount', () => {
    const { unmount } = render(<CookieConsent />);
    
    expect(window.openCookiePreferences).toBeDefined();
    
    unmount();
    
    expect(window.openCookiePreferences).toBeUndefined();
  });
});
