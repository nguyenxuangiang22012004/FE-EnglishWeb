import { useCallback } from 'react';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '@/store/index';

// Export pre-typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Custom hooks for auth
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, token, isLoading, error } = useAppSelector((state) => state.auth);

  const logout = useCallback(() => {
    dispatch({ type: 'auth/logout' });
  }, [dispatch]);

  return { user, token, isLoading, error, logout };
};

export default useAuth;
