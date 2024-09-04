import {useGetUserAuthQuery} from '../services/apiServices';

export const useApiGetAuthVerification = (skipAuthRequest: boolean) => {
  const {
    data: authData,
    isError: isAuthDataError,
    isSuccess: isAuthDataSuccess,
    error: authDataError,
    refetch: authDataRefetch,
  } = useGetUserAuthQuery(
    {},
    {
      refetchOnMountOrArgChange: false,
      skip: skipAuthRequest,
    },
  );

  return {
    authData,
    isAuthDataError,
    isAuthDataSuccess,
    authDataError,
    authDataRefetch,
  };
};
