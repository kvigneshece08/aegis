import {useGetProjectDashboardDetailQuery} from '../services/apiServices';

export const useApiGetProjectDashboard = (userID: number) => {
  const {
    data: collectiveData,
    isLoading: isCollectiveDataLoading,
    isError: isCollectiveDataError,
    isSuccess: isCollectiveDataSuccess,
    error: collectiveDataError,
  } = useGetProjectDashboardDetailQuery(
    {userID},
    {
      refetchOnMountOrArgChange: true,
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
