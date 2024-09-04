import {useGetUserProjectSiteReportQuery} from '../services/apiServices';

export const useApiGetUserProjectSiteReport = (
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
  } = useGetUserProjectSiteReportQuery(
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
