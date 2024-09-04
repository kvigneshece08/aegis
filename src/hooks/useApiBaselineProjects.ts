import {useGetBaselineProjectsQuery} from '../services/apiServices';

export const useApiGetBaselineProjects = (
  projectID: number,
  projectTaskID: number,
  skip: boolean,
) => {
  const {
    data: collectiveBaselineData,
    isLoading: isCollectiveBaselineDataLoading,
    isError: isCollectiveBaselineDataError,
    isSuccess: isCollectiveBaselineDataSuccess,
    error: collectiveBaselineDataError,
    refetch: collectiveBaselineDataRefetch,
  } = useGetBaselineProjectsQuery(
    {projectID, projectTaskID},
    {
      refetchOnMountOrArgChange: false,
      skip,
    },
  );

  return {
    collectiveBaselineData,
    isCollectiveBaselineDataLoading,
    isCollectiveBaselineDataError,
    isCollectiveBaselineDataSuccess,
    collectiveBaselineDataError,
    collectiveBaselineDataRefetch,
  };
};
