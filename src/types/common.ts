/**
 * Common types used across the application
 */

/**
 * Network types
 */
export type NetworkType = 'mainnet' | 'testnet' | 'devnet';

/**
 * Standard response structure for API calls
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: number;
}

/**
 * Date range for filtering data
 */
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Theme types for UI customization
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Component sizes
 */
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Toast notification types
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast notification
 */
export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

/**
 * Modal types
 */
export type ModalType = 'confirm' | 'info' | 'warning' | 'error' | 'custom';

/**
 * Modal props
 */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  type?: ModalType;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
}

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort parameters
 */
export interface SortParams {
  field: string;
  direction: SortDirection;
}

/**
 * Filter operator
 */
export type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';

/**
 * Filter parameter
 */
export interface FilterParam {
  field: string;
  operator: FilterOperator;
  value: string | number | boolean | null;
}

/**
 * Query parameters for API requests
 */
export interface QueryParams {
  pagination?: PaginationParams;
  sort?: SortParams[];
  filters?: FilterParam[];
  search?: string;
  dateRange?: DateRange;
}

/**
 * Transaction status
 */
export type TransactionStatus = 'pending' | 'success' | 'error';

/**
 * Transaction details
 */
export interface Transaction {
  id: string;
  hash: string;
  type: string;
  status: TransactionStatus;
  timestamp: number;
  sender: string;
  recipient?: string;
  amount?: string;
  fee?: string;
}

/**
 * Chain information
 */
export interface ChainInfo {
  id: string;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  currency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}