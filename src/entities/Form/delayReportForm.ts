import type {DefaultValues} from 'react-hook-form';
export type FormDataDelayReport = {
  generalRemarks?: string;
  registerCause: any;
  outcomeRemarks: any;
  delayFiles?: any;
  delayCameraFiles?: any;
};

export const FormDataDelayReportValue: DefaultValues<FormDataDelayReport> = {
  registerCause: {
    type: null,
    dateOfStart: null,
    timeOfStart: null,
    shiftStart: null,
    dateOfFinish: null,
    timeOfFinish: null,
    shiftFinish: null,
    affectedEmp: null,
    totalHoursLost: null,
  },
  outcomeRemarks: {
    rootCause: null,
    delayOutcome: null,
    mitigationStrategy: null,
    extensionOfTime: null,
    criticalPath: null,
  },
  delayFiles: null,
  delayCameraFiles: null,
  generalRemarks: '',
};
