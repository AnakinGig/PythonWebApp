import { useState } from 'react';

/**
 * Custom hook for handling API calls with loading and error states
 * 
 * @returns {Object} { loading, error, callApi, resetError }
 * 
 * Usage example:
 * const { loading, error, callApi } = useApi();
 * 
 * const handleSubmit = async () => {
 *   const { data: result, error: apiError } = await callApi(() => 
 *     httpClient.post('/endpoint', data)
 *   );
 *   if (result) {
 *     // Handle success - result contains the response data
 *   } else {
 *     // Handle error - apiError contains the error message
 *     console.log(apiError);
 *   }
 * };
 * 
 * Then in your JSX:
 * {loading && <LoadingSpinner />}
 * {error && <Toast message={error} type="error" />}
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
      // Return the full response data
      // API returns { success: true, data: {...} } or { success: true, data: [...], pagination: {...} }
      return { data: response.data, error: null };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Une erreur est survenue.';
      setError(errorMessage);
      setLoading(false);
      return { data: null, error: errorMessage };
    }
  };

  const resetError = () => setError(null);

  return { loading, error, callApi, resetError };
};

export default useApi;
