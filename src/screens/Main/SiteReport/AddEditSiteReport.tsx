import React, {useEffect, useRef, useState} from 'react';
import {
  StyleSheet,
  ScrollView,
  TextInput as RNTextInput,
  View,
  Dimensions,
} from 'react-native';
import {ItemSpaceTen} from '../../../themes';
import {useNavigation} from '@react-navigation/native';
import {ScreensNavigationProps} from '../../../@types/navigation';
import SignatureCapture from 'react-native-signature-capture';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
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
  RadioButton,
  TextInput,
  Menu,
  Modal,
} from 'react-native-paper';
import {MultistepFlow, Step} from '../../../components/MultistepFlow';
import {InputField} from '../../../components/InputField/InputField';
import {useForm, useFieldArray, Controller} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import {SpaceSeparator} from '../../../components/SpaceSeparator/SpaceSeparator';
import {Button} from '../../../components/Button';
import {addSiteReportSchema} from '../../../schemas/schema';
import {
  FormDataSiteReport,
  FormDataSiteReportValue,
} from '../../../entities/Form/siteReportForm';
import {
  PREPOPULATED_MACHINERY_NAMES,
  PREPOPULATED_SUB_CONTRACTORS,
  WORK_ACTIVITY_TYPE,
} from '../../../utils/constants';
import {
  contractorFirmVal,
  workPerformedVal,
  overTimeDetailVal,
  machineryAndEquipmentVal,
} from '../../../utils/constants';
import {RowSpaceBtwStyle, AlignCenterStyles} from '../../../themes';
import {useAppSelector} from '../../../hooks/reduxHooks';
import {
  useAddSiteReportMutation,
  useDeleteSiteReportActivityDocumentMutation,
  useDeleteSiteReportDocumentMutation,
  useUpdateSiteReportMutation,
} from '../../../services/apiServices';
import {STATUS_HTTP_CODE, STATUS_MESSAGE} from '../../../constants/enumValues';
import {darkColor, fonts} from '../../../themes';
import {FontsStyle} from '../../../themes';
import {useApiGetSiteReportDetails} from '../../../hooks/userSiteReportDetails';
import DocumentPicker from 'react-native-document-picker';
import {ConfirmationDialog} from '../../../components/PromiseDialog';
import moment from 'moment';
import {useMandatoryPermission} from '../../../hooks/usePermission';
import {PermissionType} from '../../../hooks/usePermission';
import {PermissionDialog} from '../../../components/CameraModal/PermissionDialog';
import {CameraModal} from '../../../components/CameraModal';
import ImageView from 'react-native-image-viewing';
import ImageMarker from 'react-native-image-marker';
import Geolocation from 'react-native-geolocation-service';
import {isArraysEqual, isImageType} from '../../../utils/functions';
import {getTemperature} from '../../../utils/getTemperature';
import {getAddress} from '../../../utils/getAddress';
import {setTemperature} from '../../../redux/utils/setTemperature';
import {useDispatch, useSelector} from 'react-redux';
import {splitTextIntoLines} from '../../../utils/textUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ConfirmationDialogWithInput} from '../../../components/PromiseDialogWithInput';

const AddEditSiteReport = ({route}: {route: any}) => {
  const {isEdit, reportID} = route.params || {};
  const authDetails = useAppSelector(state => state?.authDetails);
  const {navigate, goBack, setOptions, addListener, dispatch} =
    useNavigation<ScreensNavigationProps>();

  const selectedProject = useAppSelector(
    state => state?.assignedProjects?.currentProject,
  );
  const userID = useAppSelector(state => state?.authDetails?.user?.id);
  const [siteError, setSiteError] = useState<boolean>(false);
  const [siteErrorMsg, setSiteErrorMsg] = useState<string>('');
  const [successRecord, setSuccessRecord] = useState(false);
  const [reportDialog, setReportDialog] = useState(false);
  const [reportDescription, setReportDescription] = useState('');
  const [deleteDocuDialog, setDeleteDocuDialog] = useState(false);
  const [siteToast, setSiteToast] = useState<boolean>(false);
  const [siteToastMessage, setSiteToastMessage] = useState<string>('');
  const [currentReportDocuID, setCurrentReportDocuID] = useState<number>(0);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [signatureModalVisible, setSignatureModalVisible] =
    useState<boolean>(false);

  const [addedSignature, setAddedSignature] = useState<boolean>(false);
  const [addSiteReport] = useAddSiteReportMutation();
  const [updateSiteReport] = useUpdateSiteReportMutation();
  const [deleteSiteReportDocument] = useDeleteSiteReportDocumentMutation();
  const [deleteSiteReportActivityDocument] =
    useDeleteSiteReportActivityDocumentMutation();
  const {isCollectiveDataReportLoading, collectiveDataReport} =
    useApiGetSiteReportDetails(
      authDetails?.user?.id ?? 0,
      reportID ?? 0,
      !authDetails?.user?.id || !reportID || !isEdit,
    );

  interface RNSignInput {
    saveImage: () => void;
    resetImage: () => void;
    context: '';
    setState: () => void;
    forceUpdate: () => void;
    render: any;
    props: any;
    state: any;
    refs: any;
  }

  const signatureRef = useRef<RNSignInput>(null);
  const [address, setAddress] = useState('');
  const [selectedSiteFiles, setSelectedSiteFiles] = useState([]);
  const [selectedSiteCameraFiles, setSelectedSiteCameraFiles] = useState([]);
  const [exitingSiteFiles, setExitingSiteFiles] = useState([]);
  const [cameraImageView, setCameraImageView] = useState(false);
  const [cameraImageItem, setCameraImageItem] = useState([]);
  const [deviceLocationDialog, setDeviceLocationDialog] = useState(false);
  const [cameraModalVisible, setCameraModalVisible] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [cameraImageType, setCameraImageType] = useState('general');

  const [cameraActivityImageItem, setCameraActivityImageItem] = useState([]);
  const [selectedSiteActivityFiles, setSelectedSiteActivityFiles] = useState(
    [],
  );
  const [selectedSiteActivityCameraFiles, setSelectedSiteActivityCameraFiles] =
    useState([]);
  const [currentActivityID, setCurrentActivityID] = useState<number>(0);
  const [deleteActivityDocuDialog, setDeleteActivityDocuDialog] =
    useState(false);
  const [removeActivityID, setRemoveActivityID] = useState<number>(0);
  const [cameraOrientation, setCameraOrientation] = useState('portrait');

  const [isSelectionModeEnabled, setIsSelectionModeEnabled] =
    React.useState(true);
  const [showExitDialog, setShowExitDialog] = React.useState(false);

  const [showSaveTemplateDialog, setShowSaveTemplateDialog] =
    React.useState(false);
  const [showSaveTemplateInputDialog, setShowSaveTemplateInputDialog] =
    React.useState(false);
  const [templateMenuVisible, setTemplateMenuVisible] = React.useState(false);
  const [templates, setTemplates] = React.useState([]);
  const [selectedTemplate, setSelectedTemplate] = React.useState({});

  const storageKeyMachineryAndEquipments = `machineryAndEquipments$%$${selectedProject?.builderDetails?.builderLabel}$%$${selectedProject?.projectDetails?.projectLabel}$%$${userID}`;

  useEffect(() => {
    const init = async () => {
      const storage =
        (await AsyncStorage.getItem(storageKeyMachineryAndEquipments)) || '[]';
      setTemplates(JSON.parse(storage));
    };
    init();
  }, []);

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

  const {
    status: locationPermissionStatus,
    request: requestLocationPermission,
    dialogVisible: locationPermissionDialogVisible,
  } = useMandatoryPermission(PermissionType.LOCATION);

  const [showLocationDialog, setShowLocationDialog] = useState(
    locationPermissionDialogVisible,
  );

  const {
    control,
    handleSubmit,
    formState: {errors, dirtyFields},
    trigger,
    reset,
    setValue,
    getValues,
    watch,
  } = useForm<FormDataSiteReport>({
    resolver: yupResolver(addSiteReportSchema),
    defaultValues: FormDataSiteReportValue,
  });

  useEffect(() => {
    checkLocationServices();
  }, []);

  const [editMode, setEditMode] = useState(false);
  const [loadingTemperature, setLoadingTemperature] = useState(false);
  const temperature = useSelector(state => state?.temperature?.data);
  const temperatureExpiryDate = useSelector(
    state => state?.temperature?.expiryDate,
  );
  const reduxDispatch = useDispatch();
  const [newTemperature, setNewTemperature] = useState({});

  useEffect(() => {
    const fetchTemperature = async () => {
      try {
        setLoadingTemperature(true);
        const temp = await getTemperature(temperature, temperatureExpiryDate);
        setNewTemperature(temp);
        setLoadingTemperature(false);
      } catch (error) {
        console.error(error);
        setLoadingTemperature(false);
      }
    };
    if (!isEdit) {
      fetchTemperature();
    }
  }, [setValue, isEdit, temperature, temperatureExpiryDate]);

  useEffect(() => {
    if (newTemperature?.data) {
      setValue(
        'weatherCondition.tempMin',
        Math.round(newTemperature.data.tempMin),
      );
      setValue(
        'weatherCondition.tempMax',
        Math.round(newTemperature.data.tempMax),
      );
      setValue('weatherCondition.climateOpt', newTemperature.data.weather);
      setValue('weatherCondition.windSpeed', newTemperature.data.windSpeed);
      setValue('weatherCondition.humidity', newTemperature.data.humidity);
      setValue(
        'weatherCondition.precipitation',
        newTemperature.data.precipitation,
      );
      setValue('weatherCondition.date', newTemperature.data.date);
      setValue('weatherCondition.forecast', newTemperature.data.forecast);
      reduxDispatch(setTemperature(newTemperature));
    }
  }, [newTemperature]);

  const {
    fields: subContractorFields,
    replace: subContractorReplace,
    remove: subContractorRemove,
    append: subContractorAppend,
  } = useFieldArray({
    control,
    name: 'subContractors',
  });

  const {
    fields: workPerformFields,
    replace: workPerformReplace,
    remove: workPerformRemove,
    append: workPerformAppend,
  } = useFieldArray({
    control,
    name: 'workPerformed',
  });

  const {
    fields: machineryAndEquipmentFields,
    replace: machineryAndEquipmentReplace,
    remove: machineryAndEquipmentRemove,
    append: machineryAndEquipmentAppend,
  } = useFieldArray({
    control,
    name: 'machineryAndEquipments',
  });

  const machineAndEquipmentsRef = useRef();

  const isMachineryAndEquipmentsDirty = Object.values(
    dirtyFields?.machineryAndEquipments?.[0] || {},
  ).find(item => item);

  const {
    fields: overTimeDetailFields,
    replace: overTimeDetailsReplace,
    remove: overTimeDetailsRemove,
    append: overTimeDetailsAppend,
  } = useFieldArray({
    control,
    name: 'overTimeDetails',
  });

  useEffect(() => {
    if (isEdit && reportID) {
      setOptions({
        title: 'Update Site Report',
      });
      setEditMode(true);
      if (isEdit && collectiveDataReport) {
        const weatherCondition =
          collectiveDataReport?.weather_condition &&
          JSON.parse(collectiveDataReport?.weather_condition);
        const subContractorsData =
          collectiveDataReport?.sub_contractors &&
          JSON.parse(collectiveDataReport?.sub_contractors);
        const workPerformedData =
          collectiveDataReport?.work_performed &&
          JSON.parse(collectiveDataReport?.work_performed);
        const machineryAndEquipmentsData =
          collectiveDataReport?.machinery_and_equipments &&
          JSON.parse(collectiveDataReport?.machinery_and_equipments);
        const overtimeDetailsData =
          collectiveDataReport?.overtime_details &&
          JSON.parse(collectiveDataReport?.overtime_details);

        if (weatherCondition) {
          setValue('weatherCondition.tempMax', weatherCondition.tempMax);
          setValue('weatherCondition.tempMin', weatherCondition.tempMin);
          setValue('weatherCondition.climateOpt', weatherCondition.climateOpt);
          setValue('weatherCondition.windSpeed', weatherCondition.windSpeed);
          setValue('weatherCondition.humidity', weatherCondition.humidity);
          setValue(
            'weatherCondition.precipitation',
            weatherCondition.precipitation,
          );
          setValue('weatherCondition.date', weatherCondition.date);
          setValue('weatherCondition.forecast', weatherCondition.forecast);
        }

        subContractorsData && subContractorReplace(subContractorsData);
        workPerformedData && workPerformReplace(workPerformedData);
        machineryAndEquipmentsData &&
          machineryAndEquipmentReplace(machineryAndEquipmentsData);
        overtimeDetailsData && overTimeDetailsReplace(overtimeDetailsData);
        setValue(
          'clientInstructionNotes',
          collectiveDataReport.client_instruction,
        );
        setValue('siteMeetingNotes', collectiveDataReport.site_meeting_remarks);
        collectiveDataReport?.documents &&
          setExitingSiteFiles(JSON.parse(collectiveDataReport?.documents));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, reportID, collectiveDataReport]);

  //Executing firms
  const refSubContractorCompany = useRef<RNTextInput>(null);
  const refSubContractorFunction = useRef<RNTextInput>(null);
  const refSubContractorNoOfEmp = useRef<RNTextInput>(null);
  const refSubContractorNoOfWorkingHrs = useRef<RNTextInput>(null);
  const refSubContractorNote = useRef<RNTextInput>(null);

  //Work Performed
  const refWorkAcivity = useRef<RNTextInput>(null);
  const refWorkOwner = useRef<RNTextInput>(null);
  const refWorkNote = useRef<RNTextInput>(null);
  const refVariationNumber = useRef<RNTextInput>(null);
  const refVariationRemarks = useRef<RNTextInput>(null);
  const refDocketNumber = useRef<RNTextInput>(null);

  //Machinery and Equipment
  const refMEName = useRef<RNTextInput>(null);
  const refMETotalNo = useRef<RNTextInput>(null);
  const refMELocationUsed = useRef<RNTextInput>(null);
  const refMENotes = useRef<RNTextInput>(null);

  //Overtime Details
  const refOvertimeName = useRef<RNTextInput>(null);
  const refOvertimeNoWorker = useRef<RNTextInput>(null);
  const refOvertimeTimeOfStart = useRef<RNTextInput>(null);
  const refOvertimeTimeOfFinish = useRef<RNTextInput>(null);
  const refOvertimeWorkingHrs = useRef<RNTextInput>(null);
  const refOvertimeNotes = useRef<RNTextInput>(null);

  //General Remarks
  const refClientInstruction = useRef<RNTextInput>(null);
  const refSiteMeetingNotes = useRef<RNTextInput>(null);

  //Signature Details
  const refSignaturePersonName = useRef<RNTextInput>(null);
  const refSignaturePersonDesignation = useRef<RNTextInput>(null);

  const name = getValues('signature.name');
  const designation = getValues('signature.designation');
  var isEligible = !!(name?.trim() && designation?.trim());

  const handleOpenSignatureModal = () => {
    setSignatureModalVisible(true);
  };

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

  const handleAddComment = async newComment => {
    const now = moment();
    // Format the date and time as per your requirements
    const formattedDateTime = now.format('YYYY-MM-DD HH:mm:ss');
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
      setSelectedSiteCameraFiles(prevFiles => [
        ...prevFiles,
        {
          uri: `file://${markedImage}`,
          type: 'image/jpeg',
          name: `CAMERA_IMG_${timestamp}.jpg`,
        },
      ]);
      setValue('siteCameraFiles', [
        ...selectedSiteCameraFiles,
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
      console.error('Error marking image:', error);
    }
  };

  const handleActivityAddComment = async newComment => {
    const now = moment();
    // Format the date and time as per your requirements
    const formattedDateTime = now.format('DD-MM-YYYY HH:mm:ss');
    const textToPrint = `Address: ${splitTextIntoLines(
      address,
    )}\nDate/Time: ${formattedDateTime}\nActivity No.: ${
      currentActivityID + 1 || '0'
    }\nComments: ${newComment || 'None'}`;
    const options = {
      backgroundImage: {
        src: `file://${cameraActivityImageItem[0]?.uri}`,
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

      setCameraActivityImageItem([
        {
          uri: `file://${markedImage}`,
        },
      ]);
      const updatedCameraFiles = [...selectedSiteActivityCameraFiles];
      updatedCameraFiles[currentActivityID] = [
        ...(updatedCameraFiles?.[currentActivityID] || []),
        {
          uri: `file://${markedImage}`,
          type: 'image/jpeg',
          name: `CAMERA_IMG_${timestamp}.jpg`,
        },
      ];

      setSelectedSiteActivityCameraFiles(updatedCameraFiles);
      setValue(
        `siteActivityCameraFiles.${currentActivityID}`,
        updatedCameraFiles[currentActivityID],
      );
      setCameraImageView(true);
      setCameraModalVisible(false);
      setCommentModalVisible(false);
    } catch (error) {
      console.error('Error marking image:', error);
    }
  };

  const openCameraModule = async () => {
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
    return;
  };

  const triggerTakePhoto = async (
    actionType = 'general',
    activityIndex = 0,
  ) => {
    const totalFilesForGeneral =
      (exitingSiteFiles?.length || 0) +
      (selectedSiteCameraFiles?.length || 0) +
      (selectedSiteFiles?.length || 0);

    const totalFilesForActivity =
      (selectedSiteActivityCameraFiles?.[activityIndex]?.length || 0) +
      (selectedSiteActivityFiles?.[activityIndex]?.length || 0);
    // if (
    //   (actionType === 'general' && totalFilesForGeneral < 5) ||
    //   (actionType === 'activity' && totalFilesForActivity < 2)
    // ) {
    //   setCameraImageType(actionType);
    //   setCurrentActivityID(activityIndex);
    //   return await openCameraModule();
    // } else {
    //   setReportDialog(true);
    //   setReportDescription(
    //     `File Limit Exceeded, You can select/upload a maximum of ${
    //       actionType === 'general' ? '5 files.' : '2 files for each activity.'
    //     }`,
    //   );
    // }
    setCameraImageType(actionType);
    setCurrentActivityID(activityIndex);
    return await openCameraModule();
  };

  const addNewSiteReport = async (formData: FormDataSiteReport) => {
    const signatureInfo: any = await AsyncStorage.getItem('signatureImage');
    const signatureAddObj = signatureInfo
      ? signatureInfo
      : {name: '', designation: '', value: ''};
    try {
      const formDataFile = new FormData();
      formDataFile.append('userID', userID ?? 0);
      formDataFile.append('reportDate', moment().format('YYYY-MM-DD HH:mm:ss'));
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
      formDataFile.append(
        'weatherCondition',
        JSON.stringify(formData?.weatherCondition),
      );
      formDataFile.append(
        'subContractors',
        JSON.stringify(formData?.subContractors),
      );
      formDataFile.append(
        'workPerformed',
        JSON.stringify(formData?.workPerformed),
      );
      formDataFile.append(
        'machineryAndEquipments',
        JSON.stringify(formData?.machineryAndEquipments),
      );
      formDataFile.append(
        'overTimeDetails',
        JSON.stringify(formData?.overTimeDetails),
      );
      formDataFile.append(
        'clientInstructionNotes',
        formData?.clientInstructionNotes,
      );
      formDataFile.append('signature', signatureAddObj);
      formDataFile.append('siteMeetingNotes', formData?.siteMeetingNotes);
      formDataFile.append('createdAt', moment().format('YYYY-MM-DD HH:mm:ss'));
      const siteFilesFormat = formData?.siteFiles;
      if (siteFilesFormat && siteFilesFormat?.length > 0) {
        siteFilesFormat?.forEach?.((file, index) => {
          formDataFile.append(`siteFiles[${index}]`, file);
        });
      }

      const siteCameraFilesFormat = formData?.siteCameraFiles;
      if (siteCameraFilesFormat && siteCameraFilesFormat.length > 0) {
        siteCameraFilesFormat?.forEach?.((file, index) => {
          formDataFile.append(`siteCameraFiles[${index}]`, file);
        });
      }

      const siteActivityFilesFormat = formData?.siteActivityFiles;
      if (siteActivityFilesFormat && siteActivityFilesFormat?.length > 0) {
        siteActivityFilesFormat?.forEach((activityFiles, activityIndex) => {
          if (activityFiles && activityFiles.length > 0) {
            activityFiles.forEach((file, fileIndex) => {
              formDataFile.append(
                `siteActivityFiles[${activityIndex}][${fileIndex}]`,
                file,
              );
            });
          }
        });
      }

      const siteActivityCameraFilesFormat = formData?.siteActivityCameraFiles;
      if (
        siteActivityCameraFilesFormat &&
        siteActivityCameraFilesFormat.length > 0
      ) {
        siteActivityCameraFilesFormat.forEach(
          (activityFiles, activityIndex) => {
            if (activityFiles && activityFiles.length > 0) {
              activityFiles.forEach((file, fileIndex) => {
                formDataFile.append(
                  `siteActivityCameraFiles[${activityIndex}][${fileIndex}]`,
                  file,
                );
              });
            }
          },
        );
      }

      const siteReport = await addSiteReport(formDataFile).unwrap();
      if (siteReport?.status === STATUS_HTTP_CODE.SUCCESS) {
        setSiteError(false);
        setSuccessRecord(true);
        console.log('add new site report success', `${siteReport?.status}`, formDataFile);
        reset();
      } else {
        setSiteError(true);
        setSiteErrorMsg(siteReport?.message ?? STATUS_MESSAGE.UNKNOWN1);
        console.log('add new site report', `api failed with status code ${siteReport?.status}`, formDataFile);
      }
    } catch (error: any) {
      setSiteError(true);
      setSiteErrorMsg(error?.message ?? STATUS_MESSAGE.UNKNOWN);
      console.log('add new site report', error);
    }
  };

  const updateSiteReportCall = async (formData: FormDataSiteReport) => {
    let signatureInfo: any = await AsyncStorage.getItem('signatureImage');
    signatureInfo = signatureInfo
      ? signatureInfo
      : {name: '', designation: '', value: ''};
    try {
      const formDataFile = new FormData();
      formDataFile.append('reportID', reportID ?? 0);
      formDataFile.append('userID', userID ?? 0);
      formDataFile.append(
        'projectID',
        Number(selectedProject?.projectDetails?.projectID) ?? 0,
      );
      formDataFile.append(
        'projectTaskID',
        Number(selectedProject?.taskDetails?.taskID) ?? 0,
      );
      formDataFile.append(
        'clientInstructionNotes',
        formData?.clientInstructionNotes,
      );
      formDataFile.append('siteMeetingNotes', formData?.siteMeetingNotes);
      formDataFile.append(
        'weatherCondition',
        JSON.stringify(formData?.weatherCondition),
      );
      formDataFile.append(
        'subContractors',
        JSON.stringify(formData?.subContractors),
      );
      formDataFile.append(
        'workPerformed',
        JSON.stringify(formData?.workPerformed),
      );
      formDataFile.append(
        'machineryAndEquipments',
        JSON.stringify(formData?.machineryAndEquipments),
      );
      formDataFile.append(
        'overTimeDetails',
        JSON.stringify(formData?.overTimeDetails),
      );

      formDataFile.append('signature', signatureInfo);

      formDataFile.append('modifiedAt', moment().format('YYYY-MM-DD HH:mm:ss'));

      const siteFilesFormat = formData?.siteFiles;
      if (siteFilesFormat && siteFilesFormat.length > 0) {
        siteFilesFormat?.forEach?.((file, index) => {
          formDataFile.append(`siteFiles[${index}]`, file);
        });
      }

      const siteCameraFilesFormat = formData?.siteCameraFiles;
      if (siteCameraFilesFormat && siteCameraFilesFormat.length > 0) {
        siteCameraFilesFormat?.forEach?.((file, index) => {
          formDataFile.append(`siteCameraFiles[${index}]`, file);
        });
      }

      const siteActivityFilesFormat = formData?.siteActivityFiles;
      if (siteActivityFilesFormat && siteActivityFilesFormat?.length > 0) {
        siteActivityFilesFormat?.forEach((activityFiles, activityIndex) => {
          if (activityFiles && activityFiles.length > 0) {
            activityFiles.forEach((file, fileIndex) => {
              formDataFile.append(
                `siteActivityFiles[${activityIndex}][${fileIndex}]`,
                file,
              );
            });
          }
        });
      }

      const siteActivityCameraFilesFormat = formData?.siteActivityCameraFiles;
      if (
        siteActivityCameraFilesFormat &&
        siteActivityCameraFilesFormat.length > 0
      ) {
        siteActivityCameraFilesFormat.forEach(
          (activityFiles, activityIndex) => {
            if (activityFiles && activityFiles.length > 0) {
              activityFiles.forEach((file, fileIndex) => {
                formDataFile.append(
                  `siteActivityCameraFiles[${activityIndex}][${fileIndex}]`,
                  file,
                );
              });
            }
          },
        );
      }

      const siteReport = await updateSiteReport(formDataFile).unwrap();
      if (siteReport?.status === STATUS_HTTP_CODE.SUCCESS) {
        setSiteError(false);
        setSuccessRecord(true);
        console.log('update site report success', `${siteReport?.status}`, formDataFile);
        reset();
      } else {
        setSiteError(true);
        setSiteErrorMsg(siteReport?.message ?? STATUS_MESSAGE.UNKNOWN1);
        console.log('update site report', `api failed with status code ${siteReport?.status}`, formDataFile);
      }
    } catch (error: any) {
      setSiteError(true);
      setSiteErrorMsg(error?.message ?? STATUS_MESSAGE.UNKNOWN);
      console.log('update site report', error);
    }
  };

  const actionCall = isEdit ? updateSiteReportCall : addNewSiteReport;

  const pickDocument = async (actionType = 'general', activityIndex = 0) => {
    try {
      const result = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.images,
          // DocumentPicker.types.xlsx,
          DocumentPicker.types.pdf,
          // DocumentPicker.types.pptx,
        ],
        allowMultiSelection: true,
      });

      const validFiles =
        result &&
        result.length > 0 &&
        result.filter(file => file?.size <= 5097152);

      const existingGenCount = exitingSiteFiles?.filter(
        item => item?.document_activity === 0,
      )?.length;
      const totalFilesForGeneral =
        (existingGenCount || 0) +
        (selectedSiteCameraFiles?.length || 0) +
        (selectedSiteFiles?.length || 0) +
        validFiles?.length;

      const totalFilesForActivity =
        (selectedSiteActivityCameraFiles?.[activityIndex]?.length || 0) +
        (selectedSiteActivityFiles?.[activityIndex]?.length || 0) +
        validFiles?.length;
      if (validFiles && validFiles?.length === 0) {
        setReportDialog(true);
        setReportDescription(
          'File Size Limit Exceeded, Some selected files exceed the 5 MB limit. Please select smaller files.',
        );
        // } else if (
        //   (actionType === 'general' && totalFilesForGeneral > 5) ||
        //   (actionType === 'activity' && totalFilesForActivity > 2)
        // ) {
        //   setReportDialog(true);
        //   setReportDescription(
        //     `File Limit Exceeded, You can select/upload a maximum of ${
        //       actionType === 'general' ? '5 files.' : '2 files for each activity.'
        //     }`,
        //   );
      } else if (
        validFiles &&
        validFiles?.length > 0 &&
        validFiles?.length === result.length
      ) {
        if (actionType === 'general') {
          setSelectedSiteFiles(prevFiles => [...prevFiles, ...validFiles]);
          setValue('siteFiles', [...selectedSiteFiles, ...validFiles]);
        } else if (actionType === 'activity') {
          const updatedActivityFiles = [...selectedSiteActivityFiles];
          updatedActivityFiles[activityIndex] = [
            ...(updatedActivityFiles?.[activityIndex] || []),
            ...validFiles,
          ];

          // Update the state for the specific activity
          setSelectedSiteActivityFiles(updatedActivityFiles);

          // Set the value for the specific activity
          setValue(
            `siteActivityFiles.${activityIndex}`,
            updatedActivityFiles[activityIndex],
          );
        }
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

  const removeFile = (index, type = 'siteFiles') => {
    if (type === 'siteFiles') {
      setSelectedSiteFiles(prevFiles =>
        prevFiles.filter((file, i) => i !== index),
      );
    } else {
      setSelectedSiteCameraFiles(prevFiles =>
        prevFiles.filter((file, i) => i !== index),
      );
    }
    setValue(
      type,
      getValues(type).filter((_, i) => i !== index),
    );
  };

  const removeActivityFile = (
    activityIndex: number,
    fileIndex: any,
    type = 'siteActivityFiles',
  ) => {
    if (type === 'siteActivityFiles') {
      setSelectedSiteActivityFiles(prevFiles =>
        prevFiles.map((activity, i) =>
          i === activityIndex
            ? activity.filter((file, j) => j !== fileIndex)
            : activity,
        ),
      );
    } else {
      setSelectedSiteActivityCameraFiles(prevFiles =>
        prevFiles.map((activity, i) =>
          i === activityIndex
            ? activity.filter((file, j) => j !== fileIndex)
            : activity,
        ),
      );
    }

    setValue(
      type,
      getValues(type).map((activity, i) =>
        i === activityIndex
          ? activity.filter((_, j) => j !== fileIndex)
          : activity,
      ),
    );
  };

  const deleteDocuReport = async () => {
    setDeleteDocuDialog(false);
    try {
      const payload = await deleteSiteReportDocument({
        reportID: reportID ?? 0,
        documentID: currentReportDocuID ?? 0,
      }).unwrap();
      if (payload?.status === STATUS_HTTP_CODE.SUCCESS) {
        setExitingSiteFiles(
          exitingSiteFiles?.filter(
            item => item?.document_id !== currentReportDocuID,
          ),
        );
        setSiteToast(true);
        setSiteToastMessage('The site report document has been deleted.');
      } else {
        setSiteToast(true);
        setSiteToastMessage('Unable to delete the site report document.');
      }
    } catch (error: any) {
      setSiteToast(true);
      setSiteToastMessage('Unable to delete the site report document.');
    }
  };

  const deleteActivityDocuReport = async () => {
    setDeleteActivityDocuDialog(false);
    try {
      const activityFileAvailable =
        exitingSiteFiles?.filter(
          item => item?.document_activity === removeActivityID,
        )?.length || 0;

      const allActivityFileAvailable =
        exitingSiteFiles?.filter(item => item?.document_activity !== 0)
          ?.length || 0;

      if (removeActivityID > 0 && activityFileAvailable === 0) {
        workPerformRemove(removeActivityID - 1);
        setValue(`siteActivityCameraFiles.${removeActivityID - 1}`, []);
        setValue(`siteActivityFiles.${removeActivityID - 1}`, []);
      } else if (removeActivityID === 0 && allActivityFileAvailable === 0) {
        setValue('siteActivityCameraFiles', []);
        setValue('siteActivityFiles', []);
        workPerformRemove();
      } else {
        const payload = await deleteSiteReportActivityDocument({
          reportID: reportID ?? 0,
          activityID: removeActivityID ?? 0,
        }).unwrap();
        if (payload?.status === STATUS_HTTP_CODE.SUCCESS) {
          if (removeActivityID === 0) {
            setExitingSiteFiles(
              exitingSiteFiles?.filter(item => item?.activity_id === 0),
            );
            workPerformRemove();
          } else {
            setExitingSiteFiles(
              exitingSiteFiles?.filter(
                item => item?.activity_id !== removeActivityID,
              ),
            );
            workPerformRemove(removeActivityID - 1);
          }

          setSiteToast(true);
          setSiteToastMessage(
            'The site activity report document has been deleted.',
          );
        } else {
          setSiteToast(true);
          setSiteToastMessage(
            'Unable to delete the site activity report document.',
          );
        }
      }
    } catch (error: any) {
      setSiteToast(true);
      setSiteToastMessage(
        'Unable to delete the site activity report document.',
      );
    }
  };

  const handleRadioChange = (fieldIndex, value) => {
    setValue(`workPerformed.[${fieldIndex}].activityType`, value);
  };

  const handleReset = () => {
    signatureRef?.current?.resetImage();
    setValue('signature.value', '');
    setValue('signature.name', '');
    setValue('signature.designation', '');
  };

  const handleSignatureSave = () => {
    signatureRef.current?.saveImage();

    // const signObj = {
    //   name: values?.name,
    //   designation: values?.designation,
    //   value: signValue,
    // };
    // setAddedSignature(true);
    // console.log(JSON.stringify(signObj));
    // AsyncStorage.setItem('signatureImage', JSON.stringify(signObj));
  };

  const onSaveEvent = result => {
    const name = getValues('signature.name');
    const designation = getValues('signature.designation');
    const signObj = {
      name,
      designation,
      value: result.encoded,
    };
    setAddedSignature(true);
    AsyncStorage.setItem('signatureImage', JSON.stringify(signObj));
  };

  const clientInstValue: any = getValues('clientInstructionNotes');

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
                } the site report.`}
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
                    style={{backgroundColor: darkColor.colors.secondary}}
                    icon="office-building-marker"
                  />
                )}
                title={`${selectedProject?.builderDetails?.builderLabel}`}
                subtitle={`Details: ${selectedProject?.projectDetails?.projectLabel} -> ${selectedProject?.taskDetails?.taskLabel}`}
                titleStyle={[ItemSpaceTen.spaceTenTopMargin]}
                subtitleStyle={[ItemSpaceTen.spaceTenMarginBottom]}
                subtitleNumberOfLines={2}
              />
            </Card>
            {siteError && (
              <Card mode="contained" style={{marginBottom: 5}}>
                <Card.Content>
                  <Text
                    variant="bodyMedium"
                    style={{color: darkColor.colors.error}}>
                    {siteErrorMsg}
                  </Text>
                </Card.Content>
              </Card>
            )}
            {isCollectiveDataReportLoading || loadingTemperature ? (
              <ActivityIndicator animating={true} />
            ) : (
              <Surface elevation={5} style={styles.surface}>
                <MultistepFlow
                  onFinish={handleSubmit(actionCall)}
                  onCancel={goBack}>
                  <Step
                    title="Weather condition*"
                    onNext={() => {
                      return true;
                    }}
                    backOk={false}>
                    <View style={RowSpaceBtwStyle.rowSpaceBtw}>
                      <InputField
                        label="Temperature Min."
                        modeType="flat"
                        controllerProps={{
                          name: 'weatherCondition.tempMin',
                          control,
                        }}
                        overrideStyle={{width: '47%', pointerEvents: 'none'}}
                      />
                      <InputField
                        label="Temperature Max."
                        modeType="flat"
                        controllerProps={{
                          name: 'weatherCondition.tempMax',
                          control,
                        }}
                        overrideStyle={{width: '47%', pointerEvents: 'none'}}
                      />
                    </View>
                    <SpaceSeparator size={3} />
                    <InputField
                      label="Weather"
                      modeType="flat"
                      controllerProps={{
                        name: 'weatherCondition.climateOpt',
                        control,
                      }}
                      overrideStyle={{pointerEvents: 'none'}}
                    />
                    <SpaceSeparator size={5} />
                    <View style={RowSpaceBtwStyle.rowSpaceBtw}>
                      <InputField
                        label="Precipitation (mm)"
                        modeType="flat"
                        controllerProps={{
                          name: 'weatherCondition.precipitation',
                          control,
                        }}
                        overrideStyle={{width: '47%', pointerEvents: 'none'}}
                      />
                      <InputField
                        label="Humidity %"
                        modeType="flat"
                        controllerProps={{
                          name: 'weatherCondition.humidity',
                          control,
                        }}
                        overrideStyle={{width: '47%', pointerEvents: 'none'}}
                      />
                    </View>
                    <SpaceSeparator size={5} />
                    <InputField
                      label="Wind Speed (km/hr)"
                      modeType="flat"
                      controllerProps={{
                        name: 'weatherCondition.windSpeed',
                        control,
                      }}
                      overrideStyle={{pointerEvents: 'none'}}
                    />
                    <SpaceSeparator size={5} />
                    <Text variant="titleMedium">Daily snapshots*</Text>
                    <SpaceSeparator size={10} />
                    <Controller
                      render={({field}) =>
                        field?.value?.map(item => (
                          <View
                            style={[
                              RowSpaceBtwStyle.rowSpaceBtw,
                              {marginBottom: 15},
                            ]}>
                            <Text style={{flex: 1.4}}>{item.date}</Text>
                            <Text style={{flex: 1, textAlign: 'left'}}>
                              {item.weather}
                            </Text>
                            <Text style={{flex: 1, textAlign: 'right'}}>
                              {item.temp} &#8451;
                            </Text>
                          </View>
                        ))
                      }
                      name="weatherCondition.forecast"
                      control={control}
                    />
                    <SpaceSeparator size={5} />
                    <Controller
                      render={({field}) => (
                        <Text variant="bodySmall">
                          *The values displayed in this screen are obtained from{' '}
                          <Text
                            variant="bodySmall"
                            style={{textDecorationLine: 'underline'}}>
                            openweathermap.org
                          </Text>{' '}
                          at {field?.value?.toString()}
                        </Text>
                      )}
                      name="weatherCondition.date"
                      control={control}
                    />
                  </Step>
                  <Step
                    title="Name of Sub Contractors"
                    onSkip={() => subContractorRemove()}
                    onNext={async () => {
                      const result = await trigger(['subContractors']);
                      return result;
                    }}
                    required={false}>
                    {subContractorFields.map((field, index) => {
                      return (
                        <View key={field.id}>
                          <View style={RowSpaceBtwStyle.rowSpaceBtw}>
                            <Text
                              variant="titleMedium"
                              style={AlignCenterStyles.alignItemCenter}>
                              Sub Contractor #{index + 1}
                            </Text>
                            <Button
                              mode="text"
                              compact
                              onPress={() => subContractorRemove(index)}>
                              Remove
                            </Button>
                          </View>
                          <InputField
                            ref={refSubContractorCompany}
                            label="Company"
                            modeType="flat"
                            controllerProps={{
                              name: `subContractors.${index}.contractorCompany`,
                              control,
                            }}
                            updateValue={setValue}
                            prePopulatedOption={PREPOPULATED_SUB_CONTRACTORS}
                            inputProps={{
                              placeholder: 'Enter the company',
                              keyboardType: 'default',
                              onSubmitEditing: () =>
                                refSubContractorFunction.current?.focus(),
                              returnKeyType: 'next',
                            }}
                            errorMessage={
                              errors.subContractors?.[index]?.contractorCompany
                                ?.message
                            }
                          />
                          <InputField
                            ref={refSubContractorFunction}
                            label="Function"
                            modeType="flat"
                            controllerProps={{
                              name: `subContractors.${index}.contractorFunction`,
                              control,
                            }}
                            inputProps={{
                              placeholder: 'Enter function item',
                              keyboardType: 'default',
                              onSubmitEditing: () =>
                                refSubContractorNoOfEmp.current?.focus(),
                              returnKeyType: 'next',
                            }}
                            errorMessage={
                              errors.subContractors?.[index]?.contractorFunction
                                ?.message
                            }
                          />
                          <View style={RowSpaceBtwStyle.rowSpaceBtw}>
                            <InputField
                              ref={refSubContractorNoOfEmp}
                              label="Number of workers"
                              modeType="flat"
                              controllerProps={{
                                name: `subContractors.${index}.contractorTotalEmp`,
                                control,
                              }}
                              inputProps={{
                                // placeholder: 'Enter total number',
                                keyboardType: 'numeric',
                                onSubmitEditing: () =>
                                  refSubContractorNoOfWorkingHrs.current?.focus(),
                                returnKeyType: 'next',
                              }}
                              errorMessage={
                                errors.subContractors?.[index]
                                  ?.contractorTotalEmp?.message
                              }
                              overrideStyle={{width: '47%'}}
                            />
                            <InputField
                              ref={refSubContractorNoOfWorkingHrs}
                              label="Working hours"
                              modeType="flat"
                              keyboardType="numeric"
                              controllerProps={{
                                name: `subContractors.${index}.contractorTotalWorkingHrs`,
                                control,
                              }}
                              inputProps={{
                                placeholder: 'Enter no. of working hours',
                                keyboardType: 'numeric',
                                onSubmitEditing: () =>
                                  refSubContractorNote.current?.focus(),
                                returnKeyType: 'next',
                              }}
                              errorMessage={
                                errors.subContractors?.[index]
                                  ?.contractorTotalWorkingHrs?.message
                              }
                              overrideStyle={{width: '47%'}}
                            />
                          </View>
                          <InputField
                            ref={refSubContractorNote}
                            label="Notes"
                            controllerProps={{
                              name: `subContractors.${index}.contractorNotes`,
                              control,
                            }}
                            inputProps={{
                              placeholder: 'Enter your notes',
                              keyboardType: 'default',
                              // onSubmitEditing: () => refPassword.current?.focus(),
                              returnKeyType: 'done',
                              scrollEnabled: false,
                              multiline: true,
                              scrollEnabled: false,
                              numberOfLines: 4,
                            }}
                            errorMessage={
                              errors.subContractors?.[index]?.contractorNotes
                                ?.message
                            }
                          />
                        </View>
                      );
                    })}
                    <Button
                      mode="outlined"
                      compact
                      onPress={() => subContractorAppend(contractorFirmVal)}>
                      + Add new
                    </Button>
                  </Step>
                  <Step
                    title="Work Performed/Progress"
                    onSkip={() => {
                      if (isEdit) {
                        setRemoveActivityID(0);
                        setDeleteActivityDocuDialog(true);
                      } else {
                        workPerformRemove();
                      }
                    }}
                    onNext={async () => {
                      const result = await trigger(['workPerformed']);
                      return result;
                    }}
                    required={false}>
                    {workPerformFields.map((field, index) => {
                      const workPerformedEntry = watch(
                        `workPerformed.[${index}].activityType`,
                      );
                      const siteActivityCameraFiles = watch(
                        `siteActivityCameraFiles.${index}`,
                        [],
                      );
                      const siteActivityFiles = watch(
                        `siteActivityFiles.${index}`,
                        [],
                      );
                      return (
                        <View key={field.id}>
                          <View style={RowSpaceBtwStyle.rowSpaceBtw}>
                            <Text
                              variant="titleMedium"
                              style={AlignCenterStyles.alignItemCenter}>
                              Activity #{index + 1}
                            </Text>
                            <Button
                              mode="text"
                              compact
                              onPress={() => {
                                if (isEdit) {
                                  setRemoveActivityID(index + 1);
                                  setDeleteActivityDocuDialog(true);
                                } else {
                                  workPerformRemove(index);
                                }
                              }}>
                              Remove
                            </Button>
                          </View>
                          <InputField
                            ref={refWorkAcivity}
                            label="Activity Name"
                            modeType="flat"
                            controllerProps={{
                              name: `workPerformed.${index}.activityName`,
                              control,
                            }}
                            inputProps={{
                              placeholder: 'Enter the activity name',
                              keyboardType: 'default',
                              onSubmitEditing: () =>
                                refWorkOwner.current?.focus(),
                              returnKeyType: 'next',
                            }}
                            errorMessage={
                              errors.workPerformed?.[index]?.activityName
                                ?.message
                            }
                          />
                          <InputField
                            ref={refWorkOwner}
                            label="Number of workers"
                            modeType="flat"
                            controllerProps={{
                              name: `workPerformed.${index}.workerCount`,
                              control,
                            }}
                            inputProps={{
                              placeholder: 'Enter worker count',
                              keyboardType: 'numeric',
                              onSubmitEditing: () =>
                                refWorkNote.current?.focus(),
                              returnKeyType: 'next',
                            }}
                            errorMessage={
                              errors.workPerformed?.[index]?.workerCount
                                ?.message
                            }
                          />
                          <Text variant="bodyLarge">
                            Select an Activity Type:
                          </Text>
                          <RadioButton.Group
                            onValueChange={value =>
                              handleRadioChange(index, value)
                            }
                            value={workPerformedEntry || 'other'}>
                            {WORK_ACTIVITY_TYPE.map(option => (
                              <View
                                key={option.value}
                                style={styles.radioButtonContainer}>
                                <RadioButton.Item
                                  label={option.label}
                                  value={option.value}
                                />
                              </View>
                            ))}
                          </RadioButton.Group>
                          {workPerformedEntry &&
                            workPerformedEntry === 'variation_works' && (
                              <>
                                <InputField
                                  ref={refVariationNumber}
                                  label="Variation Number"
                                  modeType="flat"
                                  controllerProps={{
                                    name: `workPerformed.${index}.variationNumber`,
                                    control,
                                  }}
                                  inputProps={{
                                    placeholder: 'Enter the variation number',
                                    keyboardType: 'default',
                                    onSubmitEditing: () =>
                                      refVariationRemarks.current?.focus(),
                                    returnKeyType: 'next',
                                  }}
                                  errorMessage={
                                    errors.workPerformed?.[index]
                                      ?.variationNumber?.message
                                  }
                                />
                                <InputField
                                  ref={refVariationRemarks}
                                  label="Variation Remarks"
                                  controllerProps={{
                                    name: `workPerformed.${index}.variationRemarks`,
                                    control,
                                  }}
                                  inputProps={{
                                    placeholder: 'Enter the variation remarks',
                                    keyboardType: 'default',
                                    returnKeyType: 'next',
                                    onSubmitEditing: () =>
                                      refWorkNote.current?.focus(),
                                    multiline: true,
                                    scrollEnabled: false,
                                    numberOfLines: 4,
                                  }}
                                  errorMessage={
                                    errors.workPerformed?.[index]
                                      ?.variationRemarks?.message
                                  }
                                />
                              </>
                            )}
                          {workPerformedEntry &&
                            workPerformedEntry === 'day_works' && (
                              <>
                                <InputField
                                  ref={refDocketNumber}
                                  label="Docket Number"
                                  modeType="flat"
                                  controllerProps={{
                                    name: `workPerformed.${index}.docketNumber`,
                                    control,
                                  }}
                                  inputProps={{
                                    placeholder: 'Enter the docket number',
                                    keyboardType: 'default',
                                    onSubmitEditing: () =>
                                      refWorkNote.current?.focus(),
                                    returnKeyType: 'next',
                                  }}
                                  errorMessage={
                                    errors.workPerformed?.[index]?.docketNumber
                                      ?.message
                                  }
                                />
                              </>
                            )}
                          <InputField
                            ref={refWorkNote}
                            label="Remarks"
                            controllerProps={{
                              name: `workPerformed.${index}.workNotes`,
                              control,
                            }}
                            inputProps={{
                              placeholder: 'Enter your notes',
                              keyboardType: 'default',
                              returnKeyType: 'done',
                              multiline: true,
                              scrollEnabled: false,
                              numberOfLines: 4,
                            }}
                            errorMessage={
                              errors.workPerformed?.[index]?.workNotes?.message
                            }
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
                                  onPress={() =>
                                    triggerTakePhoto('activity', index)
                                  }
                                  loading={cameraLoading}>
                                  Open Camera
                                </Button>
                                <List.Section>
                                  {siteActivityCameraFiles?.map(
                                    (file, fileIndex) => (
                                      <List.Item
                                        key={fileIndex}
                                        titleNumberOfLines={1}
                                        title={file.name}
                                        style={{paddingBottom: 0}}
                                        left={() => <List.Icon icon="image" />}
                                        right={() => (
                                          <IconButton
                                            icon="close"
                                            size={16}
                                            onPress={() =>
                                              removeActivityFile(
                                                index,
                                                fileIndex,
                                                'siteActivityCameraFiles',
                                              )
                                            }
                                          />
                                        )}
                                      />
                                    ),
                                  )}
                                </List.Section>
                              </>
                            )}
                            name={`siteActivityCameraFiles.${index}`}
                          />
                          <Text
                            variant="titleSmall"
                            style={{paddingBottom: 10, paddingTop: 5}}>
                            Document Upload
                          </Text>
                          <Controller
                            control={control}
                            render={({field}) => (
                              <>
                                <Button
                                  mode="outlined"
                                  onPress={() =>
                                    pickDocument('activity', index)
                                  }>
                                  Upload a Image/PDF Document
                                </Button>
                                <List.Section>
                                  {siteActivityFiles?.map?.(
                                    (file, fileIndex) => (
                                      <List.Item
                                        key={fileIndex}
                                        title={file.name}
                                        style={{paddingBottom: 0}}
                                        left={() => <List.Icon icon="file" />}
                                        right={() => (
                                          <IconButton
                                            icon="close"
                                            color="red"
                                            size={16}
                                            onPress={() =>
                                              removeActivityFile(
                                                index,
                                                fileIndex,
                                                'siteActivityFiles',
                                              )
                                            }
                                          />
                                        )}
                                      />
                                    ),
                                  )}
                                </List.Section>
                                {exitingSiteFiles &&
                                  exitingSiteFiles?.filter(
                                    item =>
                                      item?.document_activity === index + 1,
                                  )?.length > 0 && (
                                    <List.Section title="Existing Files">
                                      {exitingSiteFiles
                                        .filter(
                                          item =>
                                            item?.document_activity ===
                                            index + 1,
                                        )
                                        .map((file, index) => (
                                          <List.Item
                                            key={index}
                                            title={file?.document_name
                                              ?.split('_')
                                              ?.slice(5)
                                              ?.join('_')}
                                            style={{
                                              marginVertical: 0,
                                              paddingVertical: 0,
                                            }}
                                            left={() => (
                                              <List.Icon
                                                icon={`${
                                                  isImageType(
                                                    file?.document_name,
                                                  )
                                                    ? 'image'
                                                    : 'file-document'
                                                }`}
                                              />
                                            )}
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
                            name={`siteActivityFiles.${index}`}
                          />
                        </View>
                      );
                    })}
                    <Button
                      mode="outlined"
                      compact
                      onPress={() => workPerformAppend(workPerformedVal)}>
                      + Add new
                    </Button>
                  </Step>
                  <Step
                    ref={machineAndEquipmentsRef}
                    title="Machinery and Equipments"
                    onSkip={() => machineryAndEquipmentRemove()}
                    onNext={async () => {
                      const result = await trigger(['machineryAndEquipments']);
                      if (result && isMachineryAndEquipmentsDirty) {
                        if (
                          !isArraysEqual(
                            selectedTemplate,
                            getValues('machineryAndEquipments'),
                          )
                        ) {
                          setShowSaveTemplateDialog(true);
                          return false;
                        }
                        return true;
                      } else {
                        return result;
                      }
                    }}
                    required={false}>
                    {templates?.length > 0 && (
                      <Menu
                        visible={templateMenuVisible}
                        onDismiss={() => setTemplateMenuVisible(false)}
                        anchor={
                          <Button
                            labelStyle={{
                              marginVertical: 4,
                              marginHorizontal: 5,
                            }}
                            onPress={() => setTemplateMenuVisible(true)}
                            style={{alignSelf: 'flex-start'}}>
                            Autofill from existing template?
                          </Button>
                        }>
                        {templates?.map((option: any, index) => (
                          <Menu.Item
                            key={index}
                            onPress={() => {
                              setValue('machineryAndEquipments', option.values);
                              setSelectedTemplate(option.values);
                              setTemplateMenuVisible(false);
                            }}
                            title={option.name}
                          />
                        ))}
                      </Menu>
                    )}
                    {machineryAndEquipmentFields.map((field, index) => {
                      return (
                        <View key={field.id}>
                          <View style={RowSpaceBtwStyle.rowSpaceBtw}>
                            <Text
                              variant="titleMedium"
                              style={AlignCenterStyles.alignItemCenter}>
                              M & E #{index + 1}
                            </Text>
                            <Button
                              mode="text"
                              compact
                              onPress={() =>
                                machineryAndEquipmentRemove(index)
                              }>
                              Remove
                            </Button>
                          </View>
                          <InputField
                            ref={refMEName}
                            label="Name of Machinery / Equipment"
                            modeType="flat"
                            controllerProps={{
                              name: `machineryAndEquipments.${index}.machineryAndEquipmentName`,
                              control,
                            }}
                            updateValue={setValue}
                            prePopulatedOption={PREPOPULATED_MACHINERY_NAMES}
                            inputProps={{
                              placeholder:
                                'Enter name of machinery / equipment',
                              keyboardType: 'default',
                              onSubmitEditing: () =>
                                refMETotalNo.current?.focus(),
                              returnKeyType: 'next',
                            }}
                            errorMessage={
                              errors.machineryAndEquipments?.[index]
                                ?.machineryAndEquipmentName?.message
                            }
                          />
                          <InputField
                            ref={refMETotalNo}
                            label="Total Number"
                            modeType="flat"
                            controllerProps={{
                              name: `machineryAndEquipments.${index}.machineryAndEquipmentNumber`,
                              control,
                            }}
                            inputProps={{
                              placeholder: 'Enter the total number',
                              keyboardType: 'numeric',
                              onSubmitEditing: () =>
                                refMELocationUsed.current?.focus(),
                              returnKeyType: 'next',
                            }}
                            errorMessage={
                              errors.machineryAndEquipments?.[index]
                                ?.machineryAndEquipmentNumber?.message
                            }
                          />
                          <InputField
                            ref={refMELocationUsed}
                            label="Location Used"
                            modeType="flat"
                            controllerProps={{
                              name: `machineryAndEquipments.${index}.machineryAndEquipmentLocationUsed`,
                              control,
                            }}
                            inputProps={{
                              // placeholder: 'Enter total number',
                              keyboardType: 'default',
                              onSubmitEditing: () =>
                                refMENotes.current?.focus(),
                              returnKeyType: 'next',
                            }}
                            errorMessage={
                              errors.machineryAndEquipments?.[index]
                                ?.machineryAndEquipmentLocationUsed?.message
                            }
                          />
                          <InputField
                            ref={refMENotes}
                            label="Notes"
                            controllerProps={{
                              name: `machineryAndEquipments.${index}.machineryAndEquipmentNotes`,
                              control,
                            }}
                            inputProps={{
                              placeholder: 'Enter your notes',
                              keyboardType: 'default',
                              // onSubmitEditing: () => refPassword.current?.focus(),
                              returnKeyType: 'done',
                              multiline: true,
                              scrollEnabled: false,
                              numberOfLines: 4,
                            }}
                            errorMessage={
                              errors.machineryAndEquipments?.[index]
                                ?.machineryAndEquipmentNotes?.message
                            }
                          />
                        </View>
                      );
                    })}
                    <Button
                      mode="outlined"
                      compact
                      onPress={() =>
                        machineryAndEquipmentAppend(machineryAndEquipmentVal)
                      }>
                      + Add new
                    </Button>
                  </Step>
                  <Step
                    title="Overtime Details"
                    onSkip={() => overTimeDetailsRemove()}
                    onNext={async () => {
                      const result = await trigger(['overTimeDetails']);
                      return result;
                    }}
                    required={false}>
                    {overTimeDetailFields.map((field, index) => {
                      return (
                        <View key={field.id}>
                          <View style={RowSpaceBtwStyle.rowSpaceBtw}>
                            <Text
                              variant="titleMedium"
                              style={AlignCenterStyles.alignItemCenter}>
                              Overtime #{index + 1}
                            </Text>
                            <Button
                              mode="text"
                              compact
                              onPress={() => overTimeDetailsRemove(index)}>
                              Remove
                            </Button>
                          </View>
                          <InputField
                            ref={refOvertimeName}
                            label="Activity Name"
                            modeType="flat"
                            controllerProps={{
                              name: `overTimeDetails.${index}.overTimeActivityName`,
                              control,
                            }}
                            inputProps={{
                              placeholder: 'Enter the activity name',
                              keyboardType: 'default',
                              onSubmitEditing: () =>
                                refOvertimeNoWorker.current?.focus(),
                              returnKeyType: 'next',
                            }}
                            errorMessage={
                              errors.overTimeDetails?.[index]
                                ?.overTimeActivityName?.message
                            }
                          />
                          <InputField
                            ref={refOvertimeNoWorker}
                            label="Number of workers"
                            modeType="flat"
                            controllerProps={{
                              name: `overTimeDetails.${index}.overTimeTotalWorker`,
                              control,
                            }}
                            inputProps={{
                              // placeholder: 'Enter total number',
                              keyboardType: 'numeric',
                              onSubmitEditing: () =>
                                refOvertimeTimeOfStart.current?.focus(),
                              returnKeyType: 'next',
                            }}
                            errorMessage={
                              errors.overTimeDetails?.[index]
                                ?.overTimeTotalWorker?.message
                            }
                          />
                          <InputField
                            ref={refOvertimeTimeOfStart}
                            label="Time of Start"
                            modeType="flat"
                            controllerProps={{
                              name: `overTimeDetails.${index}.timeOfStart`,
                              control,
                            }}
                            inputProps={{
                              placeholder: 'Enter the time of start',
                              keyboardType: 'default',
                              onSubmitEditing: () =>
                                refOvertimeTimeOfFinish.current?.focus(),
                              returnKeyType: 'next',
                            }}
                            errorMessage={
                              errors.overTimeDetails?.[index]?.timeOfStart
                                ?.message
                            }
                          />
                          <InputField
                            ref={refOvertimeTimeOfFinish}
                            label="Time of Finish"
                            modeType="flat"
                            controllerProps={{
                              name: `overTimeDetails.${index}.timeOfFinish`,
                              control,
                            }}
                            inputProps={{
                              placeholder: 'Enter the time of start',
                              keyboardType: 'default',
                              onSubmitEditing: () =>
                                refOvertimeWorkingHrs.current?.focus(),
                              returnKeyType: 'next',
                            }}
                            errorMessage={
                              errors.overTimeDetails?.[index]?.timeOfFinish
                                ?.message
                            }
                          />
                          <InputField
                            ref={refOvertimeWorkingHrs}
                            label="Working hours"
                            modeType="flat"
                            keyboardType="numeric"
                            controllerProps={{
                              name: `overTimeDetails.${index}.overTimeTotalWorkingHrs`,
                              control,
                            }}
                            inputProps={{
                              placeholder: 'Enter total working hours',
                              keyboardType: 'numeric',
                              onSubmitEditing: () =>
                                refOvertimeNotes.current?.focus(),
                              returnKeyType: 'next',
                            }}
                            errorMessage={
                              errors.overTimeDetails?.[index]
                                ?.overTimeTotalWorkingHrs?.message
                            }
                          />
                          <InputField
                            ref={refOvertimeNotes}
                            label="Notes"
                            controllerProps={{
                              name: `overTimeDetails.${index}.overTimeNotes`,
                              control,
                            }}
                            inputProps={{
                              placeholder: 'Enter your notes',
                              keyboardType: 'default',
                              // onSubmitEditing: () => refPassword.current?.focus(),
                              returnKeyType: 'done',
                              multiline: true,
                              scrollEnabled: false,
                              numberOfLines: 4,
                            }}
                            errorMessage={
                              errors.overTimeDetails?.[index]?.overTimeNotes
                                ?.message
                            }
                          />
                        </View>
                      );
                    })}
                    <Button
                      mode="outlined"
                      compact
                      onPress={() => overTimeDetailsAppend(overTimeDetailVal)}>
                      + Add new
                    </Button>
                  </Step>
                  <Step title="General" submitText="Submit">
                    <InputField
                      ref={refClientInstruction}
                      label="Client Instructions"
                      controllerProps={{
                        name: 'clientInstructionNotes',
                        control,
                      }}
                      disabled={
                        addedSignature ||
                        (editMode && clientInstValue.length > 0)
                      }
                      inputProps={{
                        placeholder:
                          'Enter the Instructions and Directions provided by the Client',
                        keyboardType: 'default',
                        returnKeyType: 'next',
                        multiline: true,
                        scrollEnabled: false,
                        onSubmitEditing: () =>
                          refSiteMeetingNotes.current?.focus(),
                        numberOfLines: 6,
                        style: {
                          height: 120,
                          textAlignVertical: 'top',
                          textAlign: 'auto',
                        },
                      }}
                      errorMessage={errors.clientInstructionNotes?.message}
                    />
                    {clientInstValue?.length > 0 && !addedSignature && (
                      <Button
                        mode="text"
                        compact
                        onPress={() => {
                          setModalVisible(true);
                        }}
                        disabled={editMode && clientInstValue.length > 0}
                        style={{alignItems: 'flex-start'}}>
                        Add Signature*
                      </Button>
                    )}
                    {addedSignature ||
                      (editMode && clientInstValue.length > 0 && (
                        <Text
                          variant="titleSmall"
                          style={{paddingBottom: 10, paddingTop: 5}}>
                          Signature Added!
                        </Text>
                      ))}
                    <InputField
                      ref={refSiteMeetingNotes}
                      label="Details of Site meeting"
                      controllerProps={{name: 'siteMeetingNotes', control}}
                      inputProps={{
                        placeholder: 'Enter the details of site meeting',
                        keyboardType: 'default',
                        returnKeyType: 'done',
                        multiline: true,
                        scrollEnabled: false,
                        numberOfLines: 6,
                        style: {
                          height: 120,
                          textAlignVertical: 'top',
                          textAlign: 'auto',
                        },
                      }}
                      errorMessage={errors.siteMeetingNotes?.message}
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
                            onPress={() => triggerTakePhoto()}
                            loading={cameraLoading}>
                            Open Camera
                          </Button>
                          <List.Section>
                            {selectedSiteCameraFiles.map((file, index) => (
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
                                      removeFile(index, 'siteCameraFiles')
                                    }
                                  />
                                )}
                              />
                            ))}
                          </List.Section>
                        </>
                      )}
                      name="siteCameraFiles"
                    />
                    <Text
                      variant="titleSmall"
                      style={{paddingBottom: 10, paddingTop: 5}}>
                      Document Upload
                    </Text>
                    <Controller
                      control={control}
                      render={({field}) => (
                        <>
                          <Button
                            mode="outlined"
                            onPress={() => pickDocument()}>
                            Upload a Image/PDF Document
                          </Button>
                          <List.Section>
                            {selectedSiteFiles.map((file, index) => (
                              <List.Item
                                key={index}
                                title={file.name}
                                style={{paddingBottom: 0}}
                                left={() => <List.Icon icon="file" />}
                                right={() => (
                                  <IconButton
                                    icon="close"
                                    color="red"
                                    size={16}
                                    onPress={() => removeFile(index)}
                                  />
                                )}
                              />
                            ))}
                          </List.Section>
                          {exitingSiteFiles &&
                            exitingSiteFiles?.filter(
                              item => item?.document_activity === 0,
                            )?.length > 0 && (
                              <List.Section title="Existing Files">
                                {exitingSiteFiles
                                  .filter(item => item?.document_activity === 0)
                                  .map((file, index) => (
                                    <List.Item
                                      key={index}
                                      title={file?.document_name
                                        ?.split('_')
                                        ?.slice(5)
                                        ?.join('_')}
                                      style={{
                                        marginVertical: 0,
                                        paddingVertical: 0,
                                      }}
                                      left={() => (
                                        <List.Icon
                                          icon={`${
                                            isImageType(file?.document_name)
                                              ? 'image'
                                              : 'file-document'
                                          }`}
                                        />
                                      )}
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
                      name="siteFiles"
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
                    'This will permanently delete the site report document'
                  }
                  onClose={() => setDeleteDocuDialog(false)}
                  onConfirm={deleteDocuReport}
                  cancelButtonChildren={'Cancel'}
                  confirmButtionChildren={'Confirm'}
                />
                <ConfirmationDialog
                  isVisible={deleteActivityDocuDialog}
                  title={'Delete the Work Activity'}
                  description={
                    'This will permanently delete the activity report and attachment document, if any'
                  }
                  onClose={() => setDeleteActivityDocuDialog(false)}
                  onConfirm={deleteActivityDocuReport}
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
                <ConfirmationDialog
                  isVisible={showSaveTemplateDialog}
                  title={'Save Template?'}
                  description={'Do you want to save this as a template?'}
                  onClose={async () => {
                    setShowSaveTemplateDialog(false);
                    machineAndEquipmentsRef.current.goToNextStep();
                  }}
                  onConfirm={async () => {
                    setShowSaveTemplateDialog(false);
                    setShowSaveTemplateInputDialog(true);
                  }}
                  cancelButtonChildren={'Continue without saving'}
                  confirmButtionChildren={'Save'}
                />
                <ConfirmationDialogWithInput
                  templates={templates}
                  isVisible={showSaveTemplateInputDialog}
                  title={'Enter template name'}
                  onClose={async () => {
                    setShowSaveTemplateInputDialog(false);
                  }}
                  onConfirm={async templateName => {
                    const values = getValues('machineryAndEquipments');
                    await AsyncStorage.setItem(
                      storageKeyMachineryAndEquipments,
                      JSON.stringify([
                        ...templates,
                        {
                          name: templateName,
                          values,
                        },
                      ]),
                    );
                    setShowSaveTemplateInputDialog(false);
                    machineAndEquipmentsRef.current.goToNextStep();
                  }}
                  cancelButtonChildren={'Cancel'}
                  confirmButtionChildren={'Save'}
                />
                <Portal>
                  <Snackbar
                    visible={siteToast}
                    duration={4000}
                    onDismiss={() => setSiteToast(false)}>
                    {siteToastMessage}
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
                      if (cameraImageType === 'general') {
                        setCameraImageItem([
                          {
                            uri: `file://${file.path}`,
                          },
                        ]);
                      } else {
                        setCameraActivityImageItem([
                          {
                            uri: `file://${file.path}`,
                          },
                        ]);
                      }
                      setCameraOrientation(orientation);
                      setCommentModalVisible(true);
                      setCameraModalVisible(false);
                    }}
                  />
                  <ImageView
                    images={
                      cameraImageType === 'general'
                        ? cameraImageItem
                        : cameraActivityImageItem
                    }
                    imageIndex={0}
                    visible={
                      (cameraImageItem?.length === 1 ||
                        cameraActivityImageItem?.length === 1) &&
                      cameraImageView
                    }
                    onRequestClose={() => {
                      setCameraImageItem([]);
                      setCameraImageView(false);
                    }}
                    FooterComponent={() => (
                      <View
                        style={{
                          justifyContent: 'center',
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
                    images={
                      cameraImageType === 'general'
                        ? cameraImageItem
                        : cameraActivityImageItem
                    }
                    imageIndex={0}
                    visible={
                      (cameraImageItem?.length === 1 ||
                        cameraActivityImageItem?.length === 1) &&
                      commentModalVisible
                    }
                    swipeToCloseEnabled={false}
                    onRequestClose={() => {
                      setCameraImageView(true);
                      if (cameraImageType === 'general') {
                        handleAddComment(null);
                      } else {
                        handleActivityAddComment(null);
                      }
                      setTimeout(() => {
                        setCommentModalVisible(false);
                      }, 1000);
                    }}
                    FooterComponent={props => (
                      <FooterComponent
                        {...props}
                        onAddCommentCallback={
                          cameraImageType === 'general'
                            ? handleAddComment
                            : handleActivityAddComment
                        }
                      />
                    )}
                  />
                  <Modal
                    dismissableBackButton={true}
                    visible={modalVisible}
                    dismissable={false}
                    contentContainerStyle={{
                      marginHorizontal: 20,
                    }}>
                    <ScrollView>
                      <Card
                        contentStyle={{
                          paddingVertical: 10,
                          borderRadius: 10,
                          backgroundColor: darkColor.colors.secondaryContainer,
                        }}>
                        <Card.Content>
                          <Text>{`Once the signature has been added, this section would be non-editable and no further edits are allowed`}</Text>
                        </Card.Content>
                        <Card.Actions style={{paddingHorizontal: 15}}>
                          <Button
                            labelStyle={{
                              color: darkColor.colors.onSecondaryContainer,
                            }}
                            style={{
                              borderColor:
                                darkColor.colors.onSecondaryContainer,
                            }}
                            onPress={() => setModalVisible(false)}>
                            Cancel
                          </Button>
                          <Button
                            onPress={() => {
                              handleOpenSignatureModal();
                            }}>
                            Proceed
                          </Button>
                        </Card.Actions>
                      </Card>
                    </ScrollView>
                  </Modal>
                  <Modal
                    dismissableBackButton={true}
                    visible={signatureModalVisible}
                    dismissable={false}
                    contentContainerStyle={{
                      marginHorizontal: 20,
                    }}>
                    <KeyboardAwareScrollView
                      extraScrollHeight={20}
                      keyboardShouldPersistTaps="handled">
                      <Card
                        contentStyle={{
                          paddingVertical: 10,
                          borderRadius: 10,
                          backgroundColor: darkColor.colors.secondaryContainer,
                        }}>
                        <Card.Title title="Disclaimer:" />
                        <Card.Content>
                          <Text>{`The electronic action means obtaining a person’s agreement of the information. This action is required to meet the contract requirements.
This method will prevent any unnecessary delays in the performance of the works. The digital action will NOT be copied, reproduced or otherwise under any circumstances`}</Text>

                          <Controller
                            control={control}
                            render={({field}) => (
                              <>
                                <Text
                                  variant="bodyLarge"
                                  style={styles.signatureText}>
                                  Signature:
                                </Text>
                                <SignatureCapture
                                  style={styles.signature}
                                  ref={signatureRef}
                                  onSaveEvent={onSaveEvent}
                                  saveImageFileInExtStorage={false}
                                  showNativeButtons={false}
                                  showTitleLabel={true}
                                  viewMode={'portrait'}
                                />
                                <View style={styles.signatureBtnContainer}>
                                  <Button
                                    mode="outlined"
                                    onPress={() => handleReset()}
                                    style={{marginTop: 10}}>
                                    Clear
                                  </Button>
                                </View>
                                <View>
                                  <InputField
                                    ref={refSignaturePersonName}
                                    label="Name of the client*"
                                    controllerProps={{
                                      name: 'signature.name',
                                      control,
                                    }}
                                    inputProps={{
                                      placeholder: 'Enter the Name',
                                      keyboardType: 'default',
                                      returnKeyType: 'next',
                                      multiline: true,
                                      scrollEnabled: false,
                                      onSubmitEditing: () =>
                                        refSignaturePersonName.current?.focus(),
                                      numberOfLines: 6,
                                    }}
                                    updateValue={setValue}
                                    errorMessage={errors.signature?.message}
                                  />
                                  <InputField
                                    ref={refSignaturePersonDesignation}
                                    label="Designation of the client*"
                                    controllerProps={{
                                      name: 'signature.designation',
                                      control,
                                    }}
                                    inputProps={{
                                      placeholder: 'Enter the Designation',
                                      keyboardType: 'default',
                                      returnKeyType: 'next',
                                      multiline: true,
                                      scrollEnabled: false,
                                      onSubmitEditing: () =>
                                        refSignaturePersonDesignation.current?.focus(),
                                      numberOfLines: 6,
                                    }}
                                    updateValue={setValue}
                                    errorMessage={errors.signature?.message}
                                  />
                                </View>
                              </>
                            )}
                            name="siteFiles"
                          />
                        </Card.Content>
                        <Card.Actions style={{paddingHorizontal: 15}}>
                          <Button
                            labelStyle={{
                              color: darkColor.colors.onSecondaryContainer,
                            }}
                            style={{
                              borderColor:
                                darkColor.colors.onSecondaryContainer,
                            }}
                            onPress={() => {
                              setSignatureModalVisible(false);
                              setModalVisible(false);
                            }}>
                            Cancel
                          </Button>
                          <Button
                            disabled={!isEligible}
                            onPress={() => {
                              setSignatureModalVisible(false);
                              handleSignatureSave();
                              setModalVisible(false);
                            }}>
                            Confirm
                          </Button>
                        </Card.Actions>
                      </Card>
                    </KeyboardAwareScrollView>
                  </Modal>
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
    marginHorizontal: 5,
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
    borderColor: darkColor.colors.secondary,
    borderTopWidth: 5,
  },
  label: {
    fontSize: 16,
    marginTop: 5,
    marginBottom: 8,
  },
  radioButtonContainer: {
    // marginBottom: 2,
  },
  signature: {
    flex: 1,
    borderColor: '#000033',
    borderWidth: 1,
    width: '100%',
    height: 200,
  },
  signatureText: {
    marginTop: 10,
    marginBottom: 10,
  },
  signatureBtnContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // Align buttons to the right
    alignItems: 'flex-end', // Align buttons to the bottom
  },
});

export default AddEditSiteReport;
