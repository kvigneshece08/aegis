import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  TextInput as RNTextInput,
  View,
  Pressable,
  Dimensions,
} from 'react-native';
import {ItemSpaceTen} from '../../../themes';
import {useNavigation} from '@react-navigation/native';
import {ScreensNavigationProps} from '../../../@types/navigation';
import {
  Surface,
  Card,
  Text,
  Avatar,
  ActivityIndicator,
  List,
  IconButton,
  Portal,
  Snackbar,
  TextInput,
} from 'react-native-paper';
import {MultistepFlow, Step} from '../../../components/MultistepFlow';
import {InputField} from '../../../components/InputField/InputField';
import {useForm, Controller} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import {DropDown} from '../../../components/DropDown';
import {theme} from '../../../themes';
import {SpaceSeparator} from '../../../components/SpaceSeparator/SpaceSeparator';
import {Button} from '../../../components/Button';
import {addDelayReportSchema} from '../../../schemas/schema';
import {
  SHIFT_TYPE,
  DELAY_TYPE,
  PREPOPULATED_CAUSEDELAY_TYPE,
  YES_NO_OPTION,
} from '../../../utils/constants';
import {useImmer} from 'use-immer';
import {RowSpaceBtwStyle} from '../../../themes';
import {useAppSelector} from '../../../hooks/reduxHooks';
import {
  useAddDelayReportMutation,
  useDeleteDelayReportDocumentMutation,
  useUpdateDelayReportMutation,
} from '../../../services/apiServices';
import {STATUS_HTTP_CODE, STATUS_MESSAGE} from '../../../constants/enumValues';
import {darkColor, fonts} from '../../../themes';
import {FontsStyle} from '../../../themes';
import {useApiGetDelayReportDetail} from '../../../hooks/userDelayReportDetail';
import DocumentPicker from 'react-native-document-picker';
import {ConfirmationDialog} from '../../../components/PromiseDialog';
import {
  FormDataDelayReport,
  FormDataDelayReportValue,
} from '../../../entities/Form/delayReportForm';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {
  convertTimeFormat,
  convertTimestampToAMPM,
  formatTotalHoursLost,
} from '../../../utils/functions';
import moment from 'moment';
import {useMandatoryPermission} from '../../../hooks/usePermission';
import {PermissionType} from '../../../hooks/usePermission';
import {PermissionDialog} from '../../../components/CameraModal/PermissionDialog';
import {CameraModal} from '../../../components/CameraModal';
import ImageView from 'react-native-image-viewing';
import ImageMarker from 'react-native-image-marker';
import Geolocation from 'react-native-geolocation-service';
import {delayNotificationApi} from '../../../utils/pushNotificationUtil';
import {isImageType} from '../../../utils/functions';
import {splitTextIntoLines} from '../../../utils/textUtils';
import {getAddress} from '../../../utils/getAddress';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

const AddEditDelayReport = ({route}: {route: any}) => {
  const {isEdit, delayID} = route.params || {};
  const authDetails = useAppSelector(state => state?.authDetails);
  const {navigate, goBack, setOptions, addListener, dispatch} =
    useNavigation<ScreensNavigationProps>();

  const selectedProject = useAppSelector(
    state => state?.assignedProjects?.currentProject,
  );
  const userID = useAppSelector(state => state?.authDetails?.user?.id);
  const [showTypeDropDown, setShowTypeDropDown] = useState(false);
  const [showStartShiftDropDown, setShowStartShiftDropDown] = useState(false);
  const [showFinishShiftDropDown, setShowFinishShiftDropDown] = useState(false);
  const [showExtensionOfTimeDropDown, setShowExtensionOfTimeDropDown] =
    useState(false);
  const [showCriticalPathDropDown, setShowCriticalPathDropDown] =
    useState(false);
  const [delayError, setDelayError] = useState<boolean>(false);
  const [delayErrorMsg, setDelayErrorMsg] = useState<string>('');
  const [successRecord, setSuccessRecord] = useState(false);
  const [selectedDelayFiles, setSelectedDelayFiles] = useState([]);
  const [exitingDelayFiles, setExitingDelayFiles] = useState([]);
  const [selectedDelayCameraFiles, setSelectedDelayCameraFiles] = useState([]);
  const [reportDialog, setReportDialog] = useState(false);
  const [reportDescription, setReportDescription] = useState('');
  const [deleteDocuDialog, setDeleteDocuDialog] = useState(false);
  const [delayToast, setDelayToast] = useState<boolean>(false);
  const [delayToastMessage, setDelayToastMessage] = useState<string>('');
  const [currentReportDocuID, setCurrentReportDocuID] = useState<number>(0);
  const [hoursCalculateMsg, setHoursCalculateMsg] = useState<any>(0);

  const [delayReportVal, setDelayReportVal] = useImmer({
    registerCause: {
      type: '',
      shiftStart: '',
      shiftFinish: '',
    },
    outcomeRemarks: {
      extensionOfTime: '',
      criticalPath: '',
    },
  });

  const [addDelayReport] = useAddDelayReportMutation();
  const [updateDelayReport] = useUpdateDelayReportMutation();
  const [deleteDelayReportDocument] = useDeleteDelayReportDocumentMutation();
  const {isCollectiveDataReportLoading, collectiveDataReport} =
    useApiGetDelayReportDetail(
      authDetails?.user?.id ?? 0,
      delayID ?? 0,
      !authDetails?.user?.id || !delayID || !isEdit,
    );

  const [location, setLocation] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [address, setAddress] = useState('');
  const [cameraImageView, setCameraImageView] = useState(false);
  const [cameraImageItem, setCameraImageItem] = useState([]);
  const [deviceLocationDialog, setDeviceLocationDialog] = useState(false);
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraOrientation, setCameraOrientation] = useState('portrait');

  //Date and Time
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [currentPickerField, setCurrentPickerField] = useState('');

  const [isSelectionModeEnabled, setIsSelectionModeEnabled] =
    React.useState(true);
  const [showExitDialog, setShowExitDialog] = React.useState(false);

  React.useEffect(() => {
    const removeListener = addListener('beforeRemove', e => {
      if (isSelectionModeEnabled) {
        // If selection mode is enabled, prevent default behavior
        e.preventDefault();
        setShowExitDialog(true); // Show exit confirmation dialog
      } else {
        // If selection mode is not enabled, proceed with navigation
        dispatch(e.data.action);
      }
    });

    return () => removeListener(); // Clean up the listener on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSelectionModeEnabled]);

  const showDatePicker = field => {
    // Keyboard.dismiss();
    setDatePickerVisibility(true);
    setCurrentPickerField(field);
  };

  const showTimePicker = field => {
    setTimePickerVisibility(true);
    setCurrentPickerField(field);
  };

  const hidePicker = () => {
    setDatePickerVisibility(false);
    setTimePickerVisibility(false);
    setCurrentPickerField('');
  };

  const handleDateConfirm = date => {
    hidePicker();
    setValue(
      `registerCause.${currentPickerField}`,
      moment(date).format('YYYY-MM-DD'),
    );
  };

  const handleTimeConfirm = time => {
    hidePicker();
    setValue(
      `registerCause.${currentPickerField}`,
      time.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
    );
  };

  const {
    control,
    handleSubmit,
    formState: {errors},
    trigger,
    reset,
    setValue,
    getValues,
    watch,
  } = useForm<FormDataDelayReport>({
    resolver: yupResolver(addDelayReportSchema),
    defaultValues: FormDataDelayReportValue,
  });

  const startDate = watch('registerCause.dateOfStart');
  const endDate = watch('registerCause.dateOfFinish');
  const startDateTime = watch('registerCause.timeOfStart');
  const endDateTime = watch('registerCause.timeOfFinish');
  const affectedEmployee = watch('registerCause.affectedEmp');
  const watchFinishShift = watch('registerCause.shiftFinish');
  const extensionOfTime = watch('outcomeRemarks.extensionOfTime');

  const verifyWatchValue =
    startDate && endDate && startDateTime && endDateTime && affectedEmployee;

  useEffect(() => {
    if (isEdit && delayID) {
      setOptions({
        title: 'Update Delay/Disruption Report',
      });
      if (isEdit && collectiveDataReport) {
        setValue('registerCause.type', collectiveDataReport.type);
        setValue(
          'registerCause.dateOfStart',
          collectiveDataReport.date_of_start,
        );
        setValue(
          'registerCause.timeOfStart',
          convertTimestampToAMPM(collectiveDataReport.time_of_start),
        );
        setValue('registerCause.shiftStart', collectiveDataReport.shift_start);
        setValue(
          'registerCause.shiftFinish',
          collectiveDataReport.shift_finish,
        );

        if (collectiveDataReport?.shift_finish === 'OnGoing') {
          setValue('registerCause.dateOfFinish', '');
          setValue('registerCause.timeOfFinish', '');
        } else {
          setValue(
            'registerCause.dateOfFinish',
            collectiveDataReport.date_of_finish,
          );
          setValue(
            'registerCause.timeOfFinish',
            convertTimestampToAMPM(collectiveDataReport.time_of_finish),
          );
        }

        setValue(
          'registerCause.affectedEmp',
          collectiveDataReport.num_labourers_affected,
        );
        setValue('outcomeRemarks.rootCause', collectiveDataReport.reason_cause);
        setValue(
          'outcomeRemarks.delayOutcome',
          collectiveDataReport.delay_outcome,
        );
        setValue(
          'outcomeRemarks.mitigationStrategy',
          collectiveDataReport.mitigation_strategy,
        );
        setValue(
          'outcomeRemarks.extensionOfTime',
          collectiveDataReport.extension_of_time,
        );
        if (collectiveDataReport?.extension_of_time === 'Yes') {
          setValue(
            'outcomeRemarks.criticalPath',
            collectiveDataReport?.critical_path,
          );
        } else {
          setValue('outcomeRemarks.criticalPath', '');
        }

        collectiveDataReport?.documents &&
          setExitingDelayFiles(JSON.parse(collectiveDataReport?.documents));

        setValue('generalRemarks', collectiveDataReport.remarks);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, delayID, collectiveDataReport]);

  const checkLocationServices = async () => {
    try {
      const position = await new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1000,
        });
      });

      const positionAddress = await getAddress(
        position?.coords?.latitude,
        position?.coords?.longitude,
      );
      // If the position is obtained successfully, location services are enabled
      setLocation(position?.coords);
      setAddress(positionAddress);
      return true;
    } catch (error: any) {
      // If an error occurs, check the error code to determine if location services are disabled
      if (error.code === 2 || error.code === 1) {
        return false;
      } else {
        // console.error('Error checking location services:', error);
        return false;
      }
    }
  };

  useEffect(() => {
    checkLocationServices();
  }, []);

  useEffect(() => {
    if (verifyWatchValue) {
      const delayStart = `${startDate} ${convertTimeFormat(startDateTime)}`;
      const delayEnds = `${endDate} ${convertTimeFormat(endDateTime)}`;
      // const updateLostHours = calculateSiteDelay({
      //   delayStart,
      //   delayEnds,
      //   projectItems: JSON.parse(selectedProject?.projectDetails?.projectItems),
      // });
      const startMoment = moment(delayStart, 'YYYY-MM-DD HH:mm:ss');
      const endMoment = moment(delayEnds, 'YYYY-MM-DD HH:mm:ss');
      const difference = endMoment.diff(startMoment, 'hours', true);
      setHoursCalculateMsg(difference < 0 ? 0 : difference);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    verifyWatchValue,
    startDate,
    endDate,
    startDateTime,
    endDateTime,
    affectedEmployee,
  ]);

  const {
    status: locationPermissionStatus,
    request: requestLocationPermission,
    dialogVisible: locationPermissionDialogVisible,
  } = useMandatoryPermission(PermissionType.LOCATION);

  const [showLocationDialog, setShowLocationDialog] = useState(
    locationPermissionDialogVisible,
  );

  //Register
  const refType = useRef<RNTextInput | null>(null);
  const refStartShift = useRef<RNTextInput>(null);
  const refDateOfFinish = useRef<RNTextInput>(null);
  const refFinishShift = useRef<RNTextInput>(null);
  const refFinishTime = useRef<RNTextInput>(null);
  const refAffectedEmp = useRef<RNTextInput>(null);

  //Outcome
  const refRootCause = useRef<RNTextInput>(null);
  const refOutcome = useRef<RNTextInput>(null);
  const refMitigation = useRef<RNTextInput>(null);
  const refGenRemarks = useRef<RNTextInput>(null);
  const refExtensionOfTime = useRef<RNTextInput>(null);
  const refCriticalPath = useRef<RNTextInput>(null);

  const addNewDelayReport = async (formData: FormDataDelayReport) => {
    try {
      const formDataFile = new FormData();
      formDataFile.append('userID', userID ?? 0);
      formDataFile.append('delayDate', moment().format('YYYY-MM-DD HH:mm:ss'));
      formDataFile.append(
        'projectID',
        Number(selectedProject?.projectDetails?.projectID) ?? 0,
      );
      formDataFile.append(
        'projectTaskID',
        Number(selectedProject?.taskDetails?.taskID) ?? 0,
      );
      formDataFile.append(
        'baselineID',
        Number(selectedProject?.baselineDetails?.baselineID) ?? 0,
      );
      const formattedRegisterCause = {
        ...formData?.registerCause,
        totalHoursLost: hoursCalculateMsg,
        timeOfStart: `${
          formData?.registerCause?.dateOfStart
        } ${convertTimeFormat(formData?.registerCause?.timeOfStart)}`,
        timeOfFinish: formData?.registerCause?.dateOfFinish
          ? `${formData?.registerCause?.dateOfFinish} ${convertTimeFormat(
              formData?.registerCause?.timeOfFinish,
            )}`
          : null,
      };

      formDataFile.append(
        'registerCause',
        JSON.stringify(formattedRegisterCause),
      );

      formDataFile.append(
        'outcomeRemarks',
        JSON.stringify(formData?.outcomeRemarks),
      );

      formDataFile.append('generalRemarks', formData?.generalRemarks);
      formDataFile.append('createdAt', moment().format('YYYY-MM-DD HH:mm:ss'));
      const delayFilesFormat = formData?.delayFiles;
      if (delayFilesFormat && delayFilesFormat.length > 0) {
        delayFilesFormat?.forEach?.((file, index) => {
          formDataFile.append(`delayFiles[${index}]`, file);
        });
      }

      const delayCameraFilesFormat = formData?.delayCameraFiles;
      if (delayCameraFilesFormat && delayCameraFilesFormat.length > 0) {
        delayCameraFilesFormat?.forEach?.((file, index) => {
          formDataFile.append(`delayCameraFiles[${index}]`, file);
        });
      }

      const delayReport = await addDelayReport(formDataFile).unwrap();
      if (delayReport?.status === STATUS_HTTP_CODE.SUCCESS) {
        const delayValue = `${delayReport?.data?.report_code}`;
        const notifyTitle =
          watchFinishShift === 'OnGoing' ? 'Opened' : 'Created';
        if (watchFinishShift === 'OnGoing') {
          const getProjectStartHours = JSON.parse(
            selectedProject?.projectDetails?.projectItems,
          );
          delayNotificationApi.scheduleDelay({
            id: `${delayValue}-OPENED`,
            startHour:
              getProjectStartHours?.project_timing?.working_hours_start ??
              '09:00',
            title: 'In-Progress Delay Notification',
            body: `Verify the [${delayValue}] report and update the status accordingly.`,
          });
        }
        delayNotificationApi.delayDisplayNotify({
          title: `Delay Report ${notifyTitle}`,
          body: `ID: ${delayValue} | Status: ${notifyTitle} | Project: ${selectedProject?.projectDetails?.projectLabel} | Task: ${selectedProject?.taskDetails?.taskLabel}`,
        });
        setDelayError(false);
        setSuccessRecord(true);
        reset();
      } else {
        setDelayError(true);
        setDelayErrorMsg(delayReport?.message ?? STATUS_MESSAGE.UNKNOWN);
      }
    } catch (error: any) {
      setDelayError(true);
      setDelayErrorMsg(error?.message ?? STATUS_MESSAGE.UNKNOWN);
    }
  };

  const updateDelayReportCall = async (formData: FormDataDelayReport) => {
    try {
      const formDataFile = new FormData();
      formDataFile.append('delayID', delayID ?? 0);
      formDataFile.append('userID', userID ?? 0);
      formDataFile.append(
        'projectID',
        Number(selectedProject?.projectDetails?.projectID) ?? 0,
      );
      formDataFile.append(
        'projectTaskID',
        Number(selectedProject?.taskDetails?.taskID) ?? 0,
      );
      const formattedRegisterCause = {
        ...formData?.registerCause,
        totalHoursLost: hoursCalculateMsg,
        timeOfStart: `${
          formData?.registerCause?.dateOfStart
        } ${convertTimeFormat(formData?.registerCause?.timeOfStart)}`,
        timeOfFinish: formData?.registerCause?.dateOfFinish
          ? `${formData?.registerCause?.dateOfFinish} ${convertTimeFormat(
              formData?.registerCause?.timeOfFinish,
            )}`
          : null,
      };

      formDataFile.append(
        'registerCause',
        JSON.stringify(formattedRegisterCause),
      );

      formDataFile.append(
        'outcomeRemarks',
        JSON.stringify(formData?.outcomeRemarks),
      );
      formDataFile.append('generalRemarks', formData?.generalRemarks);
      formDataFile.append('modifiedAt', moment().format('YYYY-MM-DD HH:mm:ss'));

      const delayFilesFormat = formData?.delayFiles;
      if (delayFilesFormat && delayFilesFormat.length > 0) {
        delayFilesFormat?.forEach?.((file, index) => {
          formDataFile.append(`delayFiles[${index}]`, file);
        });
      }

      const delayCameraFilesFormat = formData?.delayCameraFiles;
      if (delayCameraFilesFormat && delayCameraFilesFormat.length > 0) {
        delayCameraFilesFormat?.forEach?.((file, index) => {
          formDataFile.append(`delayCameraFiles[${index}]`, file);
        });
      }

      const siteReport = await updateDelayReport(formDataFile).unwrap();
      if (siteReport?.status === STATUS_HTTP_CODE.SUCCESS) {
        const delayValue = `${siteReport?.data?.report_code}`;
        const notifyTitle =
          watchFinishShift === 'OnGoing' ? 'Updated' : 'Ended';
        if (watchFinishShift === 'OnGoing') {
          const getProjectStartHours = JSON.parse(
            selectedProject?.projectDetails?.projectItems,
          );
          delayNotificationApi.scheduleDelay({
            id: `${delayValue}-OPENED`,
            startHour:
              getProjectStartHours?.project_timing?.working_hours_start ??
              '09:00',
            title: 'In-Progress Delay Notification',
            body: `Verify the [${delayValue}] report and update the status accordingly.`,
          });
        } else {
          delayNotificationApi.cancel(`${delayValue}-OPENED`);
        }
        delayNotificationApi.delayDisplayNotify({
          title: `Delay Report ${notifyTitle}`,
          body: `ID: ${delayValue} | Status: ${notifyTitle} | Project: ${selectedProject?.projectDetails?.projectLabel} | Task: ${selectedProject?.taskDetails?.taskLabel}`,
        });

        setDelayError(false);
        setSuccessRecord(true);
        reset();
      } else {
        setDelayError(true);
        setDelayErrorMsg(siteReport?.message ?? STATUS_MESSAGE.UNKNOWN);
      }
    } catch (error: any) {
      setDelayError(true);
      setDelayErrorMsg(error?.message ?? STATUS_MESSAGE.UNKNOWN);
    }
  };

  const actionCall = isEdit ? updateDelayReportCall : addNewDelayReport;

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.images,
          DocumentPicker.types.xlsx,
          DocumentPicker.types.pdf,
          DocumentPicker.types.pptx,
        ],
        allowMultiSelection: true,
      });

      const validFiles =
        result &&
        result.length > 0 &&
        result.filter(file => file?.size <= 5097152);

      // if (
      //   exitingDelayFiles?.length +
      //     selectedDelayCameraFiles?.length +
      //     selectedDelayFiles?.length +
      //     validFiles?.length >
      //   5
      // ) {
      //   setReportDialog(true);
      //   setReportDescription(
      //     'File Limit Exceeded, You can select a maximum of 5 files.',
      //   );
      //   return;
      // }

      if (
        validFiles &&
        validFiles?.length > 0 &&
        validFiles?.length === result.length
      ) {
        setSelectedDelayFiles(prevFiles => [...prevFiles, ...validFiles]);
        setValue('delayFiles', [...selectedDelayFiles, ...validFiles]);
      } else {
        setReportDialog(true);
        setReportDescription(
          'File Size Limit Exceeded, Some selected files exceed the 5 MB limit. Please select smaller files.',
        );
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // Handle cancelled
      } else {
        // throw err;
      }
    }
    // return null;
  };

  const removeFile = (index, type = 'delayFiles') => {
    if (type === 'delayFiles') {
      setSelectedDelayFiles(prevFiles =>
        prevFiles.filter((file, i) => i !== index),
      );
    } else {
      setSelectedDelayCameraFiles(prevFiles =>
        prevFiles.filter((file, i) => i !== index),
      );
    }
    setValue(
      type,
      getValues(type).filter((_, i) => i !== index),
    );
  };

  const deleteDocuReport = async () => {
    setDeleteDocuDialog(false);
    try {
      const payload = await deleteDelayReportDocument({
        delayID: delayID ?? 0,
        documentID: currentReportDocuID ?? 0,
      }).unwrap();
      if (payload?.status === STATUS_HTTP_CODE.SUCCESS) {
        setExitingDelayFiles(
          exitingDelayFiles?.filter(
            item => item?.document_id !== currentReportDocuID,
          ),
        );
        setDelayToast(true);
        setDelayToastMessage('The delay report document has been deleted.');
      } else {
        setDelayToast(true);
        setDelayToastMessage('Unable to delete the delay report document.');
      }
    } catch (error: any) {
      setDelayToast(true);
      setDelayToastMessage('Unable to delete the delay report document.');
    }
  };

  const handleAddComment = async newComment => {
    const now = moment();

    // Format the date and time as per your requirements
    const formattedDateTime = now.format('DD-MM-YYYY HH:mm:ss');
    const textToPrint = `Address: ${splitTextIntoLines(
      address,
    )}\nDate/Time: ${formattedDateTime}\nComments: ${newComment || 'None'}`;
    const options = {
      backgroundImage: {
        src: `file://${cameraImageItem[0]?.uri}`,
      },
      watermarkTexts: [
        {
          text: textToPrint,
          positionOptions: {
            position: 'bottomRight',
          },
          style: {
            color: '#fbfbfb',
            fontSize:
              cameraOrientation === 'landscape-right'
                ? 17
                : cameraOrientation === 'landscape-left'
                ? 30
                : 28,
            fontName: 'Arial',
          },
        },
      ],
      scale: 1,
      quality: 100,
      saveFormat: 'jpg',
    };
    try {
      const markedImage = await ImageMarker.markText(options);
      const timestamp = moment().unix();
      setCameraImageItem([
        {
          uri: `file://${markedImage}`,
        },
      ]);
      setSelectedDelayCameraFiles(prevFiles => [
        ...prevFiles,
        {
          uri: `file://${markedImage}`,
          type: 'image/jpeg',
          name: `CAMERA_IMG_${timestamp}.jpg`,
        },
      ]);
      setValue('delayCameraFiles', [
        ...selectedDelayCameraFiles,
        {
          uri: `file://${markedImage}`,
          type: 'image/jpeg',
          name: `CAMERA_IMG_${timestamp}.jpg`,
        },
      ]);
      setCameraImageView(true);
      setCameraModalVisible(false);
      setCommentModalVisible(false);
    } catch (error) {
      // console.error('Error marking image:', error);
    }
  };

  const triggerTakePhoto = async () => {
    // if (
    //   exitingDelayFiles?.length +
    //     selectedDelayCameraFiles?.length +
    //     selectedDelayFiles?.length >=
    //   5
    // ) {
    //   setReportDialog(true);
    //   setReportDescription(
    //     'File Limit Exceeded, You can select/upload a maximum of 5 files.',
    //   );
    //   return;
    // }
    setCameraLoading(true);
    const checkLocationCall = await checkLocationServices();
    if (!locationPermissionDialogVisible && checkLocationCall) {
      setCameraModalVisible(true);
    } else if (locationPermissionDialogVisible) {
      setShowLocationDialog(true);
    } else if (!checkLocationCall) {
      setDeviceLocationDialog(true);
    }
    setCameraLoading(false);
  };

  return (
    <>
      <View style={styles.container}>
        {successRecord ? (
          <Card mode="contained">
            <Card.Content>
              <Text
                variant="bodyLarge"
                style={{
                  color: darkColor.colors.secondary,
                  textAlign: 'center',
                }}>
                {`Successfully ${
                  isEdit ? 'updated' : 'added'
                } the deplay / disruption report.`}
              </Text>
              <Button
                labelStyle={[
                  FontsStyle.fontBold,
                  {fontSize: fonts.size.regular, marginTop: 10},
                ]}
                mode="text"
                compact
                onPress={() => navigate('ProjectDetails')}>
                Back to Project Details
              </Button>
            </Card.Content>
          </Card>
        ) : (
          <>
            <Card mode="contained" style={{marginBottom: 10, flexShrink: 1}}>
              <Card.Title
                left={props => (
                  <Avatar.Icon
                    {...props}
                    size={35}
                    icon="office-building-marker"
                    style={{backgroundColor: darkColor.colors.tertiary}}
                  />
                )}
                title={`${selectedProject?.builderDetails?.builderLabel}`}
                subtitle={`Details: ${selectedProject?.projectDetails?.projectLabel} -> ${selectedProject?.taskDetails?.taskLabel}`}
                titleStyle={[ItemSpaceTen.spaceTenTopMargin]}
                subtitleStyle={[ItemSpaceTen.spaceTenMarginBottom]}
                subtitleNumberOfLines={2}
              />
            </Card>
            {delayError && (
              <Card mode="contained" style={{marginBottom: 5}}>
                <Card.Content>
                  <Text
                    variant="bodyMedium"
                    style={{color: darkColor.colors.error}}>
                    {delayErrorMsg}
                  </Text>
                </Card.Content>
              </Card>
            )}
            {isCollectiveDataReportLoading ? (
              <ActivityIndicator animating={true} />
            ) : (
              <Surface elevation={5} style={styles.surface}>
                <MultistepFlow
                  onFinish={handleSubmit(actionCall)}
                  onCancel={goBack}>
                  <Step
                    title="Register"
                    onNext={async () => {
                      const result = await trigger(['registerCause']);
                      return result;
                    }}
                    defaultStyle={false}
                    backOk={false}>
                    <DropDown
                      inputRef={refType}
                      label={'Type'}
                      mode={'flat'}
                      controllerProps={{
                        name: 'registerCause.type',
                        control,
                      }}
                      visible={showTypeDropDown}
                      showDropDown={() => setShowTypeDropDown(true)}
                      onDismiss={() => setShowTypeDropDown(false)}
                      selectedValue={delayReportVal?.registerCause?.type}
                      setValue={value => {
                        setDelayReportVal(draft => {
                          draft.registerCause.type = value?.toLowerCase();
                        });
                      }}
                      list={DELAY_TYPE?.map((value: any) => ({
                        label: value.label,
                        value: value.label,
                      }))}
                      dropDownItemTextStyle={{color: theme.colors.onSurface}}
                      errorMessage={errors.registerCause?.type?.message}
                    />
                    <SpaceSeparator size={10} />
                    <DropDown
                      inputRef={refStartShift}
                      label={'Start Shift'}
                      mode={'flat'}
                      controllerProps={{
                        name: 'registerCause.shiftStart',
                        control,
                      }}
                      visible={showStartShiftDropDown}
                      showDropDown={() => setShowStartShiftDropDown(true)}
                      onDismiss={() => setShowStartShiftDropDown(false)}
                      selectedValue={delayReportVal?.registerCause?.shiftStart}
                      setValue={value => {
                        setDelayReportVal(draft => {
                          draft.registerCause.shiftStart = value?.toLowerCase();
                        });
                      }}
                      list={SHIFT_TYPE?.filter(
                        option => option.value !== 'ongoing',
                      )?.map((value: any) => ({
                        label: value.label,
                        value: value.label,
                      }))}
                      dropDownItemTextStyle={{
                        color: theme.colors.onSurface,
                      }}
                      errorMessage={errors.registerCause?.shiftStart?.message}
                    />
                    <SpaceSeparator size={5} />
                    <View style={RowSpaceBtwStyle.rowSpaceBtw}>
                      <Pressable
                        style={{width: '55%'}}
                        onPress={() => {
                          showDatePicker('dateOfStart');
                        }}>
                        <InputField
                          label="Date of Start"
                          modeType="flat"
                          controllerProps={{
                            name: 'registerCause.dateOfStart',
                            control,
                          }}
                          inputProps={{
                            placeholder: 'Select Date',
                          }}
                          errorMessage={
                            errors?.registerCause?.dateOfStart?.message
                          }
                          overrideStyle={{pointerEvents: 'none'}}
                          inputTooltip={
                            'When the delay for task is expected to commence.'
                          }
                        />
                      </Pressable>
                      <DateTimePickerModal
                        isVisible={
                          isDatePickerVisible &&
                          currentPickerField === 'dateOfStart'
                        }
                        mode="date"
                        onConfirm={handleDateConfirm}
                        onCancel={hidePicker}
                      />
                      <Pressable
                        style={{width: '40%'}}
                        onPress={() => {
                          showTimePicker('timeOfStart');
                        }}>
                        <InputField
                          label="Time of Start"
                          modeType="flat"
                          controllerProps={{
                            name: 'registerCause.timeOfStart',
                            control,
                          }}
                          inputProps={{
                            placeholder: 'Select Time',
                          }}
                          errorMessage={
                            errors?.registerCause?.timeOfStart?.message
                          }
                          overrideStyle={{pointerEvents: 'none'}}
                        />
                      </Pressable>
                      <DateTimePickerModal
                        isVisible={
                          isTimePickerVisible &&
                          currentPickerField === 'timeOfStart'
                        }
                        mode="time"
                        onConfirm={handleTimeConfirm}
                        onCancel={hidePicker}
                      />
                    </View>
                    <SpaceSeparator size={5} />
                    <DropDown
                      inputRef={refFinishShift}
                      label={'Finish Shift'}
                      mode={'flat'}
                      controllerProps={{
                        name: 'registerCause.shiftFinish',
                        control,
                      }}
                      visible={showFinishShiftDropDown}
                      showDropDown={() => setShowFinishShiftDropDown(true)}
                      onDismiss={() => setShowFinishShiftDropDown(false)}
                      selectedValue={delayReportVal?.registerCause?.shiftFinish}
                      setValue={value => {
                        if (value === 'OnGoing') {
                          setValue('registerCause.dateOfFinish', '');
                          setValue('registerCause.timeOfFinish', '');
                        }
                        setDelayReportVal(draft => {
                          draft.registerCause.shiftFinish =
                            value?.toLowerCase();
                        });
                      }}
                      list={SHIFT_TYPE?.map((value: any) => ({
                        label: value.label,
                        value: value.label,
                      }))}
                      dropDownItemTextStyle={{
                        color: theme.colors.onSurface,
                      }}
                      errorMessage={errors.registerCause?.shiftFinish?.message}
                    />
                    <SpaceSeparator size={5} />
                    <View style={RowSpaceBtwStyle.rowSpaceBtw}>
                      <Pressable
                        disabled={watchFinishShift === 'OnGoing' ?? false}
                        style={{width: '55%'}}
                        onPress={() => {
                          showDatePicker('dateOfFinish');
                        }}>
                        <InputField
                          ref={refDateOfFinish}
                          label="Date of Finish"
                          modeType="flat"
                          controllerProps={{
                            name: 'registerCause.dateOfFinish',
                            control,
                          }}
                          inputProps={{
                            placeholder: 'Select Date',
                          }}
                          errorMessage={
                            errors?.registerCause?.dateOfFinish?.message
                          }
                          overrideStyle={{pointerEvents: 'none'}}
                        />
                      </Pressable>
                      <DateTimePickerModal
                        isVisible={
                          isDatePickerVisible &&
                          currentPickerField === 'dateOfFinish'
                        }
                        mode="date"
                        onConfirm={handleDateConfirm}
                        onCancel={hidePicker}
                      />
                      <Pressable
                        style={{width: '40%'}}
                        disabled={watchFinishShift === 'OnGoing' ?? false}
                        onPress={() => {
                          showTimePicker('timeOfFinish');
                        }}>
                        <InputField
                          ref={refFinishTime}
                          label="Time of Finish"
                          modeType="flat"
                          controllerProps={{
                            name: 'registerCause.timeOfFinish',
                            control,
                          }}
                          inputProps={{
                            placeholder: 'Select Time',
                          }}
                          errorMessage={
                            errors?.registerCause?.timeOfFinish?.message
                          }
                          overrideStyle={{pointerEvents: 'none'}}
                        />
                      </Pressable>
                      <DateTimePickerModal
                        isVisible={
                          isTimePickerVisible &&
                          currentPickerField === 'timeOfFinish'
                        }
                        mode="time"
                        onConfirm={handleTimeConfirm}
                        onCancel={hidePicker}
                      />
                    </View>
                    <SpaceSeparator size={0} />
                    <InputField
                      ref={refAffectedEmp}
                      label="Total Employee Affected"
                      modeType="flat"
                      controllerProps={{
                        name: 'registerCause.affectedEmp',
                        control,
                      }}
                      inputProps={{
                        placeholder: 'Enter the employee no.',
                        keyboardType: 'numeric',
                      }}
                      errorMessage={errors?.registerCause?.affectedEmp?.message}
                    />
                    {verifyWatchValue && (
                      <View style={styles.hoursContainer}>
                        <View style={styles.leftColumn}>
                          <Card style={styles.hoursCard}>
                            <Card.Content>
                              <Text style={styles.hoursTitle}>Hours Lost</Text>
                              <Text style={styles.hoursDescription}>
                                {formatTotalHoursLost(hoursCalculateMsg)}
                              </Text>
                            </Card.Content>
                          </Card>
                        </View>
                        <View style={styles.rightColumn}>
                          <Card style={styles.hoursCard}>
                            <Card.Content>
                              <Text style={styles.hoursTitle}>
                                Man-hours Lost
                              </Text>
                              <Text style={styles.hoursDescription}>
                                {formatTotalHoursLost(
                                  hoursCalculateMsg,
                                  affectedEmployee,
                                )}
                              </Text>
                            </Card.Content>
                          </Card>
                        </View>
                      </View>
                    )}
                  </Step>
                  <Step
                    title="Outcome / Mitigation Remarks"
                    defaultStyle={false}
                    submitText="Submit">
                    <InputField
                      ref={refRootCause}
                      label="Cause of Delay"
                      controllerProps={{
                        name: 'outcomeRemarks.rootCause',
                        control,
                      }}
                      inputProps={{
                        placeholder: 'Enter cause of delay description',
                        keyboardType: 'default',
                        returnKeyType: 'done',
                        multiline: true,
                        scrollEnabled: false,
                        numberOfLines: 3,
                      }}
                      errorMessage={errors.outcomeRemarks?.rootCause?.message}
                      inputTooltip={
                        'Specific reason behind the observed delay in task.'
                      }
                      updateValue={setValue}
                      prePopulatedOption={PREPOPULATED_CAUSEDELAY_TYPE}
                    />
                    <InputField
                      ref={refOutcome}
                      label="Delay outcome"
                      controllerProps={{
                        name: 'outcomeRemarks.delayOutcome',
                        control,
                      }}
                      inputProps={{
                        placeholder: 'Enter Delay/Disruption Outcome',
                        keyboardType: 'default',
                        returnKeyType: 'next',
                        multiline: true,
                        scrollEnabled: false,
                        numberOfLines: 3,
                        onSubmitEditing: () => refMitigation.current?.focus(),
                      }}
                      errorMessage={
                        errors.outcomeRemarks?.delayOutcome?.message
                      }
                    />
                    <InputField
                      ref={refMitigation}
                      label="Mitigation Strategy"
                      controllerProps={{
                        name: 'outcomeRemarks.mitigationStrategy',
                        control,
                      }}
                      inputProps={{
                        placeholder: 'Enter mitigation strategy',
                        keyboardType: 'default',
                        returnKeyType: 'next',
                        multiline: true,
                        scrollEnabled: false,
                        numberOfLines: 3,
                        onSubmitEditing: () => refGenRemarks.current?.focus(),
                      }}
                      errorMessage={
                        errors.outcomeRemarks?.mitigationStrategy?.message
                      }
                    />
                    <SpaceSeparator size={5} />
                    <DropDown
                      inputRef={refExtensionOfTime}
                      label={'Extension of Time Required?'}
                      mode={'flat'}
                      controllerProps={{
                        name: 'outcomeRemarks.extensionOfTime',
                        control,
                      }}
                      visible={showExtensionOfTimeDropDown}
                      showDropDown={() => setShowExtensionOfTimeDropDown(true)}
                      onDismiss={() => setShowExtensionOfTimeDropDown(false)}
                      selectedValue={
                        delayReportVal?.outcomeRemarks?.extensionOfTime
                      }
                      setValue={value => {
                        if (value === 'No') {
                          setValue('outcomeRemarks.criticalPath', '');
                        }
                        setDelayReportVal(draft => {
                          draft.outcomeRemarks.extensionOfTime =
                            value?.toLowerCase();
                        });
                      }}
                      list={YES_NO_OPTION?.map((value: any) => ({
                        label: value.label,
                        value: value.label,
                      }))}
                      dropDownItemTextStyle={{
                        color: theme.colors.onSurface,
                      }}
                      errorMessage={
                        errors.outcomeRemarks?.extensionOfTime?.message
                      }
                    />
                    {extensionOfTime === 'Yes' && (
                      <>
                        <SpaceSeparator size={10} />
                        <DropDown
                          inputRef={refCriticalPath}
                          label={'Critical Path'}
                          mode={'flat'}
                          controllerProps={{
                            name: 'outcomeRemarks.criticalPath',
                            control,
                          }}
                          visible={showCriticalPathDropDown}
                          showDropDown={() => setShowCriticalPathDropDown(true)}
                          onDismiss={() => setShowCriticalPathDropDown(false)}
                          selectedValue={
                            delayReportVal?.outcomeRemarks?.criticalPath
                          }
                          setValue={value => {
                            setDelayReportVal(draft => {
                              draft.outcomeRemarks.criticalPath =
                                value?.toLowerCase();
                            });
                          }}
                          list={YES_NO_OPTION?.map((value: any) => ({
                            label: value.label,
                            value: value.label,
                          }))}
                          dropDownItemTextStyle={{
                            color: theme.colors.onSurface,
                          }}
                          errorMessage={
                            errors.outcomeRemarks?.criticalPath?.message
                          }
                        />
                      </>
                    )}
                    <SpaceSeparator size={5} />
                    <InputField
                      ref={refGenRemarks}
                      label="Remarks"
                      controllerProps={{name: 'generalRemarks', control}}
                      inputProps={{
                        placeholder: 'Enter your remarks',
                        keyboardType: 'default',
                        returnKeyType: 'done',
                        multiline: true,
                        scrollEnabled: false,
                        numberOfLines: 3,
                      }}
                      errorMessage={errors.generalRemarks?.message}
                    />
                    <Text
                      variant="titleSmall"
                      style={{paddingBottom: 10, paddingTop: 5}}>
                      Take a Picture
                    </Text>
                    <Controller
                      control={control}
                      render={({field}) => (
                        <>
                          <Button
                            mode="outlined"
                            onPress={triggerTakePhoto}
                            loading={cameraLoading}>
                            Open Camera
                          </Button>
                          <List.Section>
                            {selectedDelayCameraFiles.map((file, index) => (
                              <List.Item
                                key={index}
                                titleNumberOfLines={1}
                                title={file.name}
                                style={{paddingBottom: 0}}
                                left={() => <List.Icon icon="image" />}
                                // eslint-disable-next-line react/no-unstable-nested-components
                                right={() => (
                                  <IconButton
                                    icon="close"
                                    size={16}
                                    onPress={() =>
                                      removeFile(index, 'delayCameraFiles')
                                    }
                                  />
                                )}
                              />
                            ))}
                          </List.Section>
                        </>
                      )}
                      name="delayCameraFiles"
                    />
                    <Text
                      variant="titleSmall"
                      style={{paddingBottom: 10, paddingTop: 15}}>
                      Upload Files
                    </Text>
                    <Controller
                      control={control}
                      render={({field}) => (
                        <>
                          <Button mode="outlined" onPress={pickDocument}>
                            Upload a Image/Document
                          </Button>
                          <List.Section>
                            {selectedDelayFiles.map((file, index) => (
                              <List.Item
                                key={index}
                                titleNumberOfLines={1}
                                title={file.name}
                                style={{paddingBottom: 0}}
                                left={() => <List.Icon icon="file" />}
                                // eslint-disable-next-line react/no-unstable-nested-components
                                right={() => (
                                  <IconButton
                                    icon="close"
                                    size={16}
                                    onPress={() => removeFile(index)}
                                  />
                                )}
                              />
                            ))}
                          </List.Section>
                          {exitingDelayFiles &&
                            exitingDelayFiles?.length > 0 && (
                              <List.Section title="Existing Files">
                                {exitingDelayFiles.map((file, index) => (
                                  <List.Item
                                    key={index}
                                    titleNumberOfLines={1}
                                    title={file?.document_name
                                      ?.split('_')
                                      ?.slice(2)
                                      ?.join('_')}
                                    style={{paddingBottom: 0}}
                                    left={() => (
                                      <List.Icon
                                        icon={`${
                                          isImageType(file?.document_name)
                                            ? 'image'
                                            : 'file-document'
                                        }`}
                                      />
                                    )}
                                    // eslint-disable-next-line react/no-unstable-nested-components
                                    right={() => (
                                      <IconButton
                                        icon="close"
                                        size={16}
                                        onPress={() => {
                                          setCurrentReportDocuID(
                                            Number(file.document_id),
                                          );
                                          setDeleteDocuDialog(true);
                                        }}
                                      />
                                    )}
                                  />
                                ))}
                              </List.Section>
                            )}
                        </>
                      )}
                      name="delayFiles"
                    />
                  </Step>
                </MultistepFlow>
                <ConfirmationDialog
                  isVisible={reportDialog}
                  title={'Notification'}
                  description={reportDescription}
                  onClose={() => setReportDialog(false)}
                  cancelButtonChildren={'Close'}
                />
                <ConfirmationDialog
                  isVisible={deleteDocuDialog}
                  title={'Delete the Document'}
                  description={
                    'This will permanently delete the delay document'
                  }
                  onClose={() => setDeleteDocuDialog(false)}
                  onConfirm={deleteDocuReport}
                  cancelButtonChildren={'Cancel'}
                  confirmButtionChildren={'Confirm'}
                />
                <ConfirmationDialog
                  isVisible={showExitDialog}
                  title={'Exit'}
                  description={'Are you sure you want to exit the report?'}
                  onClose={() => setShowExitDialog(false)}
                  onConfirm={() => {
                    setShowExitDialog(false);
                    setIsSelectionModeEnabled(false);
                    setTimeout(() => {
                      goBack();
                    }, 500);
                  }}
                  cancelButtonChildren={'Cancel'}
                  confirmButtionChildren={'Exit'}
                />
                <Portal>
                  <Snackbar
                    visible={delayToast}
                    duration={4000}
                    onDismiss={() => setDelayToast(false)}>
                    {delayToastMessage}
                  </Snackbar>
                  <PermissionDialog
                    visible={
                      showLocationDialog && locationPermissionDialogVisible
                    }
                    title={'Location Permission'}
                    content={
                      'App needs access to your location to take photos.'
                    }
                    grantButtonText={
                      locationPermissionStatus?.canAskAgain
                        ? 'Grant Permission'
                        : 'Settings'
                    }
                    onDismiss={() => setShowLocationDialog(false)}
                    onGrant={requestLocationPermission}
                  />
                  <PermissionDialog
                    visible={
                      deviceLocationDialog && !locationPermissionDialogVisible
                    }
                    title={'Turn on your device location'}
                    content={
                      "Make sure your device's location is turned on, or the app may be unable to identify your current location. Please try again."
                    }
                    onDismiss={() => setDeviceLocationDialog(false)}
                  />
                  <CameraModal
                    visible={cameraModalVisible}
                    onClose={() => setCameraModalVisible(false)}
                    onError={() => {
                      setReportDialog(true);
                      setReportDescription(
                        'Encountered a problem while capturing the camera image. Please try again later.',
                      );
                    }}
                    onCapture={async (file, orientation) => {
                      setCameraImageItem([
                        {
                          uri: `file://${file.path}`,
                        },
                      ]);
                      setCameraOrientation(orientation);
                      setCommentModalVisible(true);
                      setCameraModalVisible(false);
                    }}
                  />
                  <ImageView
                    images={cameraImageItem}
                    imageIndex={0}
                    visible={cameraImageItem?.length === 1 && cameraImageView}
                    onRequestClose={() => {
                      setCameraImageItem([]);
                      setCameraImageView(false);
                    }}
                    FooterComponent={() => (
                      <View
                        style={{
                          justifyContent: 'center',
                          // backgroundColor: darkColor.colors.tertiaryContainer,
                          paddingVertical: 6,
                        }}>
                        <Text
                          variant="titleMedium"
                          style={{textAlign: 'center'}}>
                          Camera Image Preview
                        </Text>
                      </View>
                    )}
                  />
                  <ImageView
                    images={cameraImageItem}
                    imageIndex={0}
                    visible={
                      cameraImageItem?.length === 1 && commentModalVisible
                    }
                    swipeToCloseEnabled={false}
                    onRequestClose={() => {
                      setCameraImageView(true);
                      handleAddComment(null);
                      setTimeout(() => {
                        setCommentModalVisible(false);
                      }, 1000);
                    }}
                    FooterComponent={props => (
                      <FooterComponent
                        {...props}
                        onAddCommentCallback={handleAddComment}
                      />
                    )}
                  />
                </Portal>
              </Surface>
            )}
          </>
        )}
      </View>
    </>
  );
};

const FooterComponent = ({onAddCommentCallback}) => {
  const [comment, setComment] = React.useState('');
  const handleAddComment = React.useCallback(() => {
    onAddCommentCallback(comment);
    setComment('');
  }, [comment, onAddCommentCallback]);

  return (
    <KeyboardAwareScrollView
      scrollEnabled={false}
      extraScrollHeight={80}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        height: Dimensions.get('screen').height - 100,
        justifyContent: 'flex-end',
        zIndex: 999,
      }}>
      <TextInput
        placeholder="Add your comment..."
        value={comment}
        onChangeText={setComment}
        mode="outlined"
        outlineStyle={{
          borderRadius: 15,
          marginHorizontal: 10,
        }}
        contentStyle={{
          marginHorizontal: 10,
          marginVertical: 10,
          borderRadius: 30,
        }}
        multiline={true}
        scrollEnabled={false}
        numberOfLines={2}
      />
      <View style={{backgroundColor: 'black', marginTop: 10}}>
        <IconButton
          icon="send"
          mode="contained"
          containerColor={darkColor.colors.primary}
          iconColor={darkColor.colors.background}
          style={{
            alignSelf: 'flex-end',
            marginRight: 10,
          }}
          onPress={handleAddComment}
        />
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 50,
  },
  buttonStyle: {
    marginVertical: ItemSpaceTen.spaceTenVerticalMargin.marginVertical,
  },
  surface: {
    flex: 1,
    justifyContent: 'center',
    borderRadius: 15,
    borderColor: darkColor.colors.tertiary,
    borderTopColor: '#000',
    borderTopWidth: 5,
  },
  hoursContainer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftColumn: {
    flex: 1,
    marginRight: 8,
  },
  rightColumn: {
    flex: 1,
    marginLeft: 8,
  },
  hoursCard: {
    marginBottom: 10,
    elevation: 4,
    borderRadius: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  hoursTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  hoursDescription: {
    fontSize: 20,
    textAlign: 'center',
  },
});

export default AddEditDelayReport;
