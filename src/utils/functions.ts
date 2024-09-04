import moment from 'moment';
import {Image} from 'react-native';
import {SERVER_URL} from '../services/apiServices';

export const convertTimeFormat = (timeString: any) => {
  const timeArray = timeString.replace(/\s+/g, '').split(':'); // Remove whitespace and split the string
  let hours = parseInt(timeArray[0]);
  const minutes = parseInt(timeArray[1]);

  if (timeString?.toLowerCase()?.includes('pm') && hours !== 12) {
    hours += 12;
  }

  if (hours === 12 && timeString?.toLowerCase()?.includes('am')) {
    hours = 0;
  }

  const formattedTime = moment()
    .hours(hours)
    .minutes(minutes)
    .seconds(0)
    .format('HH:mm:ss');

  return formattedTime;
};

export const formatDate = (dateString: string) => {
  if (!dateString) {
    return '';
  }

  const date = moment(
    dateString,
    dateString.includes(' ') ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD',
  );

  if (dateString.includes(' ')) {
    // If the date string includes a time, format it as 'MM-DD-YYYY HH:mm:ss'
    return date.format('DD/MM/YYYY HH:mm:ss');
  } else {
    // Otherwise, format it as 'MM-DD-YYYY'
    return date.format('DD/MM/YYYY');
  }
};

export const convertTimestampToAMPM = (timestamp: any) => {
  const date = moment(timestamp);

  const hours = date.format('h');
  const minutes = date.format('mm');
  const ampm = date.format('A');

  const formattedTime = `${hours}:${minutes} ${ampm}`;

  return formattedTime;
};

export const readableTimestamp = (timestamp: any) => {
  return timestamp ? moment(timestamp).format('MMM D, YYYY h:mm A') : '-';
};

export const formatNumberZeroLeading = number => {
  return new Number(number).toLocaleString('en-US', {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
};

export const isObject = value => {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
};

export const isValidObjectKey = value => {
  return isObject(value) && Object.keys(value).length > 0;
};

export const isArray = value => Array.isArray(value);

export const isValidArrayKey = value => {
  return isArray(value) && value?.length > 0;
};

export const calculateRemainingDays = (dateVal, projectDetails) => {
  const today = moment();
  const calDate = moment(dateVal);
  const formatProjectDetails = JSON.parse(projectDetails);
  const workingDaysValue = formatProjectDetails?.project_timing?.working_days;
  // Ensure the end date is valid
  if (!calDate.isValid()) {
    return 'N/A';
  }

  // Calculate remaning upcoming days
  if (today.isAfter(calDate)) {
    return calDate.diff(today, 'days');
  }

  // Calculate remaining working days
  let remainingDays = 0;
  while (today.isBefore(calDate)) {
    if (workingDaysValue?.includes(today.format('dddd'))) {
      remainingDays++;
    }
    today.add(1, 'days');
  }

  return remainingDays;
};

export const capitalizeFirstLetter = str => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const isWeekend = date => {
  const dayOfWeek = date.day();
  return dayOfWeek === 0 || dayOfWeek === 6; // 0 is Sunday, 6 is Saturday
};

export const calculateSiteDelay = ({delayStart, delayEnds, projectItems}) => {
  const startMoment = moment(delayStart, 'YYYY-MM-DD HH:mm:ss');
  const endMoment = moment(delayEnds, 'YYYY-MM-DD HH:mm:ss');

  const projectTiming = projectItems?.project_timing || {};
  const workingDays = projectTiming.working_days || [];
  const workingShift = projectTiming.working_shift?.toLowerCase() || 'day'; // Default to day shift
  const workingHoursStart = projectTiming.working_hours_start || '09:00';
  const workingHoursEnd = projectTiming.working_hours_end || '17:00';
  let totalDelay = 0;

  if (workingHoursStart === '00:00' && workingHoursEnd === '23:59') {
    // If working hours are 24 hours a day
    while (startMoment.isBefore(endMoment)) {
      // Check if the current day falls within the working days
      if (workingDays.includes(startMoment.format('dddd'))) {
        const nextWorkingDay = moment(startMoment).add(1, 'day').startOf('day');
        const currentEnd = endMoment.isBefore(nextWorkingDay)
          ? endMoment
          : nextWorkingDay;
        if (currentEnd.isAfter(startMoment)) {
          totalDelay += currentEnd.diff(startMoment, 'milliseconds');
        }
      }
      startMoment.add(1, 'day').startOf('day');
    }
  } else {
    while (startMoment.isBefore(endMoment)) {
      const workingStartTime = moment(startMoment).set({
        hour: moment(workingHoursStart, 'HH:mm').hour(),
        minute: moment(workingHoursStart, 'HH:mm').minute(),
        second: 0,
        millisecond: 0,
      });

      const workingEndTime = moment(startMoment).set({
        hour: moment(workingHoursEnd, 'HH:mm').hour(),
        minute: moment(workingHoursEnd, 'HH:mm').minute(),
        second: 0,
        millisecond: 0,
      });

      if (workingShift === 'night') {
        // For night shift, consider the next day's end time
        const nextDayWorkingEndTime = moment(startMoment)
          .add(1, 'day')
          .set({
            hour: moment(workingHoursEnd, 'HH:mm').hour(),
            minute: moment(workingHoursEnd, 'HH:mm').minute(),
            second: 0,
            millisecond: 0,
          });

        if (startMoment.isBefore(workingStartTime)) {
          // If current time is before the night shift start time, set it to the start time
          startMoment.set({
            hour: workingStartTime.hour(),
            minute: workingStartTime.minute(),
            second: 0,
            millisecond: 0,
          });
        }

        const endOfWorkingDay = nextDayWorkingEndTime;

        const currentEnd = endMoment.isBefore(endOfWorkingDay)
          ? endMoment
          : endOfWorkingDay;

        if (workingDays.includes(startMoment.format('dddd'))) {
          if (currentEnd.isAfter(startMoment)) {
            totalDelay += currentEnd.diff(startMoment, 'milliseconds');
          }
        }

        startMoment.add(1, 'day').set({
          hour: moment(workingHoursStart, 'HH:mm').hour(),
          minute: moment(workingHoursStart, 'HH:mm').minute(),
          second: 0,
          millisecond: 0,
        });
      } else {
        if (startMoment.isBefore(workingStartTime)) {
          startMoment.set({
            hour: workingStartTime.hour(),
            minute: workingStartTime.minute(),
            second: workingStartTime.second(),
            millisecond: workingStartTime.millisecond(),
          });
        }

        const endOfWorkingDay = moment(startMoment).set({
          hour: workingEndTime.hour(),
          minute: workingEndTime.minute(),
          second: workingEndTime.second(),
          millisecond: workingEndTime.millisecond(),
        });

        const currentEnd = endMoment.isBefore(endOfWorkingDay)
          ? endMoment
          : endOfWorkingDay;

        if (workingDays.includes(startMoment.format('dddd'))) {
          if (currentEnd.isAfter(startMoment)) {
            totalDelay += currentEnd.diff(startMoment, 'milliseconds');
          }
        }

        startMoment.add(1, 'day').set({
          hour: moment(workingHoursStart, 'HH:mm').hour(),
          minute: moment(workingHoursStart, 'HH:mm').minute(),
          second: 0,
          millisecond: 0,
        });
      }
    }
  }

  const duration = moment.duration(totalDelay);
  const days = Math.floor(duration.asDays());
  const hours = duration.hours() + days * 24;
  const minutes = duration.minutes();

  return {hours, minutes};
};

export const formatTotalHoursLost = (hours, multiplier = 1) => {
  const multipliedHours = hours * multiplier;
  const multipliedDuration = moment.duration(multipliedHours, 'hours');
  const mHours = Math.floor(multipliedDuration.asHours());
  const mMinutes = multipliedDuration.minutes();
  return `${formatNumberZeroLeading(mHours)}:${formatNumberZeroLeading(
    mMinutes,
  )}`;
};

export const getProjectWorkingDays = (value: string[]) => {
  const formattedValue = JSON.parse(value);
  return formattedValue?.project_timing?.working_days.join(', ') || 'None';
};

export const convertTo12HourFormat = value => {
  const formattedValue = JSON.parse(value);
  const start = moment(
    formattedValue?.project_timing?.working_hours_start,
    'HH:mm',
  );
  const end = moment(
    formattedValue?.project_timing?.working_hours_end,
    'HH:mm',
  );

  const formattedStart = start.format('h A');
  const formattedEnd = end.format('h A');

  return `${formattedStart} - ${formattedEnd}`;
};

export const isImageType = fileName => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff'];
  const lowerCaseFileName = fileName && fileName?.toLowerCase();
  return imageExtensions?.some(ext => lowerCaseFileName?.endsWith(ext));
};

export const getLabelForValue = (obj, value) => {
  const activity = obj?.find(activity => activity.value === value);
  return activity ? activity.label : '';
};

export const includeServerPath = name => `${SERVER_URL}/${name}`;

export const getImageSize = async uri => {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({width, height}),
      error => reject(error),
    );
  });
};

export const roundToNearestPoint5 = num => {
  const floor = Math.floor(num);
  const diff = num - floor;

  if (diff < 0.25) {
    return floor;
  } else if (diff < 0.75) {
    return floor + 0.5;
  } else {
    return floor + 1;
  }
};

export const isArraysEqual = (arr1, arr2) => {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    let obj1 = arr1[i];
    let obj2 = arr2[i];

    if (JSON.stringify(obj1) !== JSON.stringify(obj2)) {
      return false;
    }
  }

  return true;
};
