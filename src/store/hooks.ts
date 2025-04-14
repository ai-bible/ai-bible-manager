/**
 * Типизированные хуки для работы с Redux
 */
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// Типизированный хук для диспетчера
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Типизированный хук для селектора
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
