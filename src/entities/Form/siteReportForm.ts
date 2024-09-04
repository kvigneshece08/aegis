import type {DefaultValues} from 'react-hook-form';
export type FormDataSiteReport = {
  weatherCondition: any;
  subContractors?: any;
  workPerformed?: any;
  machineryAndEquipments?: any;
  overTimeDetails?: any;
  siteActivityFiles?: any;
  siteActivityCameraFiles?: any;
  siteFiles?: any;
  siteCameraFiles?: any;
  clientInstructionNotes?: string;
  siteMeetingNotes?: string;
  signature?: any;
};

export const FormDataSiteReportValue: DefaultValues<FormDataSiteReport> = {
  weatherCondition: {
    tempMin: null,
    tempMax: null,
    climateOpt: null,
    windSpeed: null,
    humidity: null,
    precipitation: null,
    weatherComments: null,
    forecast: [],
  },
  subContractors: [
    {
      contractorCompany: '',
      contractorFunction: '',
      contractorTotalEmp: null,
      contractorTotalWorkingHrs: null,
      contractorNotes: '',
    },
  ],
  workPerformed: [
    {
      activityName: '',
      workerCount: '',
      activityType: 'other',
      variationNumber: '',
      docketNumber: '',
      variationRemarks: '',
      workNotes: '',
    },
  ],
  machineryAndEquipments: [
    {
      machineryAndEquipmentName: '',
      machineryAndEquipmentNumber: '',
      machineryAndEquipmentLocationUsed: '',
      machineryAndEquipmentNotes: '',
    },
  ],
  overTimeDetails: [
    {
      overTimeActivityName: '',
      overTimeTotalWorker: '',
      timeOfStart: '',
      timeOfFinish: '',
      overTimeTotalWorkingHrs: '',
      overTimeNotes: '',
    },
  ],
  siteActivityFiles: null,
  siteActivityCameraFiles: null,
  siteFiles: null,
  siteCameraFiles: null,
  clientInstructionNotes: '',
  siteMeetingNotes: '',
  signature: {
    value: '',
    name: '',
    designation: '',
  },
};
