import React, {useState, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {useRoute} from '@react-navigation/native';
import {Chip} from 'react-native-paper';
import PDFViewerScreen from '../../../screens/Main/PDFViewer';
import {ConfirmationDialog} from '../../PromiseDialog';
import {useNavigation} from '@react-navigation/native';
import Share from 'react-native-share';

const PdfPreview = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // @ts-ignore
  const {filePath, reportId} = route.params;
  const {fs} = ReactNativeBlobUtil;
  const [reportDialog, setReportDialog] = useState<boolean>(false);
  const [reportDescription, setReportDescription] =
    useState<string>('Loading...');

  useEffect(() => {
    return async () => {
      // Delete temporary file when component unmounts and check if file is present
      if (filePath && (await fs.exists(filePath))) {
        fs.unlink(filePath);
      }
    };
  }, [filePath]);

  const handleDownload = async () => {
    try {
      let newFilePath = filePath.replace('no_doc_', '');
      const baseName = newFilePath.replace(/(\.\w+)$/, '');
      const extension = newFilePath.match(/(\.\w+)$/)[0];
      let counter = 1;
  
      // If the file exists, create a new name
      while (await fs.exists(newFilePath)) {
        newFilePath = `${baseName}_${counter}${extension}`;
        counter++;
      }
  
      await fs.cp(filePath, newFilePath);
      const sharePDF = (filePath) => {
        const shareOptions = {
          title: 'Share file',
          url: 'file://' + newFilePath, // Use newFilePath here
          type: 'application/pdf',
        };
  
        Share.open(shareOptions)
          .then((res) => console.log(res))
          .catch((err) => {
            err && console.log(err);
          });
      };
  
      sharePDF(newFilePath);
      await fs.unlink(filePath);
      setReportDescription(
        `Successfully downloaded the site report.. \n\nFile location: ${newFilePath}`,
      );
      setReportDialog(true);
    } catch (error) {
      console.error(error);
      setReportDescription('Unable to download the site report');
    }
  };  

  return (
    <View style={styles.container}>
      {filePath && (
        <PDFViewerScreen
          route={{
            params: {
              pdfPath: filePath,
            },
          }}
        />
      )}
      <Chip
        onPress={handleDownload}
        icon="file-download"
        mode="flat"
        compact
        style={{
          marginVertical: 20,
          alignSelf: 'flex-end',
          position: 'absolute',
          bottom: 0,
          right: 10,
        }}>
        Download Selected
      </Chip>

      <ConfirmationDialog
        isVisible={reportDialog}
        title={'Download Site Report'}
        description={reportDescription}
        onClose={() => {
          setReportDialog(false);
          // route back to the previous screen
          navigation.goBack();
        }}
        cancelButtonChildren={'Close'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default PdfPreview;
