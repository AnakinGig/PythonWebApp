import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Header from '../../../../components/layout/Header';
import { ThemeProvider } from '../../../../context/ThemeContext';

jest.mock('../../../../utils/httpClient');

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('Header Component', () => {
  it('should render app name', () => {
    renderWithRouter(<Header />);
    
    const appName = screen.getByText(/PythonWebApp/i);
    expect(appName).toBeInTheDocument();
  });

  it('should render navigation when not authenticated', () => {
    renderWithRouter(<Header />);
    
    const homeLink = screen.getByRole('link', { name: /accueil/i });
    expect(homeLink).toBeInTheDocument();
  });

  it('should render user menu when authenticated', () => {
    const mockUser = {
      id: '1',
      first_name: 'Jean',
      last_name: 'Dupont',
      email: 'jean@example.com',
      role: 'Utilisateur'
    };

    renderWithRouter(<Header user={mockUser} />);
    
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
  });

  it('should render admin link for admin users', () => {
    const mockAdmin = {
      id: '1',
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@example.com',
      role: 'Administrateur'
    };

    renderWithRouter(<Header user={mockAdmin} />);
    
    const adminLink = screen.getAllByText(/admin/i);
    expect(adminLink.length).toBeGreaterThan(0);
  });
});
