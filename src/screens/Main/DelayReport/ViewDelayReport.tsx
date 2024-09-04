import React, {useEffect, useState, useRef, useMemo} from 'react';
import {StyleSheet, View, FlatList, ScrollView} from 'react-native';
import {darkColor} from '../../../themes';
import {useNavigation} from '@react-navigation/native';
import {ScreensNavigationProps} from '../../../@types/navigation';
import {
  Card,
  Text,
  ActivityIndicator,
  Button,
  Portal,
  Snackbar,
} from 'react-native-paper';
import {useAppSelector} from '../../../hooks/reduxHooks';
import {FontsStyle, fonts} from '../../../themes';
import {ConfirmationDialog} from '../../../components/PromiseDialog';
import {STATUS_HTTP_CODE} from '../../../constants/enumValues';
import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {useApiGetDelayReportDetail} from '../../../hooks/userDelayReportDetail';
import {useApiGetUserDelayReports} from '../../../hooks/userDelayReports';
import {useDeleteDelayReportMutation} from '../../../services/apiServices';
import {DelayReportView} from '../../../components/DelayReportView';
import {
  capitalizeFirstLetter,
  isValidArrayKey,
  isValidObjectKey,
  formatDate,
  formatTotalHoursLost,
} from '../../../utils/functions';
import {delayNotificationApi} from '../../../utils/pushNotificationUtil';

const LeftContent = ({
  timeStamp,
  finishStatus,
}: {
  timeStamp: Date;
  finishStatus: string;
}) => {
  const datetimestamp = new Date(timeStamp);
  const month = datetimestamp.toLocaleString('default', {month: 'short'});
  const time = datetimestamp.toLocaleString('en-GB', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
  return (
    <View style={styles.leftContainer}>
      <View style={styles.innerContainer}>
        <Text
          variant="titleSmall"
          style={styles.leftContainerText}>{`${month} '${datetimestamp
          .getFullYear()
          .toString()
          .substring(2)}`}</Text>
        <Text variant="headlineSmall" style={styles.leftContainerText}>
          {datetimestamp.getDate()}
        </Text>
        <Text variant="titleSmall" style={styles.leftContainerText}>
          {time}
        </Text>
      </View>
      <View
        style={[
          styles.innerContainer,
          {
            backgroundColor:
              finishStatus === 'OnGoing'
                ? darkColor.colors.inversePrimary
                : darkColor.colors.onSurfaceDisabled,
            marginTop: 10,
          },
        ]}>
        <Text variant="titleSmall">
          {finishStatus === 'OnGoing' ? 'Started' : 'Closed'}
        </Text>
      </View>
    </View>
  );
};

const RightContent = ({
  dateOfStart,
  dateOfFinish,
  outcomeRemarks,
  laboursAffected,
  hoursLost,
  finishStatus,
  delayID,
  reportCode,
  firstname,
  lastname,
}: {
  dateOfStart: string;
  dateOfFinish: string;
  outcomeRemarks: string;
  laboursAffected: number;
  hoursLost: number;
  finishStatus: string;
  delayID: string;
  reportCode: string;
  firstname: string;
  lastname: string;
}) => (
  <View style={{flex: 1, paddingLeft: 8}}>
    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
      <View style={{flex: 1, marginRight: 15}}>
        <Text variant="titleMedium">Delay ID</Text>
        <Text variant="bodyMedium">{`${reportCode}`}</Text>
      </View>
      <View style={{flex: 1}}>
        <Text variant="titleMedium">Labour Affect.</Text>
        <Text variant="bodyMedium">{laboursAffected}</Text>
      </View>
    </View>
    <View
      style={{
        flexDirection: 'row',
        marginTop: 10,
        justifyContent: 'space-between',
      }}>
      <View style={{flex: 1, marginRight: 15}}>
        <Text variant="titleMedium">Date of Start</Text>
        <Text variant="bodyMedium">{dateOfStart}</Text>
      </View>
      <View style={{flex: 1}}>
        <Text variant="titleMedium">Date of Finish</Text>
        <Text variant="bodyMedium">{dateOfFinish || 'Not Set'}</Text>
      </View>
    </View>
    <View
      style={{
        flexDirection: 'row',
        marginTop: 10,
        justifyContent: 'space-between',
      }}>
      <View style={{flex: 1, marginRight: 15}}>
        <Text variant="titleMedium">Hours Lost</Text>
        <Text variant="bodyMedium">{formatTotalHoursLost(hoursLost)}</Text>
      </View>
      <View style={{flex: 1}}>
        <Text variant="titleMedium">Man-Hours Lost</Text>
        <Text variant="bodyMedium">
          {formatTotalHoursLost(hoursLost, laboursAffected)}
        </Text>
      </View>
    </View>
    <View style={{marginTop: 10}}>
      <Text variant="titleMedium">Created By</Text>
      <Text variant="bodyMedium">{`${capitalizeFirstLetter(
        firstname,
      )} ${capitalizeFirstLetter(lastname)}`}</Text>
    </View>
    {/* <View style={{marginTop: 10}}>
      <Text variant="titleMedium">Outcome Remarks:</Text>
      <Text variant="bodyMedium" numberOfLines={2}>
        {outcomeRemarks || 'None'}
      </Text>
    </View> */}
  </View>
);

const ViewDelayReport = () => {
  const authDetails = useAppSelector(state => state?.authDetails);
  const selectedProject = useAppSelector(
    state => state?.assignedProjects?.currentProject,
  );

  const {goBack, navigate} = useNavigation<ScreensNavigationProps>();

  const [deleteDelayReport] = useDeleteDelayReportMutation();
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const [currentDelayID, setCurrentDelayID] = useState<number>(0);
  const [delayToast, setDelayToast] = useState<boolean>(false);
  const [delayToastMessage, setDelayToastMessage] = useState<string>('');
  const [delayRecords, setDelayRecords] = useState([]);
  const [bottomSheetVisible] = useState<number>(-1);

  const isValidParams: boolean =
    !!authDetails?.user?.id &&
    !!selectedProject?.projectDetails?.projectID &&
    !!selectedProject?.taskDetails?.taskID;

  const {
    isCollectiveDataLoading,
    collectiveData,
    isCollectiveDataError,
    isCollectiveDataSuccess,
  } = useApiGetUserDelayReports(
    authDetails?.user?.id ?? 0,
    selectedProject?.projectDetails?.projectID ?? 0,
    selectedProject?.taskDetails?.taskID ?? 0,
    !isValidParams,
  );

  const {
    isCollectiveDataReportLoading,
    collectiveDataReport,
    isCollectiveDataReportError,
    isCollectiveDataReportSuccess,
  } = useApiGetDelayReportDetail(
    authDetails?.user?.id ?? 0,
    currentDelayID ?? 0,
    !authDetails?.user?.id || !currentDelayID,
  );
  useEffect(() => {
    setDelayRecords(collectiveData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectiveData]);

  //BottomSheet
  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // variables
  const snapPoints = useMemo(() => ['90%'], []);

  const deleteReport = async () => {
    setDeleteDialog(false);
    try {
      const payload = await deleteDelayReport({
        userID: authDetails?.user?.id ?? 0,
        delayID: currentDelayID ?? 0,
      }).unwrap();
      if (payload?.status === STATUS_HTTP_CODE.SUCCESS) {
        delayNotificationApi.cancel(`DELAY-${currentDelayID}-OPENED`);
        setDelayRecords(
          delayRecords?.filter(item => item?.delayID !== currentDelayID),
        );
        setDelayToast(true);
        setDelayToastMessage('The delay / disruption report has been deleted.');
      } else {
        setDelayToast(true);
        setDelayToastMessage('Unable to delete the delay / disruption report.');
      }
    } catch (error: any) {
      setDelayToast(true);
      setDelayToastMessage('Unable to delete the delay / disruption report.');
    }
  };

  const renderItem = ({item}: {item: any}) => {
    console.log({item});
    return (
      <Card
        style={{
          paddingBottom: 10,
          marginBottom: 10,
          paddingRight: 5,
        }}>
        <Card.Content
          style={{
            flexDirection: 'row',
            marginBottom: 5,
          }}>
          <LeftContent
            timeStamp={item.delayDate}
            finishStatus={item.delayShiftFinish}
          />
          <RightContent
            dateOfStart={formatDate(item.delayStartDate)}
            dateOfFinish={formatDate(item.delayFinishDate)}
            outcomeRemarks={item.delayOutcome}
            laboursAffected={item.numLabourersAffected}
            hoursLost={item.totalHoursLost}
            finishStatus={item.delayShiftFinish}
            delayID={item.delayID}
            reportCode={item.reportCode}
            firstname={item.firstname}
            lastname={item.lastname}
          />
        </Card.Content>
        <Card.Actions>
          <Button
            onPress={() => {
              setCurrentDelayID(item.delayID);
              setDeleteDialog(true);
            }}>
            Delete
          </Button>
          <Button
            mode="outlined"
            onPress={() =>
              navigate('AddEditDelayReport', {
                isEdit: true,
                delayID: item.delayID,
              })
            }>
            Edit
          </Button>
          <Button
            onPress={() => {
              setCurrentDelayID(item.delayID);
              bottomSheetRef?.current?.expand();
            }}>
            View
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  return (
    <View style={{marginHorizontal: 10, marginBottom: 85}}>
      <Card
        mode="outlined"
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
              Encoutered an error while getting the project details. Try again
              later.
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
          data={delayRecords}
          renderItem={renderItem}
          keyExtractor={item => item.delayID}
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
            style={{marginTop: 10}}
            mode="contained"
            onPress={() => navigate('AddEditDelayReport', {isEdit: false})}>
            Add Delay / Disruption Report
          </Button>
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
      <ConfirmationDialog
        isVisible={deleteDialog}
        title={'Delete Delay Report'}
        description={'This will permanently delete the delay report'}
        onClose={() => setDeleteDialog(false)}
        onConfirm={deleteReport}
        cancelButtonChildren={'Cancel'}
        confirmButtionChildren={'Confirm'}
      />
      <Portal>
        <Snackbar
          visible={delayToast}
          duration={4000}
          onDismiss={() => setDelayToast(false)}>
          {delayToastMessage}
        </Snackbar>

        <BottomSheet
          ref={bottomSheetRef}
          backgroundStyle={{backgroundColor: darkColor?.colors?.background}}
          index={bottomSheetVisible}
          snapPoints={snapPoints}
          handleStyle={{
            backgroundColor: darkColor?.colors?.surfaceVariant,
            borderTopLeftRadius: 15,
            borderTopRightRadius: 15,
          }}
          handleIndicatorStyle={{
            backgroundColor: darkColor?.colors?.tertiary,
          }}
          footerComponent={() => (
            <Button
              style={{marginVertical: 10}}
              labelStyle={[FontsStyle.fontBold, {fontSize: fonts.size.regular}]}
              onPress={() => bottomSheetRef?.current.close()}>
              Close
            </Button>
          )}>
          <BottomSheetScrollView>
            {isCollectiveDataReportError ? (
              <Card mode="contained">
                <Card.Content>
                  <Text
                    variant="bodyLarge"
                    style={{
                      color: darkColor.colors.error,
                      textAlign: 'center',
                    }}>
                    Encoutered an error while getting the project details. Try
                    again later.
                  </Text>
                </Card.Content>
              </Card>
            ) : isCollectiveDataReportLoading ? (
              <ActivityIndicator animating={true} />
            ) : isCollectiveDataReportSuccess &&
              collectiveDataReport &&
              isValidObjectKey(collectiveDataReport) ? (
              <ScrollView>
                <DelayReportView
                  data={collectiveDataReport}
                  navigate={navigate}
                  bottomSheetViewRef={bottomSheetRef}
                />
              </ScrollView>
            ) : (
              <View
                style={{
                  alignItems: 'center',
                  flex: 1,
                  justifyContent: 'center',
                }}>
                <Text variant="titleMedium" style={FontsStyle.fontAlign}>
                  No records found!!!
                </Text>
              </View>
            )}
          </BottomSheetScrollView>
        </BottomSheet>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  leftContainer: {
    flexShrink: 1,
  },
  innerContainer: {
    backgroundColor: darkColor.colors.surfaceVariant,
    marginRight: 10,
    borderRadius: 8,
    padding: 6,
    minWidth: 85,
    alignItems: 'center',
    alignSelf: 'baseline',
  },
  projectStatus: {
    backgroundColor: darkColor.colors.surfaceVariant,
    marginRight: 10,
    borderRadius: 8,
    padding: 6,
    minWidth: 85,
    alignItems: 'center',
    alignSelf: 'baseline',
  },
  leftContainerText: {
    // color: darkColor.colors.background,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
});

export default ViewDelayReport;
