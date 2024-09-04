import React, {useEffect, useState, useRef, useMemo} from 'react';
import {StyleSheet, View, FlatList, ScrollView} from 'react-native';
import {darkColor} from '../../../themes';
import {useNavigation} from '@react-navigation/native';
import {ScreensNavigationProps} from '../../../@types/navigation';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Card,
  Text,
  ActivityIndicator,
  Button,
  Portal,
  Snackbar,
} from 'react-native-paper';
import {useAppSelector} from '../../../hooks/reduxHooks';
import {useApiGetUserProjectSiteReport} from '../../../hooks/userProjectSiteReport';
import {useApiGetSiteReportDetails} from '../../../hooks/userSiteReportDetails';
import {ExportSiteReports} from '../../../components/ui/components/ExportSiteReports';
import {FontsStyle, fonts} from '../../../themes';
import {useDeleteSiteReportMutation} from '../../../services/apiServices';
import {ConfirmationDialog} from '../../../components/PromiseDialog';
import {STATUS_HTTP_CODE} from '../../../constants/enumValues';
import BottomSheet, {BottomSheetScrollView} from '@gorhom/bottom-sheet';
import {SiteReportView} from '../../../components/SiteReportView';
import {
  capitalizeFirstLetter,
  isValidArrayKey,
  isValidObjectKey,
} from '../../../utils/functions';
import moment from 'moment';
import {useFocusEffect} from '@react-navigation/native';

const LeftContent = ({timeStamp}: {timeStamp: Date}) => {
  const datetimestamp = new Date(timeStamp);
  const month = datetimestamp.toLocaleString('default', {month: 'short'});
  const time = datetimestamp.toLocaleString('en-US', {
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
    </View>
  );
};

const RightContent = ({
  reportID,
  reportCode,
  firstname,
  lastname,
  workerNo,
  remarks,
}: {
  reportID: string;
  reportCode: string;
  firstname: string;
  lastname: string;
  workerNo: string;
  remarks: string;
}) => (
  <View style={{flex: 1, paddingLeft: 8}}>
    <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
      <View style={{flex: 1, marginRight: 15}}>
        <Text variant="titleMedium">Report ID</Text>
        <Text variant="bodyMedium">{`${reportCode}`}</Text>
      </View>
      <View style={{flex: 1}}>
        <Text variant="titleMedium">Labour strength</Text>
        <Text variant="bodyMedium">{workerNo || 0}</Text>
      </View>
    </View>
    <View style={{marginTop: 10}}>
      <Text variant="titleMedium">Created By</Text>
      <Text variant="bodyMedium">{`${capitalizeFirstLetter(
        firstname,
      )} ${capitalizeFirstLetter(lastname)}`}</Text>
    </View>
  </View>
);

const ViewSiteReport = () => {
  const authDetails = useAppSelector(state => state?.authDetails);
  const selectedProject = useAppSelector(
    state => state?.assignedProjects?.currentProject,
  );

  const {goBack, navigate} = useNavigation<ScreensNavigationProps>();

  const [deleteSiteReport] = useDeleteSiteReportMutation();
  const [deleteDialog, setDeleteDialog] = useState<boolean>(false);
  const [currentReportID, setCurrentReportID] = useState<number>(0);
  const [siteToast, setSiteToast] = useState<boolean>(false);
  const [siteToastMessage, setSiteToastMessage] = useState<string>('');
  const [siteRecords, setSiteRecords] = useState([]);
  const [bottomSheetVisible] = useState<number>(-1);

  const [fromDate, setFromDate] = useState(moment().startOf('month').toDate());
  const [toDate, setToDate] = useState(moment().toDate());
  const [datePickerMode, setDatePickerMode] = useState<'from' | 'to' | null>(
    null,
  );
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    const newFilteredData = (siteRecords || [])?.filter(record => {
      const recordDate = moment(record.reportDate);
      return (
        recordDate.isSameOrAfter(moment(fromDate)) &&
        recordDate.isSameOrBefore(moment(toDate))
      );
    });

    setFilteredData(newFilteredData);
  }, [fromDate, toDate, siteRecords]);

  useEffect(() => {
    if (siteRecords && siteRecords.length > 0) {
      const timestamps = siteRecords.map(record =>
        moment(record.reportDate).valueOf(),
      );
      const minTimestamp = Math.min(...timestamps);
      const maxTimestamp = Math.max(...timestamps);
      setFromDate(moment(minTimestamp).toDate());
      setToDate(moment(maxTimestamp).toDate());
    }
  }, [siteRecords]);

  const isValidParams: boolean =
    !!authDetails?.user?.id &&
    !!selectedProject?.projectDetails?.projectID &&
    !!selectedProject?.taskDetails?.taskID;

  const {
    isCollectiveDataLoading,
    collectiveData,
    isCollectiveDataError,
    isCollectiveDataSuccess,
  } = useApiGetUserProjectSiteReport(
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
  } = useApiGetSiteReportDetails(
    authDetails?.user?.id ?? 0,
    currentReportID ?? 0,
    !authDetails?.user?.id || !currentReportID,
  );
  useEffect(() => {
    setSiteRecords(collectiveData);
  }, [collectiveData]);

  //BottomSheet
  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // reopen after pdf preview.
  useFocusEffect(
    React.useCallback(() => {
      // Reopen the BottomSheet when the screen comes into focus
      bottomSheetRef?.current?.snapToIndex(0); // Assuming 1 is the open position
    }, []),
  );

  // variables
  const snapPoints = useMemo(() => ['90%'], []);

  const deleteReport = async () => {
    setDeleteDialog(false);
    try {
      const payload = await deleteSiteReport({
        userID: authDetails?.user?.id ?? 0,
        reportID: currentReportID ?? 0,
      }).unwrap();
      if (payload?.status === STATUS_HTTP_CODE.SUCCESS) {
        setSiteRecords(
          siteRecords?.filter(item => item?.reportID !== currentReportID),
        );
        setSiteToast(true);
        setSiteToastMessage('The site report has been deleted.');
      } else {
        setSiteToast(true);
        setSiteToastMessage('Unable to delete the site report.');
      }
    } catch (error: any) {
      setSiteToast(true);
      setSiteToastMessage('Unable to delete the site report.');
    }
  };

  const renderItem = ({item}: {item: any}) => {
    return (
      <Card style={{paddingBottom: 10, marginBottom: 10, paddingRight: 5}}>
        <Card.Content style={{flexDirection: 'row', marginBottom: 5}}>
          <LeftContent timeStamp={item?.reportDate} />
          <RightContent
            reportID={item?.reportID}
            reportCode={item?.reportCode}
            firstname={item?.firstname}
            lastname={item?.lastname}
            workerNo={item?.totalWorkerCount}
            remarks={item?.siteMeetingNotes}
          />
        </Card.Content>
        <Card.Actions>
          <Button
            onPress={() => {
              setCurrentReportID(item.reportID);
              setDeleteDialog(true);
            }}>
            Delete
          </Button>
          <Button
            mode="outlined"
            onPress={() =>
              navigate('AddEditSiteReport', {
                isEdit: true,
                reportID: item.reportID,
              })
            }>
            Edit
          </Button>
          <Button
            onPress={() => {
              setCurrentReportID(item.reportID);
              bottomSheetRef?.current?.expand();
            }}>
            View
          </Button>
        </Card.Actions>
      </Card>
    );
  };
  return (
    <View style={{marginHorizontal: 10, marginBottom: 140}}>
      <Card mode="outlined" style={{marginBottom: 10}}>
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
        <>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 15,
              alignItems: 'flex-end',
            }}>
            <View style={{width: '30%'}}>
              <Text style={{paddingBottom: 5}}>FROM</Text>
              <Button
                mode="outlined"
                style={{borderRadius: 5}}
                icon="calendar"
                onPress={() => setDatePickerMode('from')}>
                {fromDate.toLocaleDateString('en-GB')}
              </Button>
            </View>
            <View style={{width: '30%'}}>
              <Text style={{paddingBottom: 5}}>TO</Text>
              <Button
                mode="outlined"
                style={{borderRadius: 5}}
                icon="calendar"
                onPress={() => setDatePickerMode('to')}>
                {toDate.toLocaleDateString('en-GB')}
              </Button>
            </View>
            <ExportSiteReports
              filteredData={filteredData}
              authDetails={authDetails}
              selectedProject={selectedProject}
            />
          </View>
          {datePickerMode && (
            <DateTimePicker
              value={datePickerMode === 'from' ? fromDate : toDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  if (datePickerMode === 'from') {
                    setFromDate(selectedDate);
                  } else {
                    setToDate(selectedDate);
                  }
                }
                setDatePickerMode(null);
              }}
            />
          )}
          <FlatList
            data={filteredData}
            renderItem={renderItem}
            keyExtractor={item => item.reportID}
          />
        </>
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
            style={{marginTop: 20}}
            mode="contained"
            onPress={() => navigate('AddEditSiteReport', {isEdit: false})}>
            Add Site Report
          </Button>
          <Button
            labelStyle={[
              FontsStyle.fontBold,
              {fontSize: fonts.size.regular, marginTop: 20},
            ]}
            mode="text"
            onPress={() => goBack()}>
            Go back
          </Button>
        </View>
      )}
      <ConfirmationDialog
        isVisible={deleteDialog}
        title={'Delete Site Report'}
        description={'This will permanently delete the site report'}
        onClose={() => setDeleteDialog(false)}
        onConfirm={deleteReport}
        cancelButtonChildren={'Cancel'}
        confirmButtionChildren={'Confirm'}
      />
      <Portal>
        <Snackbar
          visible={siteToast}
          duration={4000}
          onDismiss={() => setSiteToast(false)}>
          {siteToastMessage}
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
            backgroundColor: darkColor?.colors?.secondary,
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
                <SiteReportView
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
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
});
export default ViewSiteReport;
