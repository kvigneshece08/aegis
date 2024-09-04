import {useGetUserDelayReportDetailQuery} from '../services/apiServices';

export const useApiGetDelayReportDetail = (
  userID: number,
  delayID: number,
  skipCollectiveRequest: boolean,
) => {
  const {
    data: collectiveDataReport,
    isLoading: isCollectiveDataReportLoading,
    isError: isCollectiveDataReportError,
    isSuccess: isCollectiveDataReportSuccess,
    error: collectiveDataReportError,
    refetch: collectiveDataRefetch,
  } = useGetUserDelayReportDetailQuery(
    {userID, delayID},
    {
      refetchOnMountOrArgChange: true,
      skip: skipCollectiveRequest,
    },
  );

  return {
    collectiveDataReport,
    isCollectiveDataReportLoading,
    isCollectiveDataReportError,
    isCollectiveDataReportSuccess,
    collectiveDataReportError,
    collectiveDataRefetch,
  };
};
