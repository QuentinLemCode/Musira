interface ResponseError {
  response: {
    status: number;
    data: Record<string, string>;
  };
}

export const isResponseError = (error: unknown): error is ResponseError => {
  return (
    typeof error === 'object' &&
    error != null &&
    'response' in error &&
    typeof error.response === 'object' &&
    error.response != null &&
    'status' in error.response &&
    typeof error.response.status === 'number' &&
    'data' in error.response &&
    typeof error.response.data === 'object' &&
    error.response.data != null
  );
};
