import React from 'react';
import {
  StyleSheet,
  View
} from 'react-native';
import {Card, Text, List} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {ScreensNavigationProps} from '../../../@types/navigation';

const TemplateAndFormsDashboard = () => {

const navigation = useNavigation<ScreensNavigationProps>();
  return (
    <Card>
        <Card.Content
          style={{
            flexDirection: 'column',
            paddingLeft: 0,
            paddingTop: 0,
            paddingBottom: 0,
            paddingRight: 0,
          }}>
            <List.Item
             style={styles.innerContainer}
                key={'template'}
                title={`Templates`}
                descriptionNumberOfLines={1}
                description={''}
                onPress={() => navigation.navigate('ViewTemplatesAndForms', {paramName: 'Templates'})}
            />
            <List.Item
                style={styles.innerContainer}
                key={'notices'}
                title={`Notices`}
                descriptionNumberOfLines={1}
                description={''}
                onPress={() => navigation.navigate('ViewTemplatesAndForms', {paramName: 'Notices'})}
            />
        </Card.Content>
      </Card>
  );
};

const styles = StyleSheet.create({
  leftContainer: {
    flexShrink: 1,
  },
  innerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingLeft: 30,
  },
  text: {
    fontSize: 18,
  },
});

export default TemplateAndFormsDashboard;
