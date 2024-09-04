import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import Pdf from 'react-native-pdf';

type Props = React.ComponentProps<any>;

const PDFViewerScreen = ({route}: Props) => {
  const {pdfPath} = route.params;
  console.log(pdfPath);
  return (
    <View style={styles.container}>
      <Pdf
        source={{uri: pdfPath}}
        onError={error => {
          console.log(error);
        }}
        style={styles.pdf}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 25,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default PDFViewerScreen;
