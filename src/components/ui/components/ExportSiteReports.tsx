import React, {useState, useEffect} from 'react';
import {Button} from 'react-native-paper';
import {useApiGetSiteReportDetails} from '../../../hooks/userSiteReportDetails';
import {Platform, View} from 'react-native';
import {ConfirmationDialog} from '../../PromiseDialog';
import {zip} from 'react-native-zip-archive';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {generateHTMLContent} from '../../../utils/htmlContentUtils';
import RNHTMLtoPDF from 'react-native-html-to-pdf';

export const ExportSiteReports = ({
  filteredData,
  authDetails,
  selectedProject,
}) => {
  const [reportDetails, setReportDetails] = useState({});
  const [currentExportReportId, setcurrentExportReportId] = useState(null);

  const [failedReports, setFailedReports] = useState([]);

  const [exportDialogVisible, setExportDialogVisible] = useState(false);
  const [exportDialogTitle, setExportDialogTitle] = useState('');
  const [exportDialogDescription, setExportDialogDescription] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);

  const {
    isCollectiveDataReportLoading,
    collectiveDataReport,
    isCollectiveDataReportError,
    isCollectiveDataReportSuccess,
  } = useApiGetSiteReportDetails(
    authDetails?.user?.id ?? 0,
    currentExportReportId ?? 0,
    !authDetails?.user?.id || !currentExportReportId,
  );

  useEffect(() => {
    if (!isCollectiveDataReportLoading) {
      if (isCollectiveDataReportError) {
        setFailedReports((prevFailedReports: any[]) => {
          return [...prevFailedReports, currentExportReportId];
        });
      } else if (collectiveDataReport) {
        setReportDetails(prevDetails => ({
          ...prevDetails,
          [currentExportReportId]: collectiveDataReport,
        }));
      }
      const nextReportId = getNextReportId(currentExportReportId);
      if (nextReportId) {
        setcurrentExportReportId(nextReportId);
      }
    }
  }, [
    isCollectiveDataReportLoading,
    collectiveDataReport,
    isCollectiveDataReportError,
  ]);

  useEffect(() => {
    if (
      reportDetails &&
      filteredData &&
      Object.keys(reportDetails).length > 0 &&
      Object.keys(reportDetails).length === filteredData.length
    ) {
      setDataLoaded(true);
    }
  }, [reportDetails, filteredData]);

  const getNextReportId = currentExportReportId => {
    const currentIndex = filteredData?.findIndex(
      item => item.reportID === currentExportReportId,
    );
    if (currentIndex !== -1 && currentIndex < filteredData?.length - 1) {
      return filteredData[currentIndex + 1]?.reportID;
    }
    return null;
  };

  const exportPdfsZip = () => {
    // Start the fetching process
    setExportDialogTitle('Exporting PDFs');
    setExportDialogDescription('Please wait...');
    setExportDialogVisible(true);
    setcurrentExportReportId(filteredData[0]?.reportID); // Start fetching data
  };

  async function generatePdfFromHTML(htmlContent: string) {
    const options = {
      html: htmlContent,
      fileName: `temp-pdf__${Date.now()}.pdf`, // Temporary file name
    };
    const file = await RNHTMLtoPDF.convert(options);
    return file?.filePath;
  }

  const generateZip = async () => {
    try {
      const {fs} = ReactNativeBlobUtil;
      const pdfPaths = [];

      for (const [index, record] of Object.values(reportDetails).entries()) {
        const htmlContent = await generateHTMLContent(
          false,
          selectedProject,
          record,
          {},
          authDetails,
        );
        const pdfPath = await generatePdfFromHTML(htmlContent);
        if (pdfPath) {
          pdfPaths.push(pdfPath);
        }
      }

      const documentDir = fs?.dirs?.DocumentDir;
      const downloadDir = fs?.dirs?.DownloadDir;
      const platformSpecificDir =
        Platform.OS === 'android' ? downloadDir : documentDir;
      const filePath = `${platformSpecificDir}/SiteReports-${Date.now()}.zip`;

      await zip(pdfPaths, filePath)
        .then(path => {
          setExportDialogTitle('SiteReports Exported');
          setExportDialogDescription(
            `Successfully exported ${pdfPaths.length} PDFs in a zip. \n\nFile location: ${path}` +
              (failedReports.length > 0
                ? `\n\nFailed to export reports with IDs: ${failedReports.join(
                    ', ',
                  )}`
                : ''),
          );
        })
        .catch(error => {
          console.error('Failed to create ZIP archive:', error);
          setExportDialogTitle('Export Failed');
          setExportDialogDescription(
            'An error occurred while exporting SiteReports.' + error.message(),
          );
        });
    } catch (error) {
      console.error('Failed to generate ZIP archive:', error);
      setExportDialogTitle('Export Failed');
      setExportDialogDescription(
        'An error occurred while exporting SiteReports.' + error.message(),
      );
    }
  };

  useEffect(() => {
    if (dataLoaded && exportDialogVisible) {
      generateZip();
    }
  }, [dataLoaded, exportDialogVisible]);

  return (
    <>
      <View style={{width: '30%'}}>
        <Button
          mode="contained"
          style={{borderRadius: 5}}
          icon="export-variant"
          onPress={exportPdfsZip}>
          Export
        </Button>
      </View>
      <ConfirmationDialog
        isVisible={exportDialogVisible}
        title={exportDialogTitle}
        description={exportDialogDescription}
        onClose={() => setExportDialogVisible(false)}
        cancelButtonChildren="Close"
      />
    </>
  );
};
