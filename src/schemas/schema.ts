import * as yup from 'yup';
import moment from 'moment';

import {
  REGEX_DATEFORMAT,
  REGEX_EMAIL,
  REGEX_SPECIAL_CHARACTER,
  REGEX_UPPERCASE,
} from '../utils/regex';
import {
  AccountErrMsg,
  AddSiteErrMsg,
  ProjectSelectionErrMsg,
  AddDelayReportErrMsg,
} from '../utils/message-error';

export const sigInSchema = yup.object().shape({
  username: yup
    .string()
    .required(AccountErrMsg.USERNAME.TEXT_REQUIRED)
    .min(5, AccountErrMsg.USERNAME.MIN)
    .trim(),
  password: yup.string().required(AccountErrMsg.PASSWORD.TEXT_REQUIRED).trim(),
});

export const signUpSchema = yup.object({
  firstName: yup
    .string()
    .required(AccountErrMsg.FIRSTNAME.TEXT_REQUIRED)
    .trim(),
  lastName: yup.string().required(AccountErrMsg.LASTNAME.TEXT_REQUIRED).trim(),
  username: yup
    .string()
    .required(AccountErrMsg.USERNAME.TEXT_REQUIRED)
    .min(5, AccountErrMsg.USERNAME.MIN)
    .trim(),
  emailAddress: yup
    .string()
    .required(AccountErrMsg.EMAIL.TEXT_REQUIRED)
    .matches(REGEX_EMAIL, AccountErrMsg.EMAIL.INVALID_EMAIL)
    .trim(),
  password: yup
    .string()
    .required(AccountErrMsg.PASSWORD.TEXT_REQUIRED)
    .min(8, AccountErrMsg.PASSWORD.MIN)
    .matches(REGEX_UPPERCASE, AccountErrMsg.PASSWORD.CAPITAL_LETTER)
    .matches(REGEX_SPECIAL_CHARACTER, AccountErrMsg.PASSWORD.SPECIAL_CHARACTER)
    .trim(),
});

export const forgotPasswordSchema = yup.object({
  emailAddress: yup
    .string()
    .required(AccountErrMsg.EMAIL.TEXT_REQUIRED)
    .matches(REGEX_EMAIL, AccountErrMsg.EMAIL.INVALID_EMAIL)
    .trim(),
});

export const resetPasswordSchema = yup.object().shape({
  password: yup
    .string()
    .required(AccountErrMsg.PASSWORD.TEXT_REQUIRED)
    .min(8, AccountErrMsg.PASSWORD.MIN)
    .matches(REGEX_UPPERCASE, AccountErrMsg.PASSWORD.CAPITAL_LETTER)
    .matches(REGEX_SPECIAL_CHARACTER, AccountErrMsg.PASSWORD.SPECIAL_CHARACTER)
    .trim(),
});

export const changePasswordSchema = yup.object().shape({
  newPassword: yup
    .string()
    .required(AccountErrMsg.PASSWORD.TEXT_REQUIRED)
    .min(8, AccountErrMsg.PASSWORD.MIN)
    .matches(REGEX_UPPERCASE, AccountErrMsg.PASSWORD.CAPITAL_LETTER)
    .matches(REGEX_SPECIAL_CHARACTER, AccountErrMsg.PASSWORD.SPECIAL_CHARACTER)
    .trim(),
  confirmPassword: yup
    .string()
    .required(AccountErrMsg.PASSWORD.TEXT_REQUIRED)
    .min(8, AccountErrMsg.PASSWORD.MIN)
    .matches(REGEX_UPPERCASE, AccountErrMsg.PASSWORD.CAPITAL_LETTER)
    .matches(REGEX_SPECIAL_CHARACTER, AccountErrMsg.PASSWORD.SPECIAL_CHARACTER)
    .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
    .trim(), 
});

export const projectSelectionSchema = yup.object().shape({
  builderOpt: yup
    .string()
    .required(ProjectSelectionErrMsg.BUILDER_OPT.TEXT_REQUIRED)
    .trim(),
  projectOpt: yup
    .string()
    .required(ProjectSelectionErrMsg.PROJECT_OPT.TEXT_REQUIRED),
  taskOpt: yup.string().required(ProjectSelectionErrMsg.TASK_OPT.TEXT_REQUIRED),
});

export const addSiteReportSchema = yup.object().shape({
  weatherCondition: yup.object().shape({
    tempMin: yup
      .number()
      .typeError('Must be numeric.')
      .integer('Must be numeric.')
      .required(AddSiteErrMsg.WEATHER_FIELDS.MIN_TEMP.TEXT_REQUIRED),
    tempMax: yup
      .number()
      .typeError('Must be numeric.')
      .integer('Must be numeric.')
      .required(AddSiteErrMsg.WEATHER_FIELDS.MAX_TEMP.TEXT_REQUIRED),
    climateOpt: yup
      .string()
      .required(AddSiteErrMsg.WEATHER_FIELDS.CLIMATE.TEXT_REQUIRED)
      .trim(),
    windSpeed: yup
      .string()
      .required(AddSiteErrMsg.WEATHER_FIELDS.CLIMATE.TEXT_REQUIRED)
      .trim(),
    humidity: yup
      .number()
      .typeError('Must be numeric.')
      .integer('Must be numeric.')
      .required(AddSiteErrMsg.WEATHER_FIELDS.MAX_TEMP.TEXT_REQUIRED),
    precipitation: yup
      .number()
      .typeError('Must be numeric.')
      .integer('Must be numeric.')
      .required(AddSiteErrMsg.WEATHER_FIELDS.MAX_TEMP.TEXT_REQUIRED),
    forecast: yup.array(),
  }),
  subContractors: yup.array().of(
    yup
      .object()
      .shape({
        contractorCompany: yup
          .string()
          .required(AddSiteErrMsg.SUB_CONTRACTOR_FIELDS.COMPANY.TEXT_REQUIRED),
        contractorFunction: yup
          .string()
          .required(
            AddSiteErrMsg.SUB_CONTRACTOR_FIELDS.FUNCTIONS.TEXT_REQUIRED,
          ),
        contractorTotalEmp: yup
          .number()
          .typeError('Must be numeric.')
          .integer('Must be numeric.')
          .required(
            AddSiteErrMsg.SUB_CONTRACTOR_FIELDS.TOTAL_EMP.TEXT_REQUIRED,
          ),
        contractorTotalWorkingHrs: yup
          .number()
          .typeError('Must be numeric.')
          .integer('Must be numeric.')
          .required(
            AddSiteErrMsg.SUB_CONTRACTOR_FIELDS.TOTAL_HRS.TEXT_REQUIRED,
          ),
        contractorNotes: yup.string().nullable().trim(),
      })
      .required(),
  ),
  workPerformed: yup.array().of(
    yup
      .object()
      .shape({
        activityName: yup
          .string()
          .required(
            AddSiteErrMsg.WORKPERFORMED_FIELDS.ACTIVITY_NAME.TEXT_REQUIRED,
          ),
        workerCount: yup
          .number()
          .typeError('Must be numeric.')
          .integer('Must be numeric.')
          .required(
            AddSiteErrMsg.WORKPERFORMED_FIELDS.WORKERS_COUNT.TEXT_REQUIRED,
          ),
        activityType: yup
          .string()
          .required(
            AddSiteErrMsg.WORKPERFORMED_FIELDS.ACTIVITY_TYPE.TEXT_REQUIRED,
          ),
        variationNumber: yup.string().when('activityType', {
          is: (activityType: any) =>
            !!activityType && activityType === 'variation_works', // Apply validation only if timeOfFinish is present
          then: () => yup.string().required('Variation number is required'),
          otherwise: () => yup.string().nullable().trim(),
        }),
        variationRemarks: yup.string().when('activityType', {
          is: (activityType: any) =>
            !!activityType && activityType === 'variation_works',
          then: () => yup.string().required('Variation remark is required'),
          otherwise: () => yup.string().nullable().trim(),
        }),
        docketNumber: yup.string().when('activityType', {
          is: (activityType: any) =>
            !!activityType && activityType === 'day_works',
          then: () => yup.string().required('Docket number is required'),
          otherwise: () => yup.string().nullable().trim(),
        }),
        workNotes: yup.string().nullable().trim(),
      })
      .required(),
  ),
  machineryAndEquipments: yup.array().of(
    yup
      .object()
      .shape({
        machineryAndEquipmentName: yup
          .string()
          .required(
            AddSiteErrMsg.MACHINERY_AND_EQUIPMENT_FIELDS.NAME.TEXT_REQUIRED,
          )
          .trim(),
        machineryAndEquipmentNumber: yup
          .number()
          .typeError('Must be numeric.')
          .integer('Must be numeric.')
          .required(
            AddSiteErrMsg.MACHINERY_AND_EQUIPMENT_FIELDS.TOTAL_NO.TEXT_REQUIRED,
          ),
        machineryAndEquipmentLocationUsed: yup
          .string()
          .required(
            AddSiteErrMsg.MACHINERY_AND_EQUIPMENT_FIELDS.LOCATION_USED
              .TEXT_REQUIRED,
          )
          .trim(),
        machineryAndEquipmentNotes: yup.string().nullable().trim(),
      })
      .required(),
  ),
  overTimeDetails: yup.array().of(
    yup
      .object()
      .shape({
        overTimeActivityName: yup
          .string()
          .required(
            AddSiteErrMsg.OVER_TIME_DETAILS_FIELDS.ACTIVITY_NAME.TEXT_REQUIRED,
          ),
        overTimeTotalWorker: yup
          .number()
          .typeError('Must be numeric.')
          .integer('Must be numeric.')
          .required(
            AddSiteErrMsg.OVER_TIME_DETAILS_FIELDS.TOTAL_WORKERS.TEXT_REQUIRED,
          ),
        timeOfStart: yup
          .string()
          .required(
            AddSiteErrMsg.OVER_TIME_DETAILS_FIELDS.TIME_OF_START.TEXT_REQUIRED,
          ),
        timeOfFinish: yup.string().nullable().trim(),
        overTimeTotalWorkingHrs: yup
          .number()
          .typeError('Must be numeric.')
          .integer('Must be numeric.')
          .required(
            AddSiteErrMsg.OVER_TIME_DETAILS_FIELDS.TOTAL_HRS.TEXT_REQUIRED,
          ),
        overTimeNotes: yup.string().nullable().trim(),
      })
      .required(),
  ),
  clientInstructionNotes: yup.string().nullable().trim(),
  siteMeetingNotes: yup.string().nullable().trim(),
  signature: yup.object().shape({
    name: yup.string().nullable().trim(),
    designation: yup.string().nullable().trim(),
    value: yup.string().nullable().trim(),
  }),
});

export const addDelayReportSchema = yup.object().shape({
  registerCause: yup.object().shape({
    type: yup.string().required('Type is required'),
    dateOfStart: yup
      .string()
      .matches(
        REGEX_DATEFORMAT,
        AddDelayReportErrMsg.DATE_START.FORMAT_DATE.TEXT_REQUIRED,
      )
      .test(
        'is-not-future-datetime',
        'Future date and time cannot be selected',
        function () {
          const { dateOfStart, timeOfStart } = this.parent;
          const dateTimeString = `${dateOfStart}T${timeOfStart}`;
          const dateTime = moment(dateTimeString, 'YYYY-MM-DD h:mm A');
          return !dateTime || dateTime.isSameOrBefore(moment(new Date()));
        }
      )
      .required('Date is required!!!!'),
    timeOfStart: yup.string().required('Time is required'),
    shiftStart: yup.string().required('Shift is required'),
    shiftFinish: yup.string().required('Shift is required'),
    dateOfFinish: yup.string().when('shiftFinish', {
      is: (shiftFinish: any) => !!shiftFinish && shiftFinish !== 'OnGoing', // Apply validation only if timeOfFinish is present
      then: () =>
        yup
          .string()
          .matches(
            REGEX_DATEFORMAT,
            AddDelayReportErrMsg.DATE_START.FORMAT_DATE.TEXT_REQUIRED,
          )
          .test(
            'is-not-future-datetime',
            'Future date and time cannot be selected',
            function () {
              const { dateOfFinish, timeOfFinish } = this.parent;
              const dateTimeString = `${dateOfFinish}T${timeOfFinish}`;
              const dateTime = moment(dateTimeString, 'YYYY-MM-DD h:mm A');
              return !dateTime || dateTime.isSameOrBefore(moment(new Date()));
            }
          )
          .required('Date is required'),
      otherwise: () => yup.string().nullable(),
    }),
    timeOfFinish: yup.string().when('shiftFinish', {
      is: (shiftFinish: any) => !!shiftFinish && shiftFinish !== 'OnGoing', // Apply validation only if timeOfFinish is present
      then: () => yup.string().required('Time is required'),
      otherwise: () => yup.string().nullable(),
    }),
    affectedEmp: yup
      .number()
      .typeError('Must be numeric.')
      .integer('Must be numeric.')
      .required('Total Emp. is required'),
  }),
  outcomeRemarks: yup.object().shape({
    rootCause: yup.string().required('Cause of Delay is required'),
    delayOutcome: yup.string().nullable().trim(),
    mitigationStrategy: yup.string().nullable().trim(),
    extensionOfTime: yup.string().required('Extension of Time is required'),
    criticalPath: yup.string().when('extensionOfTime', {
      is: (extensionOfTime: any) => extensionOfTime === 'Yes',
      then: () => yup.string().required('Critical Path is required'),
      otherwise: () => yup.string().nullable(),
    }),
  }),
  generalRemarks: yup.string().nullable().trim(),
});

export const templateSchema = templates =>
  yup.object({
    name: yup
      .string()
      .required(AddSiteErrMsg.TEMPLATE_FIELDS.NAME.TEXT_REQUIRED)
      .trim()
      .test(
        'not-in-list',
        AddSiteErrMsg.TEMPLATE_FIELDS.NAME.TEMPLATE_EXISTS,
        value => !templates.find(item => item.name === value),
      ),
  });
