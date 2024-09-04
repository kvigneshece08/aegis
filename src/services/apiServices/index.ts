import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {
  userResponseType,
  userLoginRequestType,
  userRegistrationRequestType,
  forgotPasswordRequestType,
  forgotPasswordResponseType,
  resetPasswordRequestType,
  resetPasswordResponseType,
  siteReportRequestType,
  siteReportResponseType,
  siteReportDeleteResponseType,
  siteReportDeleteRequestType,
  siteReportDocumentDeleteRequestType,
  delayReportDocumentDeleteRequestType,
  delayReportDeleteRequestType,
  siteReportActivityDocumentDeleteRequestType,
  deactivateAccountRequestType,
  deactivateAccountResponseType,
} from './types';
import type {RootState} from '../../redux/store';
import {IS_DEV, SECURE_KEY} from '../../constants/enumValues';
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import {setSecureValue, removeSecureValue} from '../../utils/keyChain';
import {store} from '../../redux/store';
import {setAuthDetails, removeAuthDetails} from '../../redux/authDetails';
export const SERVER_URL = IS_DEV
  ? 'https://aegisapi-dev.ioannoucoetus.com.au/'
  : 'https://aegisapi-dev.ioannoucoetus.com.au/';

const baseQuery = fetchBaseQuery({
  baseUrl: `${SERVER_URL}v1/`,
  mode: 'no-cors',
  prepareHeaders: (headers, {getState}) => {
    const token = (getState() as RootState)?.authDetails?.accessToken;
    // If we have a token set in state, let's assume that we should be passing it.
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },
  timeout: 500000,
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if (result.error && result.error.status === 401) {
    // try to get a new token
    const refreshResult: any = await baseQuery(
      'accounts/refreshToken',
      api,
      extraOptions,
    );
    if (refreshResult.data) {
      const accessToken: string = refreshResult?.data?.data?.accessToken;
      setSecureValue(SECURE_KEY.ACCESS_TOKEN, accessToken);
      store.dispatch(
        setAuthDetails({
          ...store?.getState()?.authDetails,
          accessToken,
        }),
      );
      result = await baseQuery(args, api, extraOptions);
    } else {
      removeSecureValue(SECURE_KEY.ACCESS_TOKEN);
      store.dispatch(removeAuthDetails());
    }
  }
  return result;
};

export const apiServices = createApi({
  baseQuery: baseQueryWithReauth,
  endpoints: builder => ({
    getUserAuth: builder.query({
      query: () => ({
        url: 'accounts/userAuthVerification',
      }),
      transformResponse: (response: any) => response,
    }),
    userLogin: builder.mutation<userResponseType, userLoginRequestType>({
      query: body => ({
        url: 'accounts/userLogin',
        method: 'POST',
        body,
      }),
    }),
    forgotPassword: builder.mutation<
      forgotPasswordResponseType,
      forgotPasswordRequestType
    >({
      query: body => ({
        url: 'accounts/forgotPassword',
        method: 'POST',
        body,
      }),
    }),
    resetPassword: builder.mutation<
      resetPasswordResponseType,
      resetPasswordRequestType
    >({
      query: body => ({
        url: 'accounts/resetPassword',
        method: 'POST',
        body,
      }),
    }),
    userRegistration: builder.mutation<
      userResponseType,
      userRegistrationRequestType
    >({
      query: body => ({
        url: 'accounts/userRegistration',
        method: 'POST',
        body,
      }),
    }),
    deactivateAccount: builder.mutation<
      deactivateAccountResponseType,
      deactivateAccountRequestType>({
      query: body => ({
        url: 'accounts/deactivateUser',
        method: 'POST',
        body,
      }),
    }),
    getUsersDetail: builder.query({
      query: () => ({
        url: 'collective/getUsersList',
      }),
      transformResponse: (response: any) => response?.data,
    }),
    getUserAssignedProjects: builder.query({
      query: userID => ({
        url: 'collective/getUserProjectListOpt',
        params: {userID},
      }),
      transformResponse: (response: any) => {
        if (response?.status !== 200) {
          return response?.data;
        }
        return response?.data;
      },
    }),
    addSiteReport: builder.mutation<
      siteReportResponseType,
      siteReportRequestType
    >({
      query: body => ({
        url: 'collective/addSiteReport',
        method: 'POST',
        body: body,
        formData: true,
      }),
    }),
    updateSiteReport: builder.mutation<
      siteReportResponseType,
      siteReportRequestType
    >({
      query: body => ({
        url: 'collective/updateSiteReport',
        method: 'POST',
        body,
      }),
    }),
    getUserProjectSiteReport: builder.query({
      query: ({userID, projectID, projectTaskID}) => ({
        url: 'collective/getUserSiteReports',
        params: {userID, projectID, projectTaskID},
      }),
      transformResponse: (response: any) => {
        if (response?.status !== 200) {
          return response?.data;
        }
        return response?.data;
      },
    }),
    deleteSiteReport: builder.mutation<
      siteReportDeleteResponseType,
      siteReportDeleteRequestType
    >({
      query: body => ({
        url: 'collective/deleteSiteReport',
        method: 'POST',
        body,
      }),
    }),
    getSiteReportDetails: builder.query({
      query: ({userID, reportID}) => ({
        url: 'collective/getProjectSiteReport',
        params: {userID, reportID},
      }),
      transformResponse: (response: any) => {
        if (response?.status !== 200) {
          return response?.data;
        }
        return response?.data;
      },
    }),
    deleteSiteReportDocument: builder.mutation<
      siteReportDeleteResponseType,
      siteReportDocumentDeleteRequestType
    >({
      query: body => ({
        url: 'collective/deleteSiteReportDocument',
        method: 'POST',
        body,
      }),
    }),
    deleteSiteReportActivityDocument: builder.mutation<
      siteReportDeleteResponseType,
      siteReportActivityDocumentDeleteRequestType
    >({
      query: body => ({
        url: 'collective/deleteSiteReportActivityDocument',
        method: 'POST',
        body,
      }),
    }),
    addDelayReport: builder.mutation<
      siteReportResponseType,
      siteReportRequestType
    >({
      query: body => ({
        url: 'collective/addDelayReport',
        method: 'POST',
        body: body,
        formData: true,
      }),
    }),
    updateDelayReport: builder.mutation<
      siteReportResponseType,
      siteReportRequestType
    >({
      query: body => ({
        url: 'collective/updateDelayReport',
        method: 'POST',
        body,
      }),
    }),
    getUserDelayReports: builder.query({
      query: ({userID, projectID, projectTaskID}) => ({
        url: 'collective/getUserDelayReports',
        params: {userID, projectID, projectTaskID},
      }),
      transformResponse: (response: any) => {
        if (response?.status !== 200) {
          return response?.data;
        }
        return response?.data;
      },
    }),
    deleteDelayReport: builder.mutation<
      siteReportDeleteResponseType,
      delayReportDeleteRequestType
    >({
      query: body => ({
        url: 'collective/deleteDelayReport',
        method: 'POST',
        body,
      }),
    }),
    getUserDelayReportDetail: builder.query({
      query: ({userID, delayID}) => ({
        url: 'collective/getUserDelayReport',
        params: {userID, delayID},
      }),
      transformResponse: (response: any) => {
        if (response?.status !== 200) {
          return response?.data;
        }
        return response?.data;
      },
    }),
    deleteDelayReportDocument: builder.mutation<
      siteReportDeleteResponseType,
      delayReportDocumentDeleteRequestType
    >({
      query: body => ({
        url: 'collective/deleteDelayReportDocument',
        method: 'POST',
        body,
      }),
    }),
    getBaselineProjects: builder.query({
      query: ({projectID, projectTaskID}) => ({
        url: 'collective/getBaselineProjects',
        params: {projectID, projectTaskID},
      }),
      transformResponse: (response: any) => {
        if (response?.status !== 200) {
          return response?.data;
        }
        return response?.data;
      },
    }),
    getProjectDashboardDetail: builder.query({
      query: ({userID}) => ({
        url: 'collective/getProjectDashboardList',
        params: {userID},
      }),
      transformResponse: (response: any) => {
        if (response?.status !== 200) {
          return response?.data;
        }
        return response?.data;
      },
    }),
    getProjectTemplates: builder.query({
      query: ({builderID, projectID, projectTaskID}) => ({
        url: 'collective/getProjectTemplates',
        params: {builderID, projectID, projectTaskID},
      }),
      transformResponse: (response: any) => {
        if (response?.status !== 200) {
          return response?.data;
        }
        return response?.data;
      },
    }),
  }),
});

export const {
  useGetUserAuthQuery,
  useUserLoginMutation,
  useUserRegistrationMutation,
  useGetUsersDetailQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useDeactivateAccountMutation,
  useGetUserAssignedProjectsQuery,
  useAddSiteReportMutation,
  useGetUserProjectSiteReportQuery,
  useDeleteSiteReportMutation,
  useGetSiteReportDetailsQuery,
  useUpdateSiteReportMutation,
  useDeleteSiteReportDocumentMutation,
  useDeleteSiteReportActivityDocumentMutation,
  useAddDelayReportMutation,
  useDeleteDelayReportMutation,
  useGetUserDelayReportsQuery,
  useGetUserDelayReportDetailQuery,
  useUpdateDelayReportMutation,
  useDeleteDelayReportDocumentMutation,
  useGetBaselineProjectsQuery,
  useGetProjectDashboardDetailQuery,
  useGetProjectTemplatesQuery,
} = apiServices;
