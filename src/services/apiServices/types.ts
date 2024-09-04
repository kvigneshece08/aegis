export interface userAuthRequestType {}

export interface userAuthResponseType {
  status: number;
  message: string;
  description: string;
  data: {
    user: User;
  };
}

export type AppDetailsResponseType = {
  id: number;
  appVersion: string;
  apiVersion: number;
  apiBuildVersion: number;
  supportedVersions: Array<string>;
  deprecatedVersions: Array<string>;
  authToken: string;
};

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  emailAddress: string;
  username: string;
}

export interface userLoginRequestType {
  username: string;
  password: string;
}

export interface userResponseType {
  status: number;
  message: string;
  description: string;
  data: {
    user: User;
    accessToken: string;
    resetFlag: boolean;
  };
}

export interface userRegistrationRequestType {
  firstName: string;
  lastName: string;
  emailAddress: string;
  username: string;
  password: string;
}

export interface forgotPasswordRequestType {
  emailAddress: string;
}

export interface forgotPasswordResponseType {
  status: number;
  message: string;
  description: string;
  data: {};
}

export interface resetPasswordRequestType {
  password: string;
}

export interface resetPasswordResponseType {
  status: number;
  message: string;
  description: string;
  data: {
    user: User;
    accessToken: string;
  };
}

export interface deactivateAccountRequestType {
  userId: number;
}

export interface deactivateAccountResponseType {
  status: number;
  message: string;
}

//Site Report
export interface siteReportResponseType {
  status: number;
  message: string;
  description: string;
  data: {
    siteReport: {
      report_id: number;
      report_code: string;
    };
  };
}

export interface siteReportRequestType {
  userID: number;
  projectID: number;
  projectTaskID: number;
  weatherCondition: any;
  workPerformed?: any;
  machineryAndEquipments?: any;
  overTimeDetails?: any;
  clientInstructionNotes?: any;
  siteMeetingNotes?: any;
  reportID?: number;
}

//Delete Site Report
export interface siteReportDeleteRequestType {
  userID: number;
  reportID: number;
}

export interface siteReportDeleteResponseType {
  status: number;
  message: string;
  description: string;
  data: {};
}

//Delete Site Report Document
export interface siteReportDocumentDeleteRequestType {
  reportID: number;
  documentID: number;
}

//Delete Site Report Document
export interface siteReportActivityDocumentDeleteRequestType {
  reportID: number;
  activityID: number;
}

export interface delayReportRequestType {
  userID: number;
  projectID: number;
  projectTaskID: number;
  registerCause: any;
  outcomeRemarks: any;
  generalRemarks?: any;
  delayID?: number;
}

//Delete Site Report
export interface delayReportDeleteRequestType {
  userID: number;
  delayID: number;
}

//Delete Delay Report Document
export interface delayReportDocumentDeleteRequestType {
  delayID: number;
  documentID: number;
}
