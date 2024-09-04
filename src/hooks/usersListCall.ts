import {useGetUsersDetailQuery} from '../services/apiServices';

export const useApiGetCollectiveUsers = (skipCollectiveRequest: boolean) => {
  const {
    data: collectiveData,
    isError: isCollectiveDataError,
    isSuccess: isCollectiveDataSuccess,
    error: collectiveDataError,
    refetch: collectiveDataRefetch,
  } = useGetUsersDetailQuery(
    {},
    {
      refetchOnMountOrArgChange: false,
      skip: skipCollectiveRequest,
    },
  );

  return {
    collectiveData,
    isCollectiveDataError,
    isCollectiveDataSuccess,
    collectiveDataError,
    collectiveDataRefetch,
  };
};
