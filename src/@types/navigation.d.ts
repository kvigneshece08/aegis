import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

export type StackNavigatorParamListType = {
  Home: undefined;
  Project: undefined;
  ProjectHome: undefined;
  ProjectDashboard: undefined;
  ProjectSelection: undefined;
  ProjectSelectionHome: undefined;
  ProjectDetails: undefined;
  AddEditSiteReport: {isEdit: boolean; reportID?: number};
  ViewSiteReport: undefined;
  PDFViewerScreen: undefined;
  AddEditDelayReport: {isEdit: boolean; delayID?: number};
  ViewDelayReport: undefined;
  Settings: undefined;
  AccountEnroll: undefined;
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
  ChangePassword: undefined;
  ProjectDashboard2: undefined;
  PDFViewer: {pdfPath: string};
  PdfPreview: undefined;
  ViewTemplatesAndFormsDashboard: undefined;
  ViewTemplatesAndForms: {paramName: string};
};

export type ScreensNavigationProps =
  NativeStackNavigationProp<StackNavigatorParamListType>;
