export type Result<T, E> =
  | { success: true; value: T }
  | { success: false; error: E }

export const success = <T, E = unknown>(value: T): Result<T, E> => ({
  success: true,
  value,
});

export const failure = <E, T = unknown>(error: E): Result<T, E> => ({
  success: false,
  error,
});