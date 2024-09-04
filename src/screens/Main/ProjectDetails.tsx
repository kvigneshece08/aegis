import React, {useState} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {Button} from '../../components/Button';
import {useAppSelector} from '../../hooks/reduxHooks';
import {ItemSpaceTen} from '../../themes';
import {useNavigation} from '@react-navigation/native';
import {ScreensNavigationProps} from '../../@types/navigation';
import {Card, Portal} from 'react-native-paper';
import {SpaceSeparator} from '../../components/SpaceSeparator/SpaceSeparator';
import {
  useMandatoryPermission,
  PermissionType,
} from '../../hooks/usePermission';
import {PermissionDialog} from '../../components/CameraModal/PermissionDialog';

const ProjectDetails = () => {
  const {navigate} = useNavigation<ScreensNavigationProps>();
  const selectedProject = useAppSelector(
    state => state?.assignedProjects?.currentProject,
  );
  const {
    status: notificationPermissionStatus,
    request: requestNotificationPermission,
    dialogVisible: notificationPermissionDialogVisible,
  } = useMandatoryPermission(PermissionType.NOTIFICATION);
  const [showNotificationDialog, setShowNotificationDialog] = useState(false);
  const isEligible =
    selectedProject?.builderDetails?.builderID &&
    selectedProject?.projectDetails?.projectID &&
    selectedProject?.taskDetails?.taskID;
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card contentStyle={{marginVertical: 10}}>
        <Card.Title
          title="Site Report"
          subtitle="Site Report for recording daily progress, number of workers, sub-contractors on-site, photographs, climatic conditions."
          subtitleNumberOfLines={6}
          titleVariant="titleLarge"
        />
        <Card.Actions>
          <Button
            disabled={!isEligible}
            onPress={() => navigate('ViewSiteReport')}>
            View
          </Button>
          <Button
            disabled={!isEligible}
            onPress={() => navigate('AddEditSiteReport', {isEdit: false})}>
            Add Report
          </Button>
        </Card.Actions>
      </Card>
      <SpaceSeparator spacing="margin" />
      <Card contentStyle={{marginVertical: 10}}>
        <Card.Title
          title="Delay and Disruption Report"
          subtitle="Delay and Disruption to record events causing delay and disruption to the project including Start and end date (time), root cause, outcome of the delay, number of workers affected, number of hours affected, mitigation strategy adopted, photographs."
          subtitleNumberOfLines={6}
          titleVariant="titleLarge"
        />
        <Card.Actions>
          <Button
            disabled={!isEligible}
            onPress={() => navigate('ViewDelayReport')}>
            View
          </Button>
          <Button
            disabled={!isEligible}
            onPress={() => {
              if (notificationPermissionDialogVisible) {
                setShowNotificationDialog(true);
              } else {
                navigate('AddEditDelayReport', {isEdit: false});
              }
            }}>
            Add Report
          </Button>
        </Card.Actions>
      </Card>
      <SpaceSeparator spacing="margin" />
      <Card contentStyle={{marginVertical: 10}}>
        <Card.Title
          title="Templates and Notices"
          subtitle="Predefined templates and notices are available for download. Fill in the details and upload them into the site reports."
          subtitleNumberOfLines={6}
          titleVariant="titleLarge"
        />
        <Card.Actions>
          <Button
            disabled={!isEligible}
            onPress={() => navigate('ViewTemplatesAndFormsDashboard')}>
            View
          </Button>
        </Card.Actions>
      </Card>
      <Portal>
        <PermissionDialog
          visible={
            showNotificationDialog && notificationPermissionDialogVisible
          }
          title={'Notification Permission'}
          content={
            'The app requires permission to access push notifications in order to add reports.'
          }
          grantButtonText={
            notificationPermissionStatus?.canAskAgain
              ? 'Grant Permission'
              : 'Settings'
          }
          onDismiss={() => setShowNotificationDialog(false)}
          onGrant={requestNotificationPermission}
        />
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 10,
    marginVertical: ItemSpaceTen.spaceTenVerticalMargin.marginVertical,
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
});

export default ProjectDetails;
