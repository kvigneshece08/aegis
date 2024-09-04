import {useGetSiteReportDetailsQuery} from '../services/apiServices';

export const useApiGetSiteReportDetails = (
  userID: number,
  reportID: number,
  skipCollectiveRequest: boolean,
) => {
  const {
    data: collectiveDataReport,
    isLoading: isCollectiveDataReportLoading,
    isError: isCollectiveDataReportError,
    isSuccess: isCollectiveDataReportSuccess,
    error: collectiveDataReportError,
    refetch: collectiveDataRefetch,
  } = useGetSiteReportDetailsQuery(
    {userID, reportID},
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
