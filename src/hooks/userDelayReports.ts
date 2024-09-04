import {useGetUserDelayReportsQuery} from '../services/apiServices';

export const useApiGetUserDelayReports = (
  userID: number,
  projectID: number,
  projectTaskID: number,
  skip: boolean,
) => {
  const {
    data: collectiveData,
    isLoading: isCollectiveDataLoading,
    isError: isCollectiveDataError,
    isSuccess: isCollectiveDataSuccess,
    error: collectiveDataError,
  } = useGetUserDelayReportsQuery(
    {userID, projectID, projectTaskID},
    {
      refetchOnMountOrArgChange: true,
      skip,
    },
  );

  return {
    collectiveData,
    isCollectiveDataLoading,
    isCollectiveDataError,
    isCollectiveDataSuccess,
    collectiveDataError,
  };
};
