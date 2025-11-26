import { useState } from 'react';
import httpClient from './httpClient';

/**
 * Custom hook for handling API calls with loading and error states
 * 
 * @returns {Object} { loading, error, callApi }
 * 
 * Usage:
 * const { loading, error, callApi } = useApi();
 * 
 * const handleSubmit = async () => {
 *   const result = await callApi(() => 
 *     httpClient.post('/endpoint', data)
 *   );
 *   if (result) {
 *     Handle success
 *   }
 * };
 */
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const callApi = async (apiFunction) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiFunction();
      setLoading(false);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Une erreur est survenue.';
      setError(errorMessage);
      setLoading(false);
      return null;
    }
  };

  const resetError = () => setError(null);

  return { loading, error, callApi, resetError };
};

export default useApi;
