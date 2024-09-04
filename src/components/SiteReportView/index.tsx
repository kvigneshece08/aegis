import React, {useState} from 'react';
import {Image, Platform, StyleSheet, View} from 'react-native';
import {Checkbox, Chip, List, Portal, Snackbar, Text} from 'react-native-paper';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import {ConfirmationDialog} from '../PromiseDialog';
import ImageView from 'react-native-image-viewing';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {darkColor} from '../../themes';
import Notifee, {AndroidStyle} from '@notifee/react-native';
import {zip} from 'react-native-zip-archive';
import {delayNotificationApi} from '../../utils/pushNotificationUtil';

import {
  getImageSize,
  getLabelForValue,
  includeServerPath,
} from '../../utils/functions';
import {WORK_ACTIVITY_TYPE} from '../../utils/constants';
import moment from 'moment';
import {useAppSelector} from '../../hooks/reduxHooks';
import {getExtension, getMimeTypeFromFilePath} from '../../utils/fileUtils';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';

const TitleNode = ({
  title,
  dataKey,
  index,
  selectedValues,
  handlePreviewSelection,
}: {
  title: string;
  dataKey: string;
  index: number;
  selectedValues: {
    subContractorsData: number[];
    workPerformedData: number[];
    machineryAndEquipmentsData: number[];
    overtimeDetailsData: number[];
  };
  handlePreviewSelection: (key: string, index: number) => void;
}) => (
  <>
    <View>
      <Chip mode="outlined" icon="format-list-bulleted">
        {title}
      </Chip>
    </View>
    <View style={{marginRight: 20}}>
      <Checkbox.Android
        value={index}
        status={
          selectedValues[dataKey].includes(index) ? 'checked' : 'unchecked'
        }
        onPress={() => handlePreviewSelection(dataKey, index)}
      />
    </View>
    <View style={styles.dividerSpace} />
  </>
);

const FooterComponent = ({
  imageIndex,
  imagesList,
  imageCallbackFunction,
  status,
}) => {
  const [siteImageToast, setSiteImageToast] = useState<boolean>(status);
  const imageURL = includeServerPath(imagesList?.[imageIndex]?.document_path);
  const imageName = imagesList?.[imageIndex]?.document_name || 'image.jpg';
  return (
    <View style={styles.footer}>
      <Text style={styles.imageCount}>{`${imageIndex + 1} / ${
        imagesList?.length
      }`}</Text>
      <Chip
        onPress={() => imageCallbackFunction(imageURL, imageName, 'Image')}
        icon="download"
        mode="flat"
        compact
        style={{
          marginVertical: 10,
          alignSelf: 'flex-end',
        }}>
        Download
      </Chip>
      <Snackbar
        visible={siteImageToast}
        duration={3000}
        onDismiss={() => setSiteImageToast(false)}>
        Image downloaded successfully
      </Snackbar>
    </View>
  );
};

export const SiteReportView = ({
  data,
  navigate,
  bottomSheetViewRef,
}: {
  data: any;
  navigate: any;
  bottomSheetViewRef: any;
}) => {
  const [reportDialog, setReportDialog] = useState<boolean>(false);
  const [reportDescription, setReportDescription] =
    useState<string>('Loading...');
  const [reportFileUrl, setReportFileUrl] = useState<string>('');

  const [firstListExpanded, setFirstListExpanded] = React.useState(true);
  const [imageIndex, setImageIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [siteToast, setSiteToast] = useState<boolean>(false);
  const [siteToastMessage, setSiteToastMessage] = useState<string>('');
  const [siteImgStatus, setSiteImgStatus] = useState<boolean>(false);

  const authDetails = useAppSelector(state => state?.authDetails);
  const selectedProject = useAppSelector(
    state => state?.assignedProjects?.currentProject,
  );
  const weatherData =
    data?.weather_condition && JSON.parse(data?.weather_condition);
  const workPerformedData =
    data?.work_performed && JSON.parse(data?.work_performed);
  const subContractorsData =
    data?.sub_contractors && JSON.parse(data?.sub_contractors);
  const machineryAndEquipmentsData =
    data?.machinery_and_equipments &&
    JSON.parse(data?.machinery_and_equipments);
  const overtimeDetailsData =
    data?.overtime_details && JSON.parse(data?.overtime_details);
  const documentData = data?.documents && JSON.parse(data?.documents);
  const stringValue = (val: string): string => val || 'None';
  const integerValue = (val: number): number => val || 0;

  const formattedReportDate =
    data?.report_date && moment(data?.report_date).format('MMM D, YYYY h:mm A');

  const formattedModifiedDate =
    data?.modified_at && moment(data?.modified_at).format('MMM D, YYYY h:mm A');
  const signatureParse = data?.signature?.replace(/[\u0000-\u001F]/g, '');
  const signature = signatureParse && JSON.parse(signatureParse);

  const openImageViewer = uri => {
    const imageIndex = documentData?.findIndex(
      image => includeServerPath(image.document_path) === uri,
    );
    setImageIndex(imageIndex);
    setVisible(true);
  };

  const downloadDocument = async (url, fileName, type = 'Document') => {
    const {dirs} = ReactNativeBlobUtil.fs;
    const filePath =
      Platform.OS === 'ios'
        ? `${dirs.DocumentDir}/${fileName}`
        : `${dirs.DownloadDir}/${fileName}`;
    setSiteImgStatus(false);
    try {
      await ReactNativeBlobUtil.config({
        fileCache: true,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          path: filePath,
          description: `Downloading ${type}...`,
        },
      }).fetch('GET', url);
      if (type === 'Document') {
        setSiteToast(true);
        setSiteToastMessage(`${type} downloaded successfully.`);
      } else {
        setSiteImgStatus(true);
        setTimeout(() => {
          setSiteImgStatus(false);
        }, 2000);
      }

      // Handle the downloaded document path as needed (e.g., show it to the user)
      return filePath;
    } catch (error) {
      setSiteImgStatus(false);
      setSiteToast(true);
      setSiteToastMessage('Error downloading document. Please try again.');
    }
  };

  const isImageType = fileName => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff'];
    const lowerCaseFileName = fileName && fileName?.toLowerCase();
    return imageExtensions?.some(ext => lowerCaseFileName?.endsWith(ext));
  };

  const handleConfirm = () => {
    if (reportFileUrl) {
      navigate('PDFViewer', {pdfPath: reportFileUrl});
    }
  };

  const isImageFile =
    documentData &&
    documentData?.length > 0 &&
    documentData?.some(item => isImageType(item?.document_type));

  const isDocumentFile =
    documentData &&
    documentData?.length > 0 &&
    documentData?.some(item => !isImageType(item?.document_type));

  const generalImageFiles =
    isImageFile &&
    documentData?.filter(item => item?.document_activity === 0)?.length > 0;

  const generalDocumentFiles =
    isDocumentFile &&
    documentData?.filter(item => item?.document_activity === 0)?.length > 0;

  const generateHTMLContent = async (preview = false) => {
    return `  <style>
      .clearfix:after {
        content: "";
        display: table;
        clear: both;
      }

      a {
        color: #607d8b;
        text-decoration: none;
      }
      body {
        position: relative;
        width: 19cm;  
        height: 29.7cm; 
        margin: 0 auto; 
        color: #000000;
        background: #FFFFFF; 
        font-family: Arial, sans-serif; 
        font-size: 14px; 
        margin-left: 50px;
        margin-right: 50px;
        padding-right: 50px;
        margin-bottom: 50px;
      }
      header {
        padding: 10px 0;
        margin-bottom: 20px;
        border-bottom: 1px solid #AAAAAA;
      }
      @page {
        margin-top: 50px;
        margin-bottom: 70px; /* Adjusted margin-bottom */
      }
      
      footer {
        color: #777777;
        width: 90%;
        position: fixed;
        bottom: 0;
        border-top: 1px solid #AAAAAA;
        text-align: center;
        margin-bottom: 0; /* Reset margin-bottom */
      }
      #logo {
        float: left;
        margin-top: 0px;
      }
      #logo img {
        height: 90px;
      }
      #company {
        float: right;
        text-align: right;
      }
      #details {
        margin-bottom: 30px;
      }
      #client {
        padding-left: 6px;
        border-left: 6px solid #c6c6c6;
        float: left;
      }
      #client .to {
        color: #686767;
      }
      h2.name {
        font-size: 1.4em;
        font-weight: normal;
        margin: 0;
      }
      h2.proname {
        font-size: 1.1em;
        font-weight: normal;
        margin: 0;
      }
      h2.formName {
        font-size: 1.2em;
        font-weight: normal;
        margin: 0;
      }
      #invoice {
        float: right;
        text-align: right;
      }
      
      #invoice h1 {
        color: #263514;
        font-size: 1.7em;
        line-height: 1em;
        font-weight: normal;
        margin: 0  0 10px 0;
      }
      
      #invoice .date {
        font-size: 1.1em;
        margin-bottom: 5px;
        color: #777777;
      }
      .serialNo {
        font-weight: bold;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        border-spacing: 0;
        margin-bottom: 20px;
        font-size: 0.8em;
      }
      
      table th,
      table td {
        padding: 10px;
        background: #FFFFFF;
        border-bottom: 1px solid #FFFFFF;
      }
      
      table th {
        white-space: nowrap;
        font-weight: bold;
        background: #f2f2f2 !important;
        color: #0b0b0b !important;
        font-size: 1.1em;
        padding: 10px;
        border: 1px solid #989393;
        text-align: left;
      }
      
      table td {
        border:1px solid #c8c8c8;
        font-size: 1.15em !important;
      }
      
      table td h3{
        color: #57B223;
        font-size: 1.2em;
        font-weight: bold;
        margin: 0 0 0.2em 0;
      }
      
      table tfoot td {
        padding: 10px 20px;
        background: #FFFFFF;
        border-bottom: none;
        font-size: 1.2em;
        white-space: nowrap; 
        border-top: 1px solid #AAAAAA; 
      }
      
      table tfoot tr:first-child td {
        border-top: none; 
      }
      
      table tfoot tr:last-child td {
        color: #57B223;
        font-size: 1.4em;
        border-top: 1px solid #57B223; 
      
      }
      
      table tfoot tr td:first-child {
        border: none;
      }
      .notes-col {
        font-weight: bold;
      }
      #thanks{
        font-size: 2em;
        margin-bottom: 50px;
      }
      
      #notices{
        padding-left: 6px;
        border-left: 6px solid #0087C3;  
      }
      
      #notices .notice {
        font-size: 1.2em;
      }
      
      h2 {
        color: #333;
        padding-bottom: 5px;
      }
    
      .section {
        margin-top: 20px;
      }
      .footer-notice{

      }
    </style>
    <body>
    <main>
      <header class="clearfix">
        <div id="logo">
          <img src="${includeServerPath(
            selectedProject?.builderDetails?.builderAdditional?.builderLogo,
          )}">
        </div>
        <div id="company">
          <h2 class="name">${selectedProject?.builderDetails?.builderLabel}</h2>
          <div>
            ${
              selectedProject?.builderDetails?.builderAdditional?.builderAddress
            },
          </div>
          <div>
          ${
            selectedProject?.builderDetails?.builderAdditional?.builderCity ||
            ''
          },
          ${
            selectedProject?.builderDetails?.builderAdditional?.builderState ||
            ''
          },
          ${
            selectedProject?.builderDetails?.builderAdditional
              ?.builderCountry || ''
          },
          ${
            selectedProject?.builderDetails?.builderAdditional
              ?.builderPincode || ''
          }
          </div>
          <div>
          ${
            selectedProject?.builderDetails?.builderAdditional
              ?.builderContactNumber
          }
          </div>
          <div>
            <a href="mailto:${
              selectedProject?.builderDetails?.builderAdditional
                ?.builderEmailAddress
            }">
              ${
                selectedProject?.builderDetails?.builderAdditional
                  ?.builderEmailAddress
              }
            </a>
          </div>
        </div>
      </header>
      <div id="details" class="clearfix">
        <div id="client">
          <div class="to">Project Name:</div>
          <h2 class="proname">${
            selectedProject?.projectDetails?.projectLabel
          }</h2>
          <div class="to">Project Address:</div>
          <h2 class="proname">${
            selectedProject?.projectDetails?.projectAdditional?.projectAddress
          }, ${
            selectedProject?.projectDetails?.projectAdditional?.projectCity
          }, ${
            selectedProject?.projectDetails?.projectAdditional?.projectCountry
          }</h2>
          <div></div>
          <div class="to">Task Name:</div>
          <h2 class="proname">${selectedProject?.taskDetails?.taskLabel}</h2>
        </div>
        <div id="invoice">
          <h1>Site Report #${data?.report_code}</h1>
          <div class="date">Report Date: ${stringValue(
            formattedReportDate,
          )}</div>
          <div class="date">Last Update: ${stringValue(
            formattedModifiedDate,
          )}</div>
        </div>
      </div>
      <h2 class="formName">Weather Report</h2>
      <table border="0" cellspacing="0" cellpadding="0">
        <thead>
          <tr>
            <th>Max Temperature</th>
            <th>Min Temperature</th>
            <th>Weather</th>
            
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>${integerValue(weatherData?.tempMax)}</td>
            <td>${integerValue(weatherData?.tempMin)}</td>
            <td>${stringValue(weatherData?.climateOpt)}</td>
            
          </tr>
        </tbody>
        <thead>
          <tr>
          <th>Precipitation (mm)</th>
            <th>Humidity (%)</th>
            <th>Wind Speed (km/hr)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
          <td>${integerValue(weatherData?.precipitation)}</td>
            <td>${integerValue(weatherData?.humidity)}</td>
            <td>${integerValue(weatherData?.windSpeed)}</td>
          </tr>
        </tbody>
      </table>
      <h2 class="formName">Daily Snapshots</h2>
      <table border="0" cellspacing="0" cellpadding="0">
        <thead>
          <tr>
            ${weatherData?.forecast?.reduce(
              (acc, item) => `${acc}<th>${item.date}</th>`,
              '',
            )}
          </tr>
        </thead>
         <tbody>
          <tr>
            ${weatherData?.forecast?.reduce(
              (acc, item) =>
                `${acc}<td>${integerValue(item.temp)}<br/>${stringValue(
                  item.weather,
                )}</td>`,
              '',
            )}
          </tr>
        </tbody>
      </table>
      <p>The values displayed above are obtained from openweathermap.org at ${
        weatherData?.date
      }</p>
      ${
        preview &&
        (!selectedValues?.subContractorsData ||
          selectedValues.subContractorsData.length === 0)
          ? ''
          : `
          <h2 class="formName">Sub Contractors</h2>
          <table border="0" cellspacing="0" cellpadding="0">
            <thead>
              <tr>
                <th>#</th>
                <th>Company</th>
                <th>Function</th>
                <th>No. of Workers</th>
                <th>Total Worker Hrs</th>
              </tr>
            </thead>
            <tbody>
            ${
              !subContractorsData || subContractorsData?.length === 0
                ? ' <tr><td colspan="6" class="notes-col">No Record Found </td></tr>'
                : (preview
                    ? subContractorsData.filter((_, index) =>
                        selectedValues.subContractorsData.includes(index),
                      )
                    : subContractorsData
                  )
                    .map(
                      (subContractor, index) => `
                      <tr key=${index}>
                        <td class="serialNo">${index + 1}</td>
                        <td>${stringValue(
                          subContractor?.contractorCompany,
                        )}</td>
                        <td>${stringValue(
                          subContractor?.contractorFunction,
                        )}</td>
                        <td>${integerValue(
                          subContractor?.contractorTotalEmp,
                        )}</td>
                        <td>${integerValue(
                          subContractor?.contractorTotalWorkingHrs,
                        )}</td>
                      </tr>
                      <tr>
                        <td colspan="1" class="notes-col">Remarks </td>
                        <td colspan="6" class="notes"> ${stringValue(
                          subContractor?.contractorNotes?.replace(
                            /\n/g,
                            '<br>',
                          ),
                        )}</td>
                      </tr>
                `,
                    )
                    .join('')
            }
            </tbody>
          </table>
          `
      }
      ${
        preview &&
        (!selectedValues?.workPerformedData ||
          selectedValues.workPerformedData.length === 0)
          ? ''
          : `
      <h2 class="formName">Work Performed</h2>
      <table border="0" cellspacing="0" cellpadding="0">
        <thead>
          <tr>
            <th>#</th>
            <th>Activity Name</th>
            <th>No. of Workers</th>
            <th>Activity Type</th>
            <th>Variation No.</th>
            <th>Variation Remark</th>
            <th>Docket Number</th>
          </tr>
        </thead>
        <tbody>
        ${
          !workPerformedData || workPerformedData?.length === 0
            ? '<tr><td colspan="6" class="notes-col">No Record Found</td></tr>'
            : await Promise.all(
                (preview
                  ? workPerformedData.filter((_, index) =>
                      selectedValues.workPerformedData.includes(index),
                    )
                  : workPerformedData
                ).map(async (workPerformedVal, index) => {
                  const isImageAvailable = documentData?.filter(
                    item =>
                      isImageType(item?.document_type) &&
                      item?.document_activity === index + 1,
                  );
                  const images =
                    isImageAvailable &&
                    (
                      await Promise.all(
                        documentData
                          ?.filter(
                            item =>
                              isImageType(item?.document_type) &&
                              item?.document_activity === index + 1 &&
                              (!preview ||
                                selectedValues.workPerFormedImages.includes(
                                  item?.document_id,
                                )),
                          )
                          ?.map(async image => {
                            const source = {
                              uri: includeServerPath(image?.document_path),
                            };
                            try {
                              const size = await getImageSize(source?.uri);
                              const isPortrait = size?.height > size?.width;
                              const aspectRatio = isPortrait
                                ? size?.height / size?.width
                                : size?.width / size?.height;
                              const imageHeight = 400 * aspectRatio;
                              return `
                            <div style="border: 8px solid #ccc; display: block;margin: 5px;">
                            <img src='${includeServerPath(
                              image?.document_path,
                            )}' style="height: ${
                                isPortrait ? `${imageHeight}px` : 'auto'
                              }; width: ${
                                isPortrait ? 'auto' : `${imageHeight}px`
                              };" />
                              <p style="text-align: center;">
                                ${image?.document_name
                                  ?.split('_')
                                  ?.slice(5)
                                  ?.join('_')}
                              </p>
                            </div>`;
                            } catch (error) {
                              console.error('Failed to get image size:', error);
                              return ''; // Return an empty string if there's an error
                            }
                          }),
                      )
                    ).join('');

                  return `
                    <tr key=${index}>
                      <td class="serialNo"> ${index + 1}</td>
                      <td>${stringValue(workPerformedVal?.activityName)}</td>
                      <td>${stringValue(workPerformedVal?.workerCount)}</td>
                      <td>${getLabelForValue(
                        WORK_ACTIVITY_TYPE,
                        workPerformedVal?.activityType,
                      )}</td>
                      <td>${stringValue(workPerformedVal?.variationNumber)}</td>
                      <td>${stringValue(
                        workPerformedVal?.variationRemarks?.replace(
                          /\n/g,
                          '<br>',
                        ),
                      )}</td>
                      <td>
                            ${stringValue(workPerformedVal?.docketNumber)}
                        </td> 
                    </tr>
                    <tr>
                      <td colspan="1" class="notes-col">Remarks </td>
                      <td colspan="5" class="notes">${stringValue(
                        workPerformedVal?.workNotes?.replace(/\n/g, '<br>'),
                      )}</td>
                    </tr>
                    ${
                      images
                        ? `
                          <tr>
                          <td colspan="6" style="text-align: center">${images}</td>
                          </tr>
                        `
                        : ''
                    }
                  `;
                }),
              )
        }
        </tbody>
      </table>`
      }
      ${
        preview &&
        (!selectedValues?.machineryAndEquipmentsData ||
          selectedValues.machineryAndEquipmentsData.length === 0)
          ? ''
          : `
      <h2 class="formName">Machinery and Equipments</h2>
      <table border="0" cellspacing="0" cellpadding="0">
      <thead>
        <tr>
          <th>#</th>
          <th>Machinery and Equipments</th>
          <th>Numbers</th>
          <th>Location Used</th>
        </tr>
      </thead>
      <tbody>
      ${
        !machineryAndEquipmentsData || machineryAndEquipmentsData?.length === 0
          ? '<tr><td colspan="6" class="notes-col">No Record Found</td></tr>'
          : machineryAndEquipmentsData
              .filter((_, index) =>
                preview
                  ? selectedValues.machineryAndEquipmentsData.includes(index)
                  : true,
              )
              .map(
                (mande, index) => `
                <tr key=${index}>
                  <td class="serialNo">${index + 1}</td>
                  <td>${stringValue(mande?.machineryAndEquipmentName)}</td>
                  <td>${stringValue(mande?.machineryAndEquipmentNumber)}</td>
                  <td>${stringValue(
                    mande?.machineryAndEquipmentLocationUsed,
                  )}</td>
                </tr>
                <tr>
                  <td colspan="1" class="notes-col">Remarks </td>
                  <td colspan="6" class="notes"> ${stringValue(
                    mande?.machineryAndEquipmentNotes?.replace(/\n/g, '<br>'),
                  )}</td>
                </tr>
              `,
              )
              .join('')
      }
        </tbody>
      </table>
      `
      }
      
      ${
        preview &&
        (!selectedValues?.overtimeDetailsData ||
          selectedValues.overtimeDetailsData.length === 0)
          ? ''
          : `
      <h2 class="formName">Overtime Details</h2>
      <table border="0" cellspacing="0" cellpadding="0">
      <thead>
        <tr>
          <th>#</th>
          <th>Activity Name</th>
          <th>No. of Worker</th>
          <th>Time of Start</th>
          <th>Time of Finish</th>
          <th>Total Working Hours</th>
        </tr>
      </thead>
      <tbody>
      ${
        !overtimeDetailsData || overtimeDetailsData?.length === 0
          ? '<tr><td colspan="6" class="notes-col">No Record Found</td></tr>'
          : overtimeDetailsData
              .filter((_, index) =>
                preview
                  ? selectedValues.overtimeDetailsData.includes(index)
                  : true,
              )
              .map(
                (overtimeDetailsVal, index) => `
                <tr key=${index}>
                  <td class="serialNo">${index + 1}</td>
                  <td>${stringValue(
                    overtimeDetailsVal?.overTimeActivityName,
                  )}</td>
                  <td>${stringValue(
                    overtimeDetailsVal?.overTimeTotalWorker,
                  )}</td>
                  <td>${stringValue(overtimeDetailsVal?.timeOfStart)}</td>
                  <td>${stringValue(overtimeDetailsVal?.timeOfFinish)}</td>
                  <td>${stringValue(
                    overtimeDetailsVal?.overTimeTotalWorkingHrs,
                  )}</td>
                </tr>
                <tr>
                  <td colspan="1" class="notes-col">Remarks </td>
                  <td colspan="6" class="notes"> ${stringValue(
                    overtimeDetailsVal?.overTimeNotes?.replace(/\n/g, '<br>'),
                  )}</td>
                </tr>
              `,
              )
              .join('')
      }
        </tbody>
      </table>
      `
      }
      ${
        preview && !selectedValues?.clientInstruction?.length
          ? ''
          : `
      <h2 class="formName">Client Instruction</h2>
      <table border="0" cellspacing="0" cellpadding="0">
      <tbody>
      ${
        !data?.client_instruction
          ? ' <tr><td colspan="6" class="notes-col">No Record Found </td></tr>'
          : `
            <tr>
              <td colspan="1" class="notes-col">Notes </td>
              <td colspan="6" class="notes"> ${stringValue(
                data?.client_instruction?.replace(/\n/g, '<br>'),
              )}</td>
            </tr>
      `
      }
      ${
        signature?.name &&
        `<tr>
        <td colspan="1" class="notes-col">Name of the client</td>
        <td colspan="6" class="notes"> 
          ${signature?.name}
        </td>
      </tr>
      <tr>
        <td colspan="1" class="notes-col">Designation of the client</td>
        <td colspan="6" class="notes"> 
          ${signature?.designation}
        </td>
      </tr>
      <tr>
        <td colspan="1" class="notes-col">Signature</td>
        <td colspan="6" class="notes"> 
          <img src="data:image/jpeg;base64, ${signature?.value}" width="100" height="100">
        </td>
      </tr>`
      }
        </tbody>
      </table>
      `
      }
      ${
        preview && !selectedValues?.siteMeetingRemarks?.length
          ? ''
          : `
      <h2 class="formName">Site Meeting Remarks</h2>
      <table border="0" cellspacing="0" cellpadding="0">
      <tbody>
      ${
        !data?.site_meeting_remarks
          ? ' <tr><td colspan="6" class="notes-col">No Record Found </td></tr>'
          : `
            <tr>
              <td colspan="1" class="notes-col">Notes </td>
              <td colspan="6" class="notes"> ${stringValue(
                data?.site_meeting_remarks?.replace(/\n/g, '<br>'),
              )}</td>
            </tr>
      `
      }
        </tbody>
      </table>
      `
      }
      ${
        preview && !selectedValues?.images?.length
          ? ''
          : `
      <h2 class="formName">Attachments</h2>
      <table>
      <tbody>
      ${
        !generalImageFiles
          ? '<tr><td colspan="6" class="notes-col">No Record Found</td></tr>'
          : await (async () => {
              const images = (
                await Promise.all(
                  documentData
                    ?.filter(
                      item =>
                        isImageType(item.document_type) &&
                        item.document_activity === 0,
                    )
                    ?.filter((_, index) =>
                      preview ? selectedValues?.images?.includes(index) : true,
                    )
                    ?.map(async image => {
                      const source = {
                        uri: includeServerPath(image?.document_path),
                      };
                      try {
                        const size = await getImageSize(source.uri);
                        const isPortrait = size.height > size.width;
                        const aspectRatio = isPortrait
                          ? size.height / size.width
                          : size.width / size.height;
                        const imageHeight = 400 * aspectRatio;
                        return `
                        <div style="border: 8px solid #ccc; display: block;margin: 5px;">
                          <img src='${includeServerPath(
                            image?.document_path,
                          )}' style="height: ${
                          isPortrait ? `${imageHeight}px` : 'auto'
                        }; width: ${
                          isPortrait ? 'auto' : `${imageHeight}px`
                        };" />
                          <p style="text-align: center;">
                            ${image?.document_name
                              ?.split('_')
                              ?.slice(5)
                              ?.join('_')}
                          </p>
                        </div>`;
                      } catch (error) {
                        console.error('Failed to get image size:', error);
                      }
                    }),
                )
              )?.join('');

              return `
              ${
                images
                  ? `
                    <tr>
                      <td colspan="6" style="text-align: center">${images}</td>
                    </tr>
                    `
                  : ''
              }
            `;
            })()
      }
    </tbody>
      </table>
      `
      }
      <h2 class="formName">Report Generated</h2>
      <table border="0" cellspacing="0" cellpadding="0">
      <thead>
        <tr>
          <th colspan="3">By</th>
          <th colspan="3">Date</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colspan="3" class="notes-col">${`${authDetails?.user?.firstName?.toUpperCase()} ${authDetails?.user?.lastName?.toUpperCase()}`} </td>
          <td colspan="3" class="notes"> ${moment().format(
            'MMM D, YYYY h:mm A',
          )}</td>
        </tr>
        </tbody>
      </table>
    </main>
  </div>

  </body> `;
  };

  // Temporary download method
  const tempDownloadDocument = async (url, fileName) => {
    const {fs} = ReactNativeBlobUtil;
    const documentDir = fs.dirs.DocumentDir;
    const downloadDir = RNFS.DownloadDirectoryPath;
    const platformSpecificDir =
      Platform.OS === 'android' ? downloadDir : documentDir;
    const filePath = `${platformSpecificDir}/${fileName}`;

    const res = await ReactNativeBlobUtil.config({
      fileCache: true,
      path: filePath,
    }).fetch('GET', url);

    return filePath;
  };

  // Delete files method
  const deleteFiles = async filePaths => {
    const {fs} = ReactNativeBlobUtil;
    for (const path of filePaths) {
      if (await fs.exists(path)) {
        await fs.unlink(path);
      }
    }
  };

  const generateAndSavePDF = async () => {
    try {
      setReportFileUrl('');
      setReportDialog(true);
      const htmlContent = await generateHTMLContent(
        false,
        selectedProject,
        data,
        selectedValues,
        authDetails,
      );

      const options = {
        html: htmlContent,
        fileName: '',
        directory: '',
        base64: true,
      };

      const pdfContent = await RNHTMLtoPDF.convert(options);
      const documentDir =
        Platform.OS === 'android'
          ? RNFS.DownloadDirectoryPath
          : ReactNativeBlobUtil.fs.dirs.DocumentDir;
      const filePath = `${documentDir}/temp-${data?.report_code?.replace(
        /\//g,
        '-',
      )}_${Date.now().toString().slice(-2)}.pdf`;

      await ReactNativeBlobUtil.fs.writeFile(
        filePath,
        pdfContent?.base64,
        'base64',
      );

      try {
        const additionalPdfs = documentData
          ?.filter(doc => !isImageType(doc?.document_type))
          .map(document => {
            return includeServerPath(document.document_path);
          });

        console.log('additionalPdfs', additionalPdfs);

        // Download the PDFs
        const downloadedPdfs = additionalPdfs
          ? await Promise.all(
              additionalPdfs.map((url, index) =>
                tempDownloadDocument(
                  url,
                  `file_${index + 1}_${Date.now()}.pdf`,
                ),
              ),
            )
          : [];

        const filesToZip = downloadedPdfs
          ? [...downloadedPdfs, filePath]
          : [filePath];

        // Ensure all files exist before attempting to zip
        for (const file of filesToZip) {
          const exists = await ReactNativeBlobUtil.fs.exists(file);
          if (!exists) {
            console.error(`File does not exist: ${file}`);
            return; // Exit if any file doesn't exist
          }
        }

        // Zip the downloaded PDFs
        const zipFilePath = `${documentDir}/${data?.report_code?.replace(
          /\//g,
          '-',
        )}_${Date.now().toString().slice(-2)}.zip`;

        const sharePDF = (path: any) => {
          const shareOptions = {
            title: 'Share file',
            url: 'file://' + path,
            type: 'application/zip',
          };

          Share.open(shareOptions)
            .then(res => console.log(res))
            .catch(err => {
              err && console.log(err);
            });
        };

        await zip(filesToZip, zipFilePath);

        let fileName = zipFilePath.split('/').pop();
        sharePDF(zipFilePath);
        setReportDescription(
          `Successfully downloaded the site report.. \n\nFile Name: ${fileName}`,
        );

        // Delete the temporary files
        filesToZip.forEach(async pdf => {
          try {
            await ReactNativeBlobUtil.fs.unlink(pdf);
          } catch (err) {
            console.error(`Error deleting file: ${pdf}`, err);
          }
        });

        // Notify
        await delayNotificationApi.download({
          title: 'Site Report',
          body:
            'Successfully downloaded the site report. File Name: ' + fileName,
        });
      } catch (error) {
        console.error('Error in additional PDFs handling:', error);
        setReportDescription('Unable to download the site report');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      setReportDescription('Unable to download the site report');
    }
  };

  // preview pdf
  const [selectedValues, setSelectedValues] = useState({
    subContractorsData: [],
    workPerformedData: [],
    machineryAndEquipmentsData: [],
    overtimeDetailsData: [],
    images: [],
    documents: [],
    clientInstruction: [], // it will always have maximum one value since it is not a list yet.
    siteMeetingRemarks: [], // it will always have maximum one value since it is not a list yet.
    workPerFormedImages: [],
    workPerformedDocuments: [],
  });

  const handlePreviewSelection = (key, index) => {
    setSelectedValues(prevState => {
      const newArray = [...prevState[key]];
      if (newArray.includes(index)) {
        return {...prevState, [key]: newArray.filter(i => i !== index)};
      } else {
        return {...prevState, [key]: [...newArray, index]};
      }
    });
  };

  const handlePreview = async () => {
    setReportDialog(true);
    setReportDescription(
      'Generating the site report for preview....Please wait',
    );
    bottomSheetViewRef?.current.close();
    let htmlString = await generateHTMLContent(true);

    const options = {
      html: htmlString,
      fileName: '',
      directory: '',
      base64: true,
    };
    const pdfContent = await RNHTMLtoPDF.convert(options);
    const {fs} = ReactNativeBlobUtil;
    const documentDir = fs.dirs.DocumentDir;
    const downloadDir = RNFS.DownloadDirectoryPath;
    const platformSpecificDir =
      Platform.OS === 'android' ? downloadDir : documentDir;
    const filePath = `${platformSpecificDir}/${data?.report_code?.replace(
      /\//g,
      '-',
    )}_${Date.now().toString().slice(-2)}.pdf`;

    await fs.writeFile(filePath, pdfContent?.base64, 'base64');

    let mergedPdfPath = filePath;
    try {
      const additionalPdfs = documentData
        ?.filter(
          doc =>
            !isImageType(doc?.document_type) &&
            (selectedValues.documents.includes(doc?.document_id) ||
              selectedValues.workPerformedDocuments.includes(doc?.document_id)),
        )
        .map(document => {
          return includeServerPath(document.document_path);
        });

      const formdata = new FormData();
      formdata.append('file0', {
        name: `file.${getExtension(filePath)}`,
        type: getMimeTypeFromFilePath(filePath),
        uri: Platform.OS === 'android' ? `file://${filePath}` : filePath,
      });

      formdata.append('urls', JSON.stringify(additionalPdfs));

      if (additionalPdfs && additionalPdfs.length > 0) {
        // Send the PDFs to the server for merging
        const response = await fetch(
          'https://us-central1-easy-pdf-firebase.cloudfunctions.net/uploadAndMergePDFs',
          {
            method: 'post',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'multipart/form-data',
            },
            body: formdata,
          },
        ).then(res => res.json());
        const {url} = response;

        // Download the merged PDF
        mergedPdfPath = `${platformSpecificDir}/SR-ID-${integerValue(
          data?.report_id,
        )}_${Date.now()}.pdf`;
        const res = await ReactNativeBlobUtil.config({
          fileCache: true,
          path: mergedPdfPath,
        }).fetch('GET', url);
        deleteFiles([filePath]);
      } else {
        mergedPdfPath = filePath;
      }
    } catch (error) {
      console.error(error);
    }
    setReportDialog(false);
    navigate('PdfPreview', {filePath: mergedPdfPath});
  };

  return (
    <List.Section>
      <List.Accordion
        title="General Information"
        expanded={firstListExpanded}
        onPress={() => setFirstListExpanded(!firstListExpanded)}
        // eslint-disable-next-line react/no-unstable-nested-components
        left={props => <List.Icon {...props} icon="information" />}>
        <List.Item
          title="Site Report ID"
          description={`${data?.report_code}`}
        />
        <List.Item
          title="Report Date"
          description={stringValue(formattedReportDate)}
        />
        <List.Item
          title="Last Updated:"
          description={stringValue(formattedModifiedDate)}
        />
      </List.Accordion>
      <List.Accordion
        title="Weather Condition"
        left={props => <List.Icon {...props} icon="weather-sunny" />}>
        {weatherData && (
          <View>
            <View style={styles.twoColumnContainer}>
              <View style={styles.column}>
                <Text style={styles.columnTitle}>Temp. Max</Text>
                <Text>{integerValue(weatherData?.tempMax)} C</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.columnTitle}>Temp. Min</Text>
                <Text>{integerValue(weatherData?.tempMin)} C</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.columnTitle}>Weather</Text>
                <Text>{stringValue(weatherData?.climateOpt)}</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.columnTitle}>Precipitation</Text>
                <Text>{integerValue(weatherData?.precipitation)} mm</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.columnTitle}>Humidity</Text>
                <Text>{integerValue(weatherData?.humidity)} %</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.columnTitle}>Wind Speed</Text>
                <Text>{integerValue(weatherData?.windSpeed)} km/hr</Text>
              </View>
            </View>
            <Text style={[styles.columnTitle, {marginBottom: 15}]}>
              Daily snapshots
            </Text>
            {weatherData.forecast?.map(item => (
              <View
                style={{
                  flexDirection: 'row',
                  marginBottom: 15,
                  marginRight: 40,
                }}>
                <Text style={{flex: 1.4}}>{item.date}</Text>
                <Text style={{flex: 1, textAlign: 'left'}}>{item.weather}</Text>
                <Text style={{flex: 1, textAlign: 'right'}}>
                  {item.temp} &#8451;
                </Text>
              </View>
            ))}
          </View>
        )}
      </List.Accordion>
      <List.Accordion
        title="Sub Contractors"
        left={props => <List.Icon {...props} icon="briefcase" />}>
        {subContractorsData && subContractorsData?.length > 0 ? (
          subContractorsData?.map((contractor, index) => (
            <View key={index} style={styles.twoColumnContainer}>
              <TitleNode
                title={`Contractor Record #${index + 1}`}
                dataKey="subContractorsData"
                index={index}
                selectedValues={selectedValues}
                handlePreviewSelection={handlePreviewSelection}
              />
              <View style={styles.column}>
                <Text style={styles.columnTitle}>Company</Text>
                <Text>{stringValue(contractor?.contractorCompany)}</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.columnTitle}>Function</Text>
                <Text>{stringValue(contractor?.contractorFunction)}</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.columnTitle}>No. of Workers</Text>
                <Text>{stringValue(contractor?.contractorTotalEmp)}</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.columnTitle}>Total Worker Hrs</Text>
                <Text>
                  {stringValue(contractor?.contractorTotalWorkingHrs)}
                </Text>
              </View>
              <View style={styles.columnFull}>
                <Text style={styles.columnTitle}>Remarks</Text>
                <Text>{stringValue(contractor?.contractorNotes)}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.twoColumnContainer}>
            <View style={styles.columnFull}>
              <Text>No Record</Text>
            </View>
          </View>
        )}
      </List.Accordion>
      <List.Accordion
        title="Work Performed"
        // eslint-disable-next-line react/no-unstable-nested-components
        left={props => <List.Icon {...props} icon="clipboard-list-outline" />}>
        {/* Assuming work_performed is a JSON string, parse it */}
        {workPerformedData && workPerformedData.length > 0 ? (
          workPerformedData?.map((work, index) => (
            <View key={index} style={styles.twoColumnContainer}>
              <TitleNode
                title={`Work Record #${index + 1}`}
                dataKey={'workPerformedData'}
                index={index}
                selectedValues={selectedValues}
                handlePreviewSelection={handlePreviewSelection}
              />
              <View style={styles.column}>
                <Text style={styles.columnTitle}>Activity Name</Text>
                <Text>{stringValue(work?.activityName)}</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.columnTitle}>Activity Type</Text>
                <Text>
                  {getLabelForValue(WORK_ACTIVITY_TYPE, work?.activityType)}
                </Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.columnTitle}>No. of Workers</Text>
                <Text>{stringValue(work?.workerCount)}</Text>
              </View>
              {work?.activityType === 'variation_works' && (
                <>
                  <View style={styles.column}>
                    <Text style={styles.columnTitle}>Variation No.</Text>
                    <Text>{stringValue(work?.variationNumber)}</Text>
                  </View>
                </>
              )}
              {work?.activityType === 'variation_works' && (
                <>
                  <View style={styles.columnFull}>
                    <Text style={styles.columnTitle}>Variation Remark</Text>
                    <Text>{stringValue(work?.variationRemarks)}</Text>
                  </View>
                </>
              )}
              {work?.activityType === 'day_works' && (
                <>
                  <View style={styles.column}>
                    <Text style={styles.columnTitle}>Docket Number</Text>
                    <Text>{stringValue(work?.docketNumber)}</Text>
                  </View>
                </>
              )}
              <View style={styles.columnFull}>
                <Text style={styles.columnTitle}>Notes</Text>
                <Text>{stringValue(work?.workNotes)}</Text>
              </View>
              {isImageFile &&
                documentData
                  ?.filter(
                    item =>
                      isImageType(item.document_type) &&
                      item.document_activity === index + 1,
                  )
                  ?.map((image, _i) => (
                    <View style={styles.columnFull} key={index}>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        {selectedValues?.workPerformedData?.includes(index) && (
                          <Checkbox.Android
                            value={index}
                            status={
                              selectedValues?.workPerFormedImages?.includes(
                                image?.document_id,
                              )
                                ? 'checked'
                                : 'unchecked'
                            }
                            onPress={() =>
                              handlePreviewSelection(
                                'workPerFormedImages',
                                image?.document_id,
                              )
                            }
                          />
                        )}
                        <List.Item
                          key={index}
                          title={`Image #${index + 1}`}
                          descriptionNumberOfLines={1}
                          description={image?.document_name
                            ?.split('_')
                            ?.slice(5)
                            ?.join('_')}
                          left={props => (
                            <Image
                              {...props}
                              source={{
                                uri: includeServerPath(image?.document_path),
                              }}
                              style={{width: 50, height: 50}}
                            />
                          )}
                          onPress={() => {
                            openImageViewer(
                              includeServerPath(image?.document_path),
                            );
                          }}
                        />
                      </View>
                    </View>
                  ))}
              {isDocumentFile &&
                documentData
                  .filter(
                    document =>
                      !isImageType(document.document_type) &&
                      document.document_activity === index + 1,
                  )
                  .map((document, _i) => (
                    <View style={styles.columnFull} key={index}>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        {selectedValues?.workPerformedData?.includes(index) && (
                          <Checkbox.Android
                            value={index}
                            status={
                              selectedValues?.workPerformedDocuments?.includes(
                                document?.document_id,
                              )
                                ? 'checked'
                                : 'unchecked'
                            }
                            onPress={() =>
                              handlePreviewSelection(
                                'workPerformedDocuments',
                                document?.document_id,
                              )
                            }
                          />
                        )}
                        <List.Item
                          key={index}
                          title={`Document #${index + 1}`}
                          descriptionNumberOfLines={1}
                          description={document?.document_name
                            ?.split('_')
                            ?.slice(5)
                            ?.join('_')}
                          left={props => (
                            <List.Icon {...props} icon="file-document" />
                          )}
                          onPress={() =>
                            downloadDocument(
                              includeServerPath(document.document_path),
                              document?.document_name,
                            )
                          }
                        />
                      </View>
                    </View>
                  ))}
            </View>
          ))
        ) : (
          <View style={styles.twoColumnContainer}>
            <View style={styles.columnFull}>
              <Text>No Record</Text>
            </View>
          </View>
        )}
      </List.Accordion>
      <List.Accordion
        title="Machinery and Equipments"
        left={props => <List.Icon {...props} icon="hammer" />}>
        {machineryAndEquipmentsData && machineryAndEquipmentsData.length > 0 ? (
          machineryAndEquipmentsData?.map((mae, index) => (
            <View key={index} style={styles.twoColumnContainer}>
              <TitleNode
                title={`M & E Record #${index + 1}`}
                dataKey={'machineryAndEquipmentsData'}
                index={index}
                selectedValues={selectedValues}
                handlePreviewSelection={handlePreviewSelection}
              />
              <View style={styles.column}>
                <Text style={styles.columnTitle}>Name</Text>
                <Text>{stringValue(mae?.machineryAndEquipmentName)}</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.columnTitle}>No. of Quantity</Text>
                <Text>{stringValue(mae?.machineryAndEquipmentNumber)}</Text>
              </View>
              <View style={styles.columnFull}>
                <Text style={styles.columnTitle}>Location Used</Text>
                <Text>
                  {stringValue(mae?.machineryAndEquipmentLocationUsed)}
                </Text>
              </View>
              <View style={styles.columnFull}>
                <Text style={styles.columnTitle}>Notes</Text>
                <Text>{stringValue(mae?.machineryAndEquipmentNotes)}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.twoColumnContainer}>
            <View style={styles.columnFull}>
              <Text>No Record</Text>
            </View>
          </View>
        )}
      </List.Accordion>
      <List.Accordion
        title="Overtime Details"
        left={props => <List.Icon {...props} icon="clock-outline" />}>
        {overtimeDetailsData && overtimeDetailsData.length > 0 ? (
          overtimeDetailsData?.map((otd, index) => (
            <View key={index} style={styles.twoColumnContainer}>
              <TitleNode
                title={`Overtime Details #${index + 1}`}
                dataKey={'overtimeDetailsData'}
                index={index}
                selectedValues={selectedValues}
                handlePreviewSelection={handlePreviewSelection}
              />
              <View style={styles.column}>
                <Text style={styles.columnTitle}>Activity Name</Text>
                <Text>{stringValue(otd?.overTimeActivityName)}</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.columnTitle}>Total Workers</Text>
                <Text>{stringValue(otd?.overTimeTotalWorker)}</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.columnTitle}>Time of Start</Text>
                <Text>{stringValue(otd?.timeOfStart)}</Text>
              </View>
              <View style={styles.column}>
                <Text style={styles.columnTitle}>Time of Finish</Text>
                <Text>{stringValue(otd?.timeOfFinish)}</Text>
              </View>
              <View style={styles.columnFull}>
                <Text style={styles.columnTitle}>Total Working Hrs.</Text>
                <Text>{stringValue(otd?.overTimeTotalWorkingHrs)}</Text>
              </View>
              <View style={styles.columnFull}>
                <Text style={styles.columnTitle}>Notes</Text>
                <Text>{stringValue(otd?.machineryAndEquipmentNotes)}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.twoColumnContainer}>
            <View style={styles.columnFull}>
              <Text>No Record</Text>
            </View>
          </View>
        )}
      </List.Accordion>
      <List.Accordion
        title="Client Instruction"
        left={props => <List.Icon {...props} icon="clipboard-check" />}>
        <View style={styles.columnFull}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {data?.client_instruction && (
              <Checkbox.Android
                value={'1'} // it is always one since it is not a list yet.
                status={
                  selectedValues?.clientInstruction.includes('1')
                    ? 'checked'
                    : 'unchecked'
                }
                onPress={() => handlePreviewSelection('clientInstruction', '1')}
              />
            )}
            <Text>{stringValue(data.client_instruction)}</Text>
          </View>
        </View>
      </List.Accordion>
      <List.Accordion
        title="Site Meeting Remarks"
        left={props => <List.Icon {...props} icon="comment" />}>
        <View style={styles.columnFull}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {data?.site_meeting_remarks && (
              <Checkbox.Android
                value={'1'} // it is always one since it is not a list yet.
                status={
                  selectedValues?.siteMeetingRemarks.includes('1')
                    ? 'checked'
                    : 'unchecked'
                }
                onPress={() =>
                  handlePreviewSelection('siteMeetingRemarks', '1')
                }
              />
            )}
            <Text>{stringValue(data.site_meeting_remarks)}</Text>
          </View>
        </View>
      </List.Accordion>
      {generalDocumentFiles && (
        <List.Accordion
          title="Documents"
          left={props => <List.Icon {...props} icon="file-document" />}>
          {documentData
            .filter(
              document =>
                !isImageType(document.document_type) &&
                document.document_activity === 0,
            )
            .map((document, index) => (
              <View style={styles.columnFull} key={index}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Checkbox.Android
                    value={index}
                    status={
                      selectedValues?.documents?.includes(document?.document_id)
                        ? 'checked'
                        : 'unchecked'
                    }
                    onPress={() =>
                      handlePreviewSelection('documents', document?.document_id)
                    }
                  />
                  <List.Item
                    key={index}
                    title={`Document #${index + 1}`}
                    descriptionNumberOfLines={1}
                    description={document?.document_name
                      ?.split('_')
                      ?.slice(5)
                      ?.join('_')}
                    left={props => (
                      <List.Icon {...props} icon="file-document" />
                    )}
                    onPress={() =>
                      downloadDocument(
                        includeServerPath(document.document_path),
                        document?.document_name,
                      )
                    }
                  />
                </View>
              </View>
            ))}
        </List.Accordion>
      )}
      {generalImageFiles && (
        <List.Accordion
          title="Images"
          left={props => <List.Icon {...props} icon="image" />}>
          {documentData
            .filter(
              item =>
                isImageType(item.document_type) && item.document_activity === 0,
            )
            .map((image, index) => (
              <View style={styles.columnFull} key={index}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Checkbox.Android
                    value={index}
                    status={
                      selectedValues?.images?.includes(index)
                        ? 'checked'
                        : 'unchecked'
                    }
                    onPress={() => handlePreviewSelection('images', index)}
                  />
                  <List.Item
                    key={index}
                    title={`Image #${index + 1}`}
                    descriptionNumberOfLines={1}
                    description={image?.document_name
                      ?.split('_')
                      ?.slice(5)
                      ?.join('_')}
                    left={props => (
                      <Image
                        {...props}
                        source={{uri: includeServerPath(image?.document_path)}}
                        style={{width: 50, height: 50}}
                      />
                    )}
                    onPress={() => {
                      openImageViewer(includeServerPath(image?.document_path));
                    }}
                  />
                </View>
              </View>
            ))}
        </List.Accordion>
      )}
      <View style={{flexDirection: 'row', alignSelf: 'flex-end'}}>
        {Object.values(selectedValues).some(array => array.length > 0) && (
          <Chip
            onPress={handlePreview}
            icon="eye"
            mode="flat"
            compact
            style={{
              marginVertical: 10,
              marginRight: 20,
              alignSelf: 'flex-end',
            }}>
            Preview Selected
          </Chip>
        )}
        <Chip
          onPress={generateAndSavePDF}
          icon="file-download"
          mode="flat"
          compact
          style={{
            marginVertical: 10,
            marginRight: 20,
            alignSelf: 'flex-end',
          }}>
          Download Full Report
        </Chip>
      </View>
      <ConfirmationDialog
        isVisible={reportDialog}
        title={'Download Site Report'}
        description={reportDescription}
        onClose={() => setReportDialog(false)}
        cancelButtonChildren={'Close'}
        confirmButtionChildren={reportFileUrl && 'View'}
        onConfirm={() => {
          bottomSheetViewRef?.current.close();
          setReportDialog(false);
          handleConfirm();
        }}
      />

      <Portal>
        <Snackbar
          visible={siteToast}
          duration={4000}
          onDismiss={() => setSiteToast(false)}>
          {siteToastMessage}
        </Snackbar>
        <ImageView
          images={
            documentData
              ? documentData
                  .filter(item => isImageType(item?.document_type))
                  .map(image => ({
                    uri: includeServerPath(image?.document_path),
                  }))
              : []
          }
          imageIndex={imageIndex}
          visible={visible}
          onRequestClose={() => setVisible(false)}
          FooterComponent={props => (
            <FooterComponent
              {...props}
              imagesList={documentData?.filter?.(item =>
                isImageType(item?.document_type),
              )}
              imageCallbackFunction={downloadDocument}
              status={siteImgStatus}
            />
          )}
        />
      </Portal>
    </List.Section>
  );
};

const styles = StyleSheet.create({
  dividerSpace: {width: '100%', marginBottom: 10},
  recordTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    width: '100%',
  },
  twoColumnContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  column: {
    width: '48%',
    marginBottom: 10,
  },
  columnTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  columnFull: {
    width: '95%',
    marginBottom: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: darkColor?.colors?.background,
    paddingVertical: 3,
    paddingHorizontal: 16, // Add horizontal padding to create space between the text and the button
    flexDirection: 'row', // Arrange items horizontally
    justifyContent: 'space-between', // Distribute items evenly along the row
    alignItems: 'center', // Align items vertically at the center
  },
  imageCount: {
    fontSize: 16,
  },
  pdf: {
    flex: 1,
    width: '100%',
  },
});
