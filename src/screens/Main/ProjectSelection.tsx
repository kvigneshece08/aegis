import React, {useState, useRef} from 'react';
import {StyleSheet, View, TextInput, ScrollView} from 'react-native';
import {useAppDispatch, useAppSelector} from '../../hooks/reduxHooks';
import {useApiGetUserAssignedProjects} from '../../hooks/userAssignedProjects';
import {setAssignedProjects} from '../../redux/assignedProjects';
import {SpaceSeparator} from '../../components/SpaceSeparator/SpaceSeparator';
import {
  Card,
  Avatar,
  Text,
  ActivityIndicator,
  Portal,
  Modal,
  List,
} from 'react-native-paper';
import {ItemSpaceTen, fonts, theme} from '../../themes';
import {Button} from '../../components/Button';
import {FontsStyle, ItemSpaceTwenty} from '../../themes';
import {useNavigation} from '@react-navigation/native';
import {ScreensNavigationProps} from '../../@types/navigation';
import {DropDown} from '../../components/DropDown';
import {darkColor} from '../../themes';
import {projectSelectionSchema} from '../../schemas/schema';
import {
  FormDataProjectSelectValue,
  FormDataProjectSelect,
} from '../../entities/Form/projectSelectionForm';
import {useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import {useApiGetBaselineProjects} from '../../hooks/useApiBaselineProjects';
import {readableTimestamp} from '../../utils/functions';
import moment from 'moment';

const ProjectSelection = () => {
  const {
    control,
    handleSubmit,
    formState: {errors},
    resetField,
  } = useForm<FormDataProjectSelect>({
    resolver: yupResolver(projectSelectionSchema),
    defaultValues: FormDataProjectSelectValue,
  });
  const authDetails = useAppSelector(state => state?.authDetails);
  const assignedProjList = useAppSelector(state => state?.assignedProjects);
  const navigation = useNavigation<ScreensNavigationProps>();
  const [showBuilderDropDown, setShowBuilderDropDown] = useState(false);
  const [showProjectDropDown, setShowProjectDropDown] = useState(false);
  const [showTasksDropDown, setShowTasksDropDown] = useState(false);
  const [builderValue, setBuilderValue] = useState({
    builderID: 0,
    builderLabel: '',
    builderAdditional: {},
  });
  const [projectValue, setProjectValue] = useState({
    projectID: 0,
    projectLabel: '',
    projectItems: {},
    projectAdditional: {},
  });
  const [taskValue, setTaskValue] = useState({
    taskID: 0,
    taskLabel: '',
  });
  const [baselineSkip, setBaselineSkip] = useState(true);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [activeBaseline, setActiveBaseline] = React.useState({});

  const {
    isCollectiveDataLoading,
    collectiveData,
    isCollectiveDataError,
    isCollectiveDataSuccess,
  } = useApiGetUserAssignedProjects(authDetails?.user?.id ?? 0);

  const {
    isCollectiveBaselineDataLoading,
    collectiveBaselineData,
    isCollectiveBaselineDataError,
    collectiveBaselineDataRefetch,
  } = useApiGetBaselineProjects(
    projectValue.projectID,
    taskValue.taskID,
    baselineSkip,
  );

  const dispatch = useAppDispatch();
  React.useEffect(() => {
    dispatch(
      setAssignedProjects({
        ...assignedProjList,
        availableProject: collectiveData,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectiveData]);

  React.useEffect(() => {
    const baseList = collectiveBaselineData?.filter?.(
      baseline =>
        baseline?.state === 'active' &&
        moment(baseline?.plannedEndDate).isAfter(moment()),
    );
    if (baseList && baseList?.length === 1) {
      setActiveBaseline(baseList[0]);
      dispatch(
        setAssignedProjects({
          ...assignedProjList,
          currentProject: {
            builderDetails: builderValue,
            projectDetails: projectValue,
            taskDetails: taskValue,
            baselineDetails: baseList?.[0] ?? {},
          },
        }),
      );
    } else {
      setActiveBaseline({});
      dispatch(
        setAssignedProjects({
          ...assignedProjList,
          currentProject: {
            builderDetails: {},
            projectDetails: {},
            taskDetails: {},
            baselineDetails: {},
          },
        }),
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectiveBaselineData]);

  const projectInputRef = useRef<TextInput | null>(null);
  const taskInputRef = useRef<TextInput | null>(null);
  const builderInfo: any =
    assignedProjList?.availableProject?.length > 0
      ? assignedProjList?.availableProject?.filter?.(
          (project: {builderID: number}) =>
            project.builderID === builderValue.builderID,
        )
      : [];

  const projectInfo =
    builderInfo?.length > 0
      ? builderInfo?.[0]?.projectAssigned?.filter?.(
          (tasks: {projectID: number}) =>
            tasks.projectID === projectValue.projectID,
        )
      : [];

  const projectVisibility =
    builderValue.builderID > 0 && builderInfo?.[0]?.projectAssigned?.length > 0;

  const taskVisibility =
    projectValue.projectID > 0 && projectInfo?.[0]?.tasksAssigned?.length > 0;

  const calculateRemainingDays = ({plannedEndDate, workingDays}) => {
    const end = moment(plannedEndDate);
    const start = moment();
    const workingDaysValue = workingDays?.project_timing?.working_days;
    // Ensure the end date is valid
    if (!end.isValid()) {
      return 'N/A';
    }

    // Calculate remaining working days
    let remainingDays = 0;
    while (start.isBefore(end)) {
      if (workingDaysValue?.includes(start.format('dddd'))) {
        remainingDays++;
      }
      start.add(1, 'days');
    }

    return remainingDays > 0 ? remainingDays : 'Expired';
  };

  const handleProceed = async () => {
    !baselineSkip && collectiveBaselineDataRefetch();
    setBaselineSkip(false);
    setModalVisible(true);
  };
  const addressIcon = (props: any) => (
    <Avatar.Icon {...props} icon="map-marker" size={35} />
  );
  return (
    <View style={styles.container}>
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
              onPress={() => navigation.navigate('ProjectHome')}>
              Back to Home
            </Button>
          </Card.Content>
        </Card>
      ) : isCollectiveDataLoading ? (
        <ActivityIndicator animating={true} />
      ) : isCollectiveDataSuccess && collectiveData?.length > 0 ? (
        <Card style={{paddingVertical: 10}}>
          <Card.Title
            title="Choose a Project"
            subtitle="Below displays a project which is assigned to you"
            titleVariant="titleLarge"
          />
          <Card.Content>
            <DropDown
              label={'Builder Name'}
              mode={'flat'}
              visible={showBuilderDropDown}
              showDropDown={() => setShowBuilderDropDown(true)}
              onDismiss={() => setShowBuilderDropDown(false)}
              selectedValue={builderValue.builderLabel}
              controllerProps={{
                name: 'builderOpt',
                value: builderValue.builderLabel,
                control,
              }}
              setValue={(value, additionalVal) => {
                if (builderValue.builderID > 0) {
                  projectInputRef?.current?.setNativeProps({text: ''});
                  taskInputRef?.current?.setNativeProps({text: ''});
                  setProjectValue({...projectValue, projectID: 0});
                  setTaskValue({...taskValue, taskID: 0});
                  resetField('projectOpt');
                  resetField('taskOpt');
                }
                setBuilderValue({
                  ...builderValue,
                  builderID: additionalVal.builderID,
                  builderLabel: value,
                  builderAdditional: additionalVal,
                });
              }}
              list={collectiveData?.map((value: any) => {
                return {
                  label: value.builderName,
                  value: value.builderName,
                  additionalVal: {
                    builderAddress: value?.builderAddress,
                    builderCity: value?.builderCity,
                    builderContactNumber: value?.builderContactNumber,
                    builderCountry: value?.builderCountry,
                    builderEmailAddress: value?.builderEmailAddress,
                    builderExternalLink: value?.builderExternalLink,
                    builderID: value?.builderID,
                    builderLogo: value?.builderLogo,
                    builderPincode: value?.builderPincode,
                    builderState: value?.builderState,
                  },
                };
              })}
              dropDownItemTextStyle={{color: theme.colors.onSurface}}
              errorMessage={errors.builderOpt?.message}
            />
            <SpaceSeparator size={15} />
            <DropDown
              inputRef={projectInputRef}
              label={'Project Name'}
              mode={'flat'}
              visible={projectVisibility && showProjectDropDown}
              showDropDown={() =>
                projectVisibility && setShowProjectDropDown(true)
              }
              onDismiss={() => setShowProjectDropDown(false)}
              selectedValue={projectValue.projectLabel}
              controllerProps={{
                name: 'projectOpt',
                value: projectValue.projectLabel,
                control,
              }}
              setValue={(value: any, additionalVal: any) => {
                setProjectValue({
                  ...projectValue,
                  projectLabel: value,
                  projectID: additionalVal.projectID,
                  projectItems: additionalVal.projectDetails,
                  projectAdditional: additionalVal,
                });
                taskInputRef?.current?.setNativeProps({text: ''});
                setTaskValue({taskID: 0, taskLabel: ''});
                resetField('taskOpt');
              }}
              list={
                builderInfo?.[0]?.projectAssigned?.map((value: any) => {
                  return {
                    label: value.projectName,
                    value: value.projectName,
                    additionalVal: {
                      projectID: value.projectID,
                      projectDetails: value.projectDetails,
                      projectAddress: value?.projectAddress,
                      projectCity: value?.projectCity,
                      projectContactNumber: value?.projectContactNumber,
                      projectCountry: value?.projectCountry,
                      projectEmailAddress: value?.projectEmailAddress,
                      projectPincode: value?.projectPincode,
                      projectState: value?.projectState,
                    },
                  };
                }) ?? []
              }
              disabled={!projectVisibility}
              dropDownItemTextStyle={{color: theme.colors.onSurface}}
              errorMessage={errors.projectOpt?.message}
            />
            <SpaceSeparator size={15} />
            <DropDown
              inputRef={taskInputRef}
              label={'Assigned Tasks'}
              mode={'flat'}
              visible={taskVisibility && showTasksDropDown}
              showDropDown={() => taskVisibility && setShowTasksDropDown(true)}
              onDismiss={() => setShowTasksDropDown(false)}
              selectedValue={taskValue.taskLabel}
              controllerProps={{
                name: 'taskOpt',
                value: taskValue.taskLabel,
                control,
              }}
              setValue={(value, additionalVal) => {
                setTaskValue({
                  ...taskValue,
                  taskLabel: value,
                  taskID: additionalVal,
                });
              }}
              list={
                taskVisibility
                  ? projectInfo?.[0]?.tasksAssigned?.map((value: any) => {
                      return {
                        label: value.projectTaskName,
                        value: value.projectTaskName,
                        additionalVal: value.projectTaskID,
                      };
                    })
                  : []
              }
              disabled={!taskVisibility}
              dropDownItemTextStyle={{color: theme.colors.onSurface}}
              errorMessage={errors.taskOpt?.message}
            />
            <Button
              disabled={projectValue.projectID <= 0 || taskValue.taskID <= 0}
              mode="outlined"
              uppercase
              labelStyle={FontsStyle.fontBold}
              style={ItemSpaceTwenty.marginVerticalVal}
              onPress={handleSubmit(handleProceed)}>
              Proceed
            </Button>
            {taskValue.taskID > 0 && (
              <Card mode="outlined">
                <Card.Title
                  titleNumberOfLines={6}
                  title={`Location: ${projectInfo?.[0]?.projectAddress} ${projectInfo?.[0]?.projectCity}, ${projectInfo?.[0]?.projectState}, ${projectInfo?.[0]?.projectCountry}, ${projectInfo?.[0]?.projectPincode}`}
                  titleStyle={[
                    ItemSpaceTen.spaceTenMarginBottom,
                    ItemSpaceTen.spaceTenTopMargin,
                  ]}
                  titleVariant="titleSmall"
                  left={addressIcon}
                />
              </Card>
            )}
          </Card.Content>
        </Card>
      ) : (
        <View style={{alignItems: 'center'}}>
          <Text variant="titleMedium" style={FontsStyle.fontAlign}>
            No project has been assigned yet!!!
          </Text>
          <Button
            labelStyle={[
              FontsStyle.fontBold,
              {fontSize: fonts.size.regular, marginTop: 10},
            ]}
            mode="text"
            compact
            onPress={() => navigation.navigate('ProjectHome')}>
            Back to Home
          </Button>
        </View>
      )}
      <Portal>
        <Modal
          dismissableBackButton={true}
          visible={modalVisible}
          dismissable={false}
          contentContainerStyle={{
            marginHorizontal: 20,
          }}>
          <ScrollView>
            <Card
              contentStyle={{
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: darkColor.colors.secondaryContainer,
              }}>
              <Card.Title title="Baseline Information" />
              <Card.Content>
                {isCollectiveBaselineDataLoading ? (
                  <ActivityIndicator />
                ) : isCollectiveDataSuccess &&
                  Object?.keys(activeBaseline)?.length !== 0 ? (
                  <List.Section>
                    <List.Accordion
                      title={`Baseline #${collectiveBaselineData?.length ?? 1}`}
                      description={`Active (Remaining Days: ${calculateRemainingDays(
                        {
                          plannedEndDate: activeBaseline?.plannedEndDate,
                          workingDays: JSON.parse(
                            activeBaseline?.projectDetails,
                          ),
                        },
                      )})`}>
                      <List.Item
                        title="Planned Start Date"
                        description={readableTimestamp(
                          activeBaseline?.plannedStartDate,
                        )}
                      />
                      <List.Item
                        title="Planned End Date"
                        description={readableTimestamp(
                          activeBaseline?.plannedEndDate,
                        )}
                      />
                      <List.Item
                        title="Actual Start Date"
                        description={readableTimestamp(
                          activeBaseline?.actualStartDate,
                        )}
                      />
                      <List.Item
                        title="Actual End Date"
                        description={readableTimestamp(
                          activeBaseline?.actualEndDate,
                        )}
                      />
                    </List.Accordion>
                  </List.Section>
                ) : (
                  <>
                    {isCollectiveBaselineDataError ? (
                      <Text
                        variant="bodyLarge"
                        style={{
                          color: darkColor.colors.error,
                          textAlign: 'center',
                          paddingBottom: 10,
                        }}>
                        Encoutered an error while getting the project details.
                        Try again later.
                      </Text>
                    ) : (
                      <Text
                        variant="bodyLarge"
                        style={{
                          color: darkColor.colors.error,
                          textAlign: 'center',
                          paddingBottom: 10,
                        }}>
                        No active baseline is available for the selected
                        project.
                      </Text>
                    )}
                  </>
                )}
              </Card.Content>
              <Card.Actions style={{paddingHorizontal: 15}}>
                <Button
                  labelStyle={{color: darkColor.colors.onSecondaryContainer}}
                  style={{borderColor: darkColor.colors.onSecondaryContainer}}
                  onPress={() => setModalVisible(false)}>
                  Close
                </Button>
                {Object?.keys(activeBaseline)?.length !== 0 && (
                  <Button
                    style={{
                      backgroundColor: darkColor.colors.onSecondaryContainer,
                    }}
                    onPress={() => {
                      setModalVisible(false);
                      navigation.push('ProjectDetails');
                    }}>
                    Proceed
                  </Button>
                )}
              </Card.Actions>
            </Card>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
  },
});

export default ProjectSelection;
