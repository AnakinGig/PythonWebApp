import { renderHook, waitFor } from '@testing-library/react';
import useApi from '../../../hooks/useApi';
import httpClient from '../../../utils/httpClient';

jest.mock('../../../utils/httpClient');

describe('useApi Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useApi());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle successful API call', async () => {
    const mockData = { success: true, data: { id: 1, name: 'Test' } };
    const mockApiCall = jest.fn().mockResolvedValue({ data: mockData });

    const { result } = renderHook(() => useApi());

    let response;
    await waitFor(async () => {
      response = await result.current.callApi(mockApiCall);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(response.data).toEqual(mockData);
    expect(mockApiCall).toHaveBeenCalledTimes(1);
  });

  it('should handle API error', async () => {
    const mockError = {
      response: {
        data: { error: 'Something went wrong' }
      }
    };
    const mockApiCall = jest.fn().mockRejectedValue(mockError);

    const { result } = renderHook(() => useApi());

    let response;
    await waitFor(async () => {
      response = await result.current.callApi(mockApiCall);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Something went wrong');
    expect(response.error).toBe('Something went wrong');
  });

  it('should handle network error', async () => {
    const mockApiCall = jest.fn().mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useApi());

    let response;
    await waitFor(async () => {
      response = await result.current.callApi(mockApiCall);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Une erreur est survenue.');
  });

  it('should reset error', () => {
    const { result } = renderHook(() => useApi());

    result.current.resetError();

    expect(result.current.error).toBe(null);
  });
});
