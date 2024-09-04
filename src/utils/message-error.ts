export const AccountErrMsg = {
  FIRSTNAME: {
    TEXT_REQUIRED: 'The first name field must be filled in',
  },
  LASTNAME: {
    TEXT_REQUIRED: 'The last name field must be filled in',
  },
  EMAIL: {
    TEXT_REQUIRED: 'Email field must be filled in',
    INVALID_EMAIL: 'Provide a valid email',
  },
  USERNAME: {
    TEXT_REQUIRED: 'The username field must be filled in',
    MIN: 'Username must be at least 5 characters long',
  },
  PASSWORD: {
    TEXT_REQUIRED: 'Password field must be filled',
    SPECIAL_CHARACTER: 'Must contain a special character',
    CAPITAL_LETTER: 'Must contain a capital letter',
    MIN: 'Password must be at least 8 characters long',
  },
};

export const ProjectSelectionErrMsg = {
  BUILDER_OPT: {
    TEXT_REQUIRED: 'Select the builder option',
  },
  PROJECT_OPT: {
    TEXT_REQUIRED: 'Select the project option',
  },
  TASK_OPT: {
    TEXT_REQUIRED: 'Select the task option',
  },
};

export const AddSiteErrMsg = {
  WEATHER_FIELDS: {
    TIMES_OF_THE_DAY: {
      TEXT_REQUIRED: 'Select times of the day options',
    },
    MIN_TEMP: {
      TEXT_REQUIRED: 'Temperature min. field must be filled in',
    },
    MAX_TEMP: {
      TEXT_REQUIRED: 'Temperature max. field must be filled in',
    },
    CLIMATE: {
      TEXT_REQUIRED: 'Select climate options',
    },
    WIND: {
      TEXT_REQUIRED: 'Select wind options',
    },
  },
  SUB_CONTRACTOR_FIELDS: {
    COMPANY: {
      TEXT_REQUIRED: 'Company field must be filled in',
    },
    FUNCTIONS: {
      TEXT_REQUIRED: 'Function field must be filled in',
    },
    TOTAL_EMP: {
      TEXT_REQUIRED: 'Total workers field must be filled in',
    },
    TOTAL_HRS: {
      TEXT_REQUIRED: 'Total hours field must be filled in',
    },
  },
  WORKPERFORMED_FIELDS: {
    ACTIVITY_NAME: {
      TEXT_REQUIRED: 'Activity name field must be filled in',
    },
    ACTIVITY_TYPE: {
      TEXT_REQUIRED: 'Activity type field must be filled in',
    },
    WORKERS_COUNT: {
      TEXT_REQUIRED: 'Total workers field must be filled in',
    },
  },
  MACHINERY_AND_EQUIPMENT_FIELDS: {
    NAME: {
      TEXT_REQUIRED: 'Name field must be filled in',
    },
    TOTAL_NO: {
      TEXT_REQUIRED: 'Total number field must be filled in',
    },
    LOCATION_USED: {
      TEXT_REQUIRED: 'Location field must be filled in',
    },
  },
  OVER_TIME_DETAILS_FIELDS: {
    ACTIVITY_NAME: {
      TEXT_REQUIRED: 'Activity name field must be filled in',
    },
    TOTAL_WORKERS: {
      TEXT_REQUIRED: 'Total workers field must be filled in',
    },
    TIME_OF_START: {
      TEXT_REQUIRED: 'Time of start field must be filled in',
    },
    TIME_OF_FINISH: {
      TEXT_REQUIRED: 'Time of finish field must be filled in',
    },
    TOTAL_HRS: {
      TEXT_REQUIRED: 'Total hours field must be filled in',
    },
  },
  TEMPLATE_FIELDS: {
    NAME: {
      TEXT_REQUIRED: 'Template name field must be filled in',
      TEMPLATE_EXISTS: 'Template name already exists',
    },
  },
};

export const AddDelayReportErrMsg = {
  DATE_START: {
    FORMAT_DATE: {
      TEXT_REQUIRED: 'Invalid date format. Use YYYY-MM-DD',
    },
  },
};
