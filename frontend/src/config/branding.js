const BrandingConfig = {
  // Application Name
  appName: process.env.REACT_APP_NAME || 'PythonWebApp',
  appShortName: process.env.REACT_APP_SHORT_NAME || 'PWA',
  
  // Company Information
  companyName: process.env.REACT_APP_COMPANY_NAME || 'Your Company',
  companyUrl: process.env.REACT_APP_COMPANY_URL || 'https://example.com',
  
  // Application Description
  appDescription: process.env.REACT_APP_DESCRIPTION || 'Application moderne de gestion d\'utilisateurs avec React & Flask',
  appTagline: process.env.REACT_APP_TAGLINE || 'Bienvenue sur PythonWebApp',
  
  // Logo and Assets
  logoPath: process.env.REACT_APP_LOGO_PATH || '/logo.png',
  faviconPath: process.env.REACT_APP_FAVICON_PATH || '/favicon.ico',
  
  // Contact Information
  contactEmail: process.env.REACT_APP_CONTACT_EMAIL || 'contact@example.com',
  supportUrl: process.env.REACT_APP_SUPPORT_URL || '/support',
  
  // Social Media (optional)
  socialMedia: {
    twitter: process.env.REACT_APP_TWITTER || null,
    linkedin: process.env.REACT_APP_LINKEDIN || null,
    github: process.env.REACT_APP_GITHUB || null,
  },
  
  // Footer Copyright
  copyrightYear: process.env.REACT_APP_COPYRIGHT_YEAR || '2025',
  copyrightHolder: process.env.REACT_APP_COPYRIGHT_HOLDER || 'Your Company',
  
  // Theme Colors (for future customization)
  colors: {
    primary: process.env.REACT_APP_PRIMARY_COLOR || '#0d6efd',
    secondary: process.env.REACT_APP_SECONDARY_COLOR || '#6c757d',
  },
  
  // Features Toggles
  features: {
    darkMode: process.env.REACT_APP_FEATURE_DARK_MODE !== 'false',
    registration: process.env.REACT_APP_FEATURE_REGISTRATION !== 'false',
    apiDocs: process.env.REACT_APP_FEATURE_API_DOCS !== 'false',
  },
};

export default BrandingConfig;
