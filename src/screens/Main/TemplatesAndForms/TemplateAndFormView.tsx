import React, {useState} from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {darkColor} from '../../../themes';
import {useNavigation, useRoute} from '@react-navigation/native';
import {ScreensNavigationProps} from '../../../@types/navigation';
import {Card, Text, Button, Portal, Snackbar} from 'react-native-paper';
import {useAppSelector} from '../../../hooks/reduxHooks';
import {FontsStyle, fonts} from '../../../themes';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import {useApiGetProjectTemplates} from '../../../hooks/userProjectTemplates';
import {includeServerPath, isValidArrayKey} from '../../../utils/functions';
import ReactNativeBlobUtil from 'react-native-blob-util';
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

const TemplateAndFormView = () => {
  const authDetails = useAppSelector(state => state?.authDetails);
  const selectedProject = useAppSelector(
    state => state?.assignedProjects?.currentProject,
  );

  const {goBack, navigate} = useNavigation<ScreensNavigationProps>();

  const [documentToast, setDocumentToast] = useState<boolean>(false);
  const [documentToastMessage, setDocumentToastMessage] = useState<string>('');

  const route = useRoute();
  const { paramName } = route.params;
  const downloadDocument = async (url, fileName, docType) => {
    const {dirs} = ReactNativeBlobUtil.fs;
    if (!fileName.endsWith(`.${docType}`)) {
      fileName += `.${docType}`;
    }
    
    const filePath =
      Platform.OS === 'ios'
        ? `${dirs.DocumentDir}/${fileName}`
        : `${dirs.DownloadDir}/${fileName}`;
    try {
      await ReactNativeBlobUtil.config({
        fileCache: true,
        path: filePath, // Use path configuration for iOS
      })
      .fetch('GET', url)
      .then((res) => {
        console.log('File saved to:', res.path());
        setDocumentToast(true);
        setDocumentToastMessage('Document downloaded successfully.');

        var fileType = '';
        if (docType === 'doc') {
          fileType = 'application/msword';
        } else if (docType === 'docx') {
          fileType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        } else if (docType === 'pdf') {
          fileType = 'application/pdf';
        } else {
          // Default to octet-stream for unknown types
          fileType = 'application/octet-stream';
        }

        // Share the file after download
        const shareOptions = {
          title: 'Share file',
          url: `file://${res.path()}`,
          type: fileType, 
        };

        Share.open(shareOptions)
          .then((shareRes) => {
            console.log('File shared successfully:', shareRes);
            setDocumentToast(false);
          })
          .catch((shareErr) => {
            console.log('Error sharing file:', shareErr);
            setDocumentToast(false);
          });
      })
      .catch((error) => {
        console.log('Error during download:', error);
        setDocumentToast(true);
        setDocumentToastMessage('Error downloading document. Please try again.');
      });
    } catch (error) {
      console.log('Download error:', error);
      setDocumentToast(true);
      setDocumentToastMessage('Error downloading document. Please try again.');
    }
  };  

  const viewHandler = async (item: any) => {
    const filePath = item?.documentPath;
    const fileName = item?.documentName;
    const isDocFile = filePath?.endsWith('.doc') || filePath?.endsWith('.docx');
    const isPdfFile = filePath?.endsWith('.pdf');
    const fileType = filePath?.endsWith('.doc') ? 'doc' : (filePath?.endsWith('.docx') ? 'docx' : '');
  
    if (isDocFile) {
      try {
        // Determine the platform-specific directory for saving the file
        const { fs } = ReactNativeBlobUtil;
        const documentDir = fs.dirs.DocumentDir;
        const downloadDir = RNFS.DownloadDirectoryPath;
        const platformSpecificDir = Platform.OS === 'android' ? downloadDir : documentDir;
        const downloadFilePath = `${platformSpecificDir}/${fileName || 'TempDocument' }.${fileType || 'doc'}`;
  
        // Download the file to the specified path
        const res = await ReactNativeBlobUtil.config({
          fileCache: true,
          path: downloadFilePath,
        }).fetch('GET', includeServerPath(filePath));
  
        if (res?.info()?.status === 200) {
          console.log('File downloaded successfully:', downloadFilePath);
  
          // Open the downloaded file
          await FileViewer.open(downloadFilePath);
          console.log('File opened successfully');
        } else {
          console.error('Download failed with status code:', res.info().status);
        }
      } catch (error) {
        console.error('Error downloading or opening file:', error);
      }
    } else if (isPdfFile) {
      navigate('PDFViewer', {
        pdfPath: includeServerPath(item.documentPath),
      });
    } else {
      console.error('Unsupported file type');
    }
  };

  const isValidParams: boolean =
    !!authDetails?.user?.id &&
    !!selectedProject?.builderDetails?.builderID &&
    !!selectedProject?.projectDetails?.projectID &&
    !!selectedProject?.taskDetails?.taskID;

  const {
    isCollectiveDataLoading,
    collectiveData,
    isCollectiveDataError,
    isCollectiveDataSuccess,
  } = useApiGetProjectTemplates(
    selectedProject?.builderDetails?.builderID ?? 0,
    selectedProject?.projectDetails?.projectID ?? 0,
    selectedProject?.taskDetails?.taskID ?? 0,
    !isValidParams,
  );

  const renderItem = ({item}: {item: any}) => {
    const iconType = item?.documentType?.toLowerCase() === 'pdf' 
    ? 'pdf' : (['doc', 'docx'].includes(item?.documentType?.toLowerCase()) ? 'word' : '');
    return (
      <Card
        style={{
          marginBottom: 15,
          paddingRight: 5,
        }}>
        <Card.Content
          style={{
            flexDirection: 'row',
            paddingLeft: 0,
            paddingTop: 0,
            paddingBottom: 0,
            paddingRight: 0,
          }}>
          <View style={styles.leftContainer}>
            <View style={styles.innerContainer}>
              <FontAwesome6
                name={`file-${iconType}`}
                size={26}
                color={'#646161'}
              />
            </View>
          </View>
          <View style={{flex: 1, paddingLeft: 8}}>
            <View style={{justifyContent: 'space-between', paddingTop: 10}}>
              <Text variant="titleMedium">{item?.documentName}</Text>

              <Text variant="bodySmall" style={{paddingTop: 5}}>
                {item?.documentDescription ||
                  'Download & Fill in the details and upload them into the reports.'}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignSelf: 'flex-end',
                paddingTop: 10,
                marginBottom: 5,
              }}>
              <Button
                mode="text"
                onPress={() =>
                  downloadDocument(
                    includeServerPath(item?.documentPath),
                    item?.documentName,
                    item?.documentType
                  )
                }>
                Download
              </Button>
              <Button
                onPress={() =>
                 viewHandler(item)
                }>
                View
              </Button>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const filteredData = collectiveData?.filter((item: any) => {
    if (paramName === 'Templates') {
      return item?.templateType.toLowerCase() === 'template';
    } else if (paramName === 'Notices') {
      return item?.templateType.toLowerCase() === 'notice';
    }
    return [];
  });

  return (
    <View style={{marginHorizontal: 10, marginBottom: 85}}>
      <Card
        mode="contained"
        style={{
          marginBottom: 10,
          borderColor: darkColor.colors.tertiaryContainer,
        }}>
        <Card.Title
          title={`${selectedProject?.projectDetails?.projectLabel} -> ${selectedProject?.taskDetails?.taskLabel} site reports`}
          titleNumberOfLines={2}
          titleStyle={{padding: 10}}
        />
      </Card>
      {isCollectiveDataError ? (
        <Card mode="contained">
          <Card.Content>
            <Text
              variant="bodyLarge"
              style={{color: darkColor.colors.error, textAlign: 'center'}}>
              Encoutered an error while getting the templates and forms. Try
              again later.
            </Text>
            <Button
              labelStyle={[
                FontsStyle.fontBold,
                {fontSize: fonts.size.regular, marginTop: 10},
              ]}
              mode="text"
              compact
              onPress={() => goBack()}>
              Go back to project details
            </Button>
          </Card.Content>
        </Card>
      ) : isCollectiveDataLoading ? (
        <ActivityIndicator animating={true} />
      ) : isCollectiveDataSuccess && isValidArrayKey(collectiveData) ? (
        <FlatList
          data={filteredData}
          renderItem={renderItem}
          keyExtractor={item => item.templateDocumentID}
        />
      ) : (
        <View
          style={{
            alignItems: 'center',
            marginVertical: 40,
            justifyContent: 'center',
          }}>
          <Text variant="titleMedium" style={FontsStyle.fontAlign}>
            No records found!!!
          </Text>
          <Button
            labelStyle={[
              FontsStyle.fontBold,
              {fontSize: fonts.size.regular, marginTop: 10},
            ]}
            mode="text"
            onPress={() => goBack()}>
              Go back 
          </Button>
        </View>
      )}
      <Portal>
        <Snackbar
          visible={documentToast}
          duration={4000}
          onDismiss={() => setDocumentToast(false)}>
          {documentToastMessage}
        </Snackbar>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  leftContainer: {
    flexShrink: 1,
  },
  innerContainer: {
    backgroundColor: darkColor.colors.onSecondaryContainer,
    marginRight: 10,
    borderRadius: 8,
    padding: 6,
    minWidth: 80,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
});

export default TemplateAndFormView;
