import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Home from './Home';

jest.mock('../utils/httpClient');

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Home Page', () => {
  it('should render welcome message', () => {
    renderWithRouter(<Home />);
    
    expect(screen.getByText(/bienvenue/i)).toBeInTheDocument();
  });

  it('should render call-to-action buttons when not authenticated', () => {
    renderWithRouter(<Home />);
    
    expect(screen.getByText(/se connecter/i)).toBeInTheDocument();
    expect(screen.getByText(/cr\u00e9er un compte/i)).toBeInTheDocument();
  });

});
