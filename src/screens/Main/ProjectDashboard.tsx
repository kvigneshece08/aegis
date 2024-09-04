import React from 'react';
import {StyleSheet, View, ScrollView} from 'react-native';
import {useAppSelector} from '../../hooks/reduxHooks';
import {Card, Text, ActivityIndicator, List} from 'react-native-paper';
import {fonts} from '../../themes';
import {Button} from '../../components/Button';
import {FontsStyle} from '../../themes';
import {useNavigation} from '@react-navigation/native';
import {ScreensNavigationProps} from '../../@types/navigation';
import {darkColor} from '../../themes';
import {useApiGetProjectDashboard} from '../../hooks/userProjectDashboard';
import {
  convertTo12HourFormat,
  formatNumberZeroLeading,
  getProjectWorkingDays,
  isValidArrayKey,
} from '../../utils/functions';
import {
  readableTimestamp,
  calculateRemainingDays,
  capitalizeFirstLetter,
} from '../../utils/functions';

const statusColor = status =>
  status === 'upcoming'
    ? darkColor.colors.onSurfaceDisabled
    : status === 'current'
    ? darkColor.colors.onTertiary
    : darkColor.colors.inversePrimary;

const ListOfProject = ({items, status = 'upcoming'}) => {
  return (
    <View style={{flex: 1}}>
      <Text variant="bodyLarge">{capitalizeFirstLetter(status)} Tasks</Text>
      {items?.map?.((item, index) => (
        <List.Section key={index}>
          <List.Accordion
            style={{
              paddingVertical: 10,
              borderRadius: 10,
              backgroundColor: statusColor(status),
            }}
            title={`${item?.project_name}`}
            description={`Task: ${item?.task_name}\n${
              status === 'upcoming'
                ? `Begins in: ${calculateRemainingDays(
                    item?.planned_start_date,
                    item?.project_details,
                  )} Days`
                : status === 'current'
                ? `Remaining: ${calculateRemainingDays(
                    item?.planned_end_date,
                    item?.project_details,
                  )} Days`
                : `Overdue: ${calculateRemainingDays(
                    item?.planned_end_date,
                    item?.project_details,
                  )} Days`
            }`}>
            <List.Item
              title="Planned Start Date"
              description={readableTimestamp(item?.planned_start_date)}
            />
            <List.Item
              title="Planned End Date"
              description={readableTimestamp(item?.planned_end_date)}
            />
            <List.Item
              title="Actual Start Date"
              description={readableTimestamp(item?.actual_start_date)}
            />
            <List.Item
              title="Actual End Date"
              description={readableTimestamp(item?.actual_end_date)}
            />
            <List.Item
              title="Working Days"
              description={`${getProjectWorkingDays(item?.project_details)}`}
            />
            <List.Item
              title="Working Hours"
              description={convertTo12HourFormat(item?.project_details)}
            />
          </List.Accordion>
        </List.Section>
      ))}
    </View>
  );
};

const ProjectDashboard = () => {
  const authDetails = useAppSelector(state => state?.authDetails);
  const {
    isCollectiveDataLoading,
    collectiveData,
    isCollectiveDataError,
    isCollectiveDataSuccess,
  } = useApiGetProjectDashboard(authDetails?.user?.id ?? 0);
  const {navigate} = useNavigation<ScreensNavigationProps>();

  const today = new Date();

  // Filter project items
  const filteredOverdueItems =
    collectiveData && isValidArrayKey(collectiveData?.project_items)
      ? collectiveData?.project_items?.filter?.(item => {
          const plannedEndDate = new Date(item.planned_end_date);
          return plannedEndDate < today && item.state === 'active';
        })
      : [];

  const filteredUpcomingItems =
    collectiveData && isValidArrayKey(collectiveData?.project_items)
      ? collectiveData?.project_items?.filter?.(item => {
          const plannedStartDate = new Date(item.planned_start_date);
          return (
            plannedStartDate > today &&
            (item.state === 'active' || item.state === 'draft')
          );
        })
      : [];

  const filteredCurrentItems =
    collectiveData && isValidArrayKey(collectiveData?.project_items)
      ? collectiveData?.project_items?.filter?.(item => {
          const plannedEndDate = new Date(item.planned_end_date);
          return plannedEndDate > today && item.state === 'active';
        })
      : [];

  return (
    <View style={{flex: 1, justifyContent: 'center'}}>
      {isCollectiveDataError ? (
        <Card mode="contained">
          <Card.Content>
            <Text
              variant="bodyLarge"
              style={{color: darkColor.colors.error, textAlign: 'center'}}>
              Encoutered an error while getting the dashboard records. Try again
              later.
            </Text>
            <Button
              labelStyle={[
                FontsStyle.fontBold,
                {fontSize: fonts.size.regular, marginTop: 10},
              ]}
              mode="text"
              compact
              onPress={() => navigate('ProjectHome')}>
              Back to Home
            </Button>
          </Card.Content>
        </Card>
      ) : isCollectiveDataLoading ? (
        <ActivityIndicator animating={true} />
      ) : isCollectiveDataSuccess && Object.keys(collectiveData).length > 0 ? (
        <ScrollView>
          <View style={styles.rootContainer}>
            <View style={styles.container}>
              <View style={styles.leftColumn}>
                <Card style={styles.card}>
                  <Card.Content>
                    <Text style={styles.title}>Projects Assigned</Text>
                    <Text style={styles.description}>
                      {formatNumberZeroLeading(
                        collectiveData?.num_assigned_projects,
                      )}
                    </Text>
                  </Card.Content>
                </Card>
                <Card style={styles.card}>
                  <Card.Content>
                    <Text style={styles.title}>Site Reported</Text>
                    <Text style={styles.description}>
                      {formatNumberZeroLeading(
                        collectiveData?.num_site_reports,
                      )}
                    </Text>
                  </Card.Content>
                </Card>
              </View>
              <View style={styles.rightColumn}>
                <Card style={styles.card}>
                  <Card.Content>
                    <Text style={styles.title}>Task Assigned</Text>
                    <Text style={styles.description}>
                      {formatNumberZeroLeading(
                        collectiveData?.num_project_tasks,
                      )}
                    </Text>
                  </Card.Content>
                </Card>

                <Card style={styles.card}>
                  <Card.Content>
                    <Text style={styles.title}>Delay Reported</Text>
                    <Text style={styles.description}>
                      {formatNumberZeroLeading(collectiveData?.num_delays)}
                    </Text>
                  </Card.Content>
                </Card>
              </View>
            </View>
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.title}>Disruption Reported</Text>
                <Text style={styles.description}>
                  {formatNumberZeroLeading(collectiveData?.num_disruptions)}
                </Text>
              </Card.Content>
            </Card>
            {filteredOverdueItems && isValidArrayKey(filteredOverdueItems) && (
              <ListOfProject items={filteredOverdueItems} status="overdue" />
            )}

            {filteredCurrentItems && isValidArrayKey(filteredCurrentItems) && (
              <ListOfProject items={filteredCurrentItems} status="current" />
            )}
            {filteredUpcomingItems &&
              isValidArrayKey(filteredUpcomingItems) && (
                <ListOfProject items={filteredUpcomingItems} />
              )}
          </View>
        </ScrollView>
      ) : (
        <View style={{alignItems: 'center'}}>
          <Text variant="titleMedium" style={FontsStyle.fontAlign}>
            No records found!!!
          </Text>
          <Button
            labelStyle={[
              FontsStyle.fontBold,
              {fontSize: fonts.size.regular, marginTop: 10},
            ]}
            mode="text"
            compact
            onPress={() => navigate('ProjectHome')}>
            Back to Home
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leftColumn: {
    flex: 1,
    marginRight: 8,
  },
  rightColumn: {
    flex: 1,
    marginLeft: 8,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
    borderRadius: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 24,
    textAlign: 'center',
  },
});

export default ProjectDashboard;
