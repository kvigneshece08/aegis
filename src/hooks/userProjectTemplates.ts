import {useGetProjectTemplatesQuery} from '../services/apiServices';

export const useApiGetProjectTemplates = (
  builderID: number,
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
  } = useGetProjectTemplatesQuery(
    {builderID, projectID, projectTaskID},
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
