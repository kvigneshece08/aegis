import React, {useState} from 'react';
import {View, StyleSheet, Platform, Image} from 'react-native';
import {List, Text, Chip, Portal, Snackbar} from 'react-native-paper';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import {ConfirmationDialog} from '../PromiseDialog';
import ImageView from 'react-native-image-viewing';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Share from 'react-native-share';
import {
  convertTimestampToAMPM,
  getImageSize,
  includeServerPath,
  formatDate,
  formatTotalHoursLost,
} from '../../utils/functions';
import {darkColor} from '../../themes';
import {useAppSelector} from '../../hooks/reduxHooks';
import moment from 'moment';

const FooterComponent = ({
  imageIndex,
  imagesList,
  imageCallbackFunction,
  status,
}) => {
  const [delayImageToast, setDelayImageToast] = useState<boolean>(status);
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
        visible={delayImageToast}
        duration={3000}
        onDismiss={() => setDelayImageToast(false)}>
        Image downloaded successfully
      </Snackbar>
    </View>
  );
};

export const DelayReportView = ({
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
  const [delayToast, setDelayToast] = useState<boolean>(false);
  const [delayToastMessage, setDelayToastMessage] = useState<string>('');
  const [delayImgStatus, setDelayImgStatus] = useState<boolean>(false);

  const authDetails = useAppSelector(state => state?.authDetails);
  const selectedProject = useAppSelector(
    state => state?.assignedProjects?.currentProject,
  );

  const documentData = data?.documents && JSON.parse(data?.documents);
  const stringValue = (val: string | number): string | number => val || 'None';
  const integerValue = (val: number): number => val || 0;

  const openImageViewer = uri => {
    const imageIndex = documentData?.findIndex(
      image => includeServerPath(image?.document_path) === uri,
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
    setDelayImgStatus(false);
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
        setDelayToast(true);
        setDelayToastMessage(`${type} downloaded successfully.`);
      } else {
        setDelayImgStatus(true);
        setTimeout(() => {
          setDelayImgStatus(false);
        }, 2000);
      }

      // Handle the downloaded document path as needed (e.g., show it to the user)
    } catch (error) {
      setDelayImgStatus(false);
      setDelayToast(true);
      setDelayToastMessage('Error downloading document. Please try again.');
    }
  };

  const isImageType = fileName => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff'];
    const lowerCaseFileName = fileName && fileName?.toLowerCase();
    return imageExtensions?.some(ext => lowerCaseFileName?.endsWith(ext));
  };

  const isImageFile =
    documentData &&
    documentData.length > 0 &&
    documentData.some(item => isImageType(item.document_type));

  const isDocumentFile =
    documentData &&
    documentData.length > 0 &&
    documentData.some(item => !isImageType(item.document_type));

  const formattedDelayDate =
    data?.created_at && moment(data?.created_at).format('MMM D, YYYY h:mm A');

  const formattedModifiedDelayDate =
    data?.modified_at && moment(data?.modified_at).format('MMM D, YYYY h:mm A');

  const generateAndSavePDF = async () => {
    setReportFileUrl('');
    setReportDialog(true);
    try {
      const htmlContent = `   <style>
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
              <h2 class="name">${
                selectedProject?.builderDetails?.builderLabel
              }</h2>
              <div>
                ${
                  selectedProject?.builderDetails?.builderAdditional
                    ?.builderAddress
                },
              </div>
              <div>
              ${
                selectedProject?.builderDetails?.builderAdditional
                  ?.builderCity || ''
              },
              ${
                selectedProject?.builderDetails?.builderAdditional
                  ?.builderState || ''
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
              <h2 class="proname">
              ${
                selectedProject?.projectDetails?.projectAdditional
                  ?.projectAddress
              }, ${
        selectedProject?.projectDetails?.projectAdditional?.projectCity
      }, ${selectedProject?.projectDetails?.projectAdditional?.projectCountry}
              </h2>
              <div></div>
              <div class="to">Task Name:</div>
              <h2 class="proname">${
                selectedProject?.taskDetails?.taskLabel
              }</h2>
            </div>
            <div id="invoice">
              <h1>Delay Report #${data?.report_code}</h1>
              <div class="date">Report Date: ${stringValue(
                formattedDelayDate,
              )}</div>
              <div class="date">Last Update: ${stringValue(
                formattedModifiedDelayDate,
              )}</div>
            </div>
          </div>
          <h2 class="formName">Delay Information</h2>
          <table border="0" cellspacing="0" cellpadding="0">
          <thead>
            <tr>
              <th colspan="4">Incident Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="serialNo">Type:</td>
              <td>${stringValue(data?.type)}</td>
              <td class="serialNo">Shift Start:</td>
              <td>${stringValue(data?.shift_start)}</td>
            </tr>
            <tr>
            <td class="serialNo">Date of Start:</td>
            <td>${stringValue(formatDate(data?.date_of_start))}</td>
            <td class="serialNo">Time of Start:</td>
              <td>${stringValue(
                convertTimestampToAMPM(data?.time_of_start),
              )}</td>
            </tr>
            <tr>
              <td class="serialNo">Date of Finish:</td>
              <td>${stringValue(formatDate(data?.date_of_finish))}</td>
              <td class="serialNo">Time of Finish:</td>
              <td>${stringValue(
                convertTimestampToAMPM(data?.time_of_finish),
              )}</td>
            </tr>
            <tr>
              <td class="serialNo">Shift Finish:</td>
              <td>${stringValue(data?.shift_finish)}</td>
              <td class="serialNo">Labourers Affected:</td>
              <td>${integerValue(data?.num_labourers_affected)}</td>
            </tr>
            <tr>
              <td class="serialNo">Total Hours Lost:</td>
              <td colspan="3">${stringValue(
                formatTotalHoursLost(
                  data?.total_hours_lost,
                  data?.num_labourers_affected,
                ),
              )}</td>
            </tr>
          </tbody>
        </table>
          <h2 class="formName">Outcome / Mitigation Strategy</h2>
          <table border="0" cellspacing="0" cellpadding="0">
          <tbody>
            <tr>
              <td class="notes-col" colspan="2">Reason/Cause:</td>
            </tr>
            <tr>
              <td class="notes" colspan="2">${stringValue(
                data?.reason_cause,
              )}</td>
            </tr>
            <tr>
              <td class="notes-col" colspan="2">Delay Outcome:</td>
            </tr>
            <tr>
              <td class="notes" colspan="2">${stringValue(
                data?.outcomeRemarks,
              )}</td>
            </tr>
            <tr>
              <td class="notes-col" colspan="2">Mitigation Strategy:</td>
            </tr>
            <tr>
              <td class="notes" colspan="2">${stringValue(
                data?.mitigation_strategy,
              )}</td>
            </tr>
            <tr>
              <td class="notes-col" colspan="2">Extension of Time:</td>
            </tr>
            <tr>
              <td class="notes" colspan="2">${stringValue(
                data?.extension_of_time || 'No',
              )}</td>
            </tr>
            <tr>
              <td class="notes-col" colspan="2">Critical Path:</td>
            </tr>
            <tr>
              <td class="notes" colspan="2">${stringValue(
                data?.critical_path || 'No',
              )}</td>
            </tr>
          </tbody>
        </table>
        
          <h2 class="formName">Remarks</h2>
          <table border="0" cellspacing="0" cellpadding="0">
          <tbody>
          ${
            !data?.remarks
              ? ' <tr><td colspan="6" class="notes-col">No Record Found </td></tr>'
              : `
                <tr>
                  <td colspan="6" class="notes"> ${stringValue(
                    data?.remarks,
                  )}</td>
                </tr>
          `
          }
            </tbody>
          </table>
          <h2 class="formName">Attachments</h2>
          <table>
          <tbody>
          ${
            !isImageFile
              ? '<tr><td colspan="6" class="notes-col">No Record Found </td></tr>'
              : await (async () => {
                  const images = (
                    await Promise.all(
                      documentData
                        ?.filter(item => isImageType(item.document_type))
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
      </body>  `;

      const options = {
        html: htmlContent,
        fileName: '',
        directory: '',
        base64: true,
      };

      const pdfContent = await RNHTMLtoPDF.convert(options);
      const {fs} = ReactNativeBlobUtil;
      const documentDir = fs.dirs.DocumentDir;
      const downloadDir = fs.dirs.DownloadDir;
      const platformSpecificDir =
        Platform.OS === 'android' ? downloadDir : documentDir;
      const filePath = `${platformSpecificDir}/${data?.report_code?.replace(
        /\//g,
        '-',
      )}_${Date.now().toString().slice(-2)}.pdf`;

      const sharePDF = filePath => {
        const shareOptions = {
          title: 'Share file',
          url: 'file://' + filePath,
          type: 'application/pdf',
        };

        Share.open(shareOptions)
          .then(res => console.log(res))
          .catch(err => {
            err && console.log(err);
          });
      };

      await fs.writeFile(filePath, pdfContent?.base64, 'base64');
      sharePDF(filePath);
      setReportDescription(
        `Successfully downloaded the delay report.. \n\nFile location: ${filePath}`,
      );
      setReportFileUrl(`${filePath}`);
    } catch (error) {
      setReportDescription('Unable to download the delay report');
    }
  };
  const handleConfirm = () => {
    if (reportFileUrl) {
      navigate('PDFViewer', {pdfPath: reportFileUrl});
    }
  };
  return (
    <List.Section>
      <List.Accordion
        title="Delay Information"
        expanded={firstListExpanded}
        onPress={() => setFirstListExpanded(!firstListExpanded)}
        // Add any additional props or styles as needed
        left={props => <List.Icon {...props} icon="clock" />}>
        <View style={styles.twoColumnContainer}>
          <View style={styles.column}>
            <Text style={styles.columnTitle}>Delay Report ID</Text>
            <Text>{`${data?.report_code}`}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.columnTitle}>Report Date</Text>
            <Text>{stringValue(formatDate(data?.created_at))}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.columnTitle}>Delay Type</Text>
            <Text>{stringValue(data?.type)}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.columnTitle}>Date of Start</Text>
            <Text>{stringValue(formatDate(data?.date_of_start))}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.columnTitle}>Date of Finish</Text>
            <Text>
              {stringValue(formatDate(data?.date_of_finish) || 'Not Set')}
            </Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.columnTitle}>Time of Start</Text>
            <Text>
              {stringValue(convertTimestampToAMPM(data?.time_of_start))}
            </Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.columnTitle}>Time of Finish</Text>
            <Text>
              {data?.time_of_finish
                ? stringValue(convertTimestampToAMPM(data?.time_of_finish))
                : 'Not Set'}
            </Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.columnTitle}>Shift Start</Text>
            <Text>{stringValue(data?.shift_start)}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.columnTitle}>Shift Finish</Text>
            <Text>{stringValue(data?.shift_finish)}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.columnTitle}>Labourers Affected</Text>
            <Text>{stringValue(data?.num_labourers_affected)}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.columnTitle}>Hours Lost</Text>
            <Text>
              {stringValue(formatTotalHoursLost(data?.total_hours_lost))}
            </Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.columnTitle}>Man-hours Lost</Text>
            <Text>
              {stringValue(
                formatTotalHoursLost(
                  data?.total_hours_lost,
                  data?.num_labourers_affected,
                ) || 'Not Set',
              )}
            </Text>
          </View>
        </View>
      </List.Accordion>
      <List.Accordion
        title="Outcome / Mitigation Strategy"
        // Add any additional props or styles as needed
        left={props => <List.Icon {...props} icon="strategy" />}>
        <View style={styles.twoColumnContainer}>
          <View style={styles.columnFull}>
            <Text style={styles.columnTitle}>Reason/Cause</Text>
            <Text>{stringValue(data?.reason_cause)}</Text>
          </View>
          <View style={styles.columnFull}>
            <Text style={styles.columnTitle}>Delay Outcome</Text>
            <Text>{stringValue(data?.delay_outcome)}</Text>
          </View>
          <View style={styles.columnFull}>
            <Text style={styles.columnTitle}>Mitigation Strategy</Text>
            <Text>{stringValue(data?.mitigation_strategy)}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.columnTitle}>Extension of Time</Text>
            <Text>{stringValue(data?.extension_of_time || 'No')}</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.columnTitle}>Critical Path</Text>
            <Text>{stringValue(data?.critical_path || 'No')}</Text>
          </View>
        </View>
      </List.Accordion>
      <List.Accordion
        title="Remarks"
        // eslint-disable-next-line react/no-unstable-nested-components
        left={props => <List.Icon {...props} icon="comment" />}>
        <View style={styles.columnFull}>
          <Text>{stringValue(data?.remarks)}</Text>
        </View>
      </List.Accordion>
      {isDocumentFile && (
        <List.Accordion
          title="Documents"
          left={props => <List.Icon {...props} icon="file-document" />}>
          {documentData
            .filter(document => !isImageType(document.document_type))
            .map((document, index) => (
              <View style={styles.columnFull} key={index}>
                <List.Item
                  key={index}
                  title={`Document #${index + 1}`}
                  descriptionNumberOfLines={1}
                  description={document?.document_name
                    ?.split('_')
                    ?.slice(5)
                    ?.join('_')}
                  left={props => <List.Icon {...props} icon="file-document" />}
                  onPress={() =>
                    downloadDocument(
                      includeServerPath(document.document_path),
                      document?.document_name,
                    )
                  }
                />
              </View>
            ))}
        </List.Accordion>
      )}
      {isImageFile && (
        <List.Accordion
          title="Images"
          left={props => <List.Icon {...props} icon="image" />}>
          {documentData
            .filter(item => isImageType(item.document_type))
            .map((image, index) => (
              <View style={styles.columnFull} key={index}>
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
            ))}
        </List.Accordion>
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
        Download PDF
      </Chip>
      <ConfirmationDialog
        isVisible={reportDialog}
        title={'Download Delay Report'}
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
          visible={delayToast}
          duration={4000}
          onDismiss={() => setDelayToast(false)}>
          {delayToastMessage}
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
              status={delayImgStatus}
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
