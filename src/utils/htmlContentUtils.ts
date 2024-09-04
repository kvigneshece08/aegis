import {
  isImageType,
  getImageSize,
  includeServerPath,
  getLabelForValue,
} from './functions';
import moment from 'moment';
import {WORK_ACTIVITY_TYPE} from './constants';

export const generateHTMLContent = async (
  preview: boolean,
  selectedProject: object,
  data: object,
  selectedValues: object,
  authDetails,
) => {
  const integerValue = (val: number): number => val || 0;
  const stringValue = (val: string): string => val || 'None';
  const formattedReportDate =
    data?.report_date && moment(data?.report_date).format('MMM D, YYYY h:mm A');
  const formattedModifiedDate =
    data?.modified_at && moment(data?.modified_at).format('MMM D, YYYY h:mm A');
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
  const signatureParse = data?.signature?.replace(/[\u0000-\u001F]/g, '');
  const signature = signatureParse && JSON.parse(signatureParse);

  const documentData = data?.documents && JSON.parse(data?.documents);
  const isImageFile =
    documentData &&
    documentData?.length > 0 &&
    documentData?.some(item => isImageType(item?.document_type));
  const generalImageFiles =
    isImageFile &&
    documentData?.filter(item => item?.document_activity === 0)?.length > 0;

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
          ${selectedProject?.builderDetails?.builderAdditional?.builderAddress},
        </div>
        <div>
        ${
          selectedProject?.builderDetails?.builderAdditional?.builderCity || ''
        },
        ${
          selectedProject?.builderDetails?.builderAdditional?.builderState || ''
        },
        ${
          selectedProject?.builderDetails?.builderAdditional?.builderCountry ||
          ''
        },
        ${
          selectedProject?.builderDetails?.builderAdditional?.builderPincode ||
          ''
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
          selectedProject?.projectDetails?.projectAdditional?.projectAddress
        }, ${
          selectedProject?.projectDetails?.projectAdditional?.projectCity
        }, ${
          selectedProject?.projectDetails?.projectAdditional?.projectCountry
        }
        </h2>
        <div></div>
        <div class="to">Task Name:</div>
        <h2 class="proname">${selectedProject?.taskDetails?.taskLabel}</h2>
      </div>
      <div id="invoice">
        <h1>Site Report #SR-ID-${integerValue(data?.report_id)}</h1>
        <div class="date">Report Date: ${stringValue(formattedReportDate)}</div>
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
                      <td>${stringValue(subContractor?.contractorCompany)}</td>
                      <td>${stringValue(subContractor?.contractorFunction)}</td>
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
                        subContractor?.contractorNotes?.replace(/\n/g, '<br>'),
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
                            item?.document_activity === index + 1,
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
                <td>${stringValue(overtimeDetailsVal?.overTimeTotalWorker)}</td>
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
                      }; width: ${isPortrait ? 'auto' : `${imageHeight}px`};" />
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
