import {useGetUserAssignedProjectsQuery} from '../services/apiServices';

export const useApiGetUserAssignedProjects = (userID: number) => {
  const {
    data: collectiveData,
    isLoading: isCollectiveDataLoading,
    isError: isCollectiveDataError,
    isSuccess: isCollectiveDataSuccess,
    error: collectiveDataError,
  } = useGetUserAssignedProjectsQuery(userID, {
    refetchOnMountOrArgChange: false,
  });

  return {
    collectiveData,
    isCollectiveDataLoading,
    isCollectiveDataError,
    isCollectiveDataSuccess,
    collectiveDataError,
  };
};
