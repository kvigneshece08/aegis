import notifee, {TriggerType, RepeatFrequency} from '@notifee/react-native';
import moment from 'moment';

export const DELAY_ON_CREATE_CHANNEL_ID = 'aegis.delayoncreate.channel';
export const DELAY_TRIGGER_CHANNEL_ID = 'aegis.delayontrigger.channel';

const cancelNotification = async (id: string) => {
  try {
    await notifee.cancelNotification(id);
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
};

const scheduleOnDelayReminder = async ({
  id,
  startHour,
  title,
  body,
}: {
  id: string;
  startHour: number;
  title: string;
  body: string;
}) => {
  try {
    const channelId = await notifee.createChannel({
      id: DELAY_TRIGGER_CHANNEL_ID,
      name: 'In-Progress Delay Report',
      sound: 'default',
    });

    const startDateTime = moment(startHour, 'HH:mm').add(1, 'days');

    await notifee.createTriggerNotification(
      {
        id,
        title,
        body,
        android: {
          channelId,
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          sound: 'default',
          interruptionLevel: 'timeSensitive',
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: startDateTime.valueOf(),
        repeatFrequency: RepeatFrequency.DAILY,
      },
    );
  } catch (error) {
    console.error('Error scheduling delay site reminder:', error);
  }
};

const onDelayDisplayNotification = async ({title, body}) => {
  // Create a channel (required for Android)
  const channelId = await notifee.createChannel({
    id: DELAY_ON_CREATE_CHANNEL_ID,
    name: 'New Delay Report',
  });

  await notifee.requestPermission();

  // Display a notification
  await notifee.displayNotification({
    title,
    body,
    android: {
      channelId,
      pressAction: {
        id: 'default',
      },
    },
  });
};

const isNotificationScheduled = async (notificationId: string) => {
  try {
    const scheduledNotifications = await notifee.getTriggerNotifications();
    // Check if a notification with the given ID is present in the scheduled notifications
    const isScheduled = scheduledNotifications.some(
      notification => notification.notification.id === notificationId,
    );
    return isScheduled;
  } catch (error) {
    console.error('Error checking if notification is scheduled:', error);
    return false;
  }
};

const showDownloadCompleteNotification = async ({title, body}) => {
  const channelId = await notifee.createChannel({
    id: 'download.complete.channel',
    name: 'Download Complete',
  });

  await notifee.displayNotification({
    title: title,
    body: body,
    android: {
      channelId,
      pressAction: {
        id: 'default',
      },
    },
    ios: {
      sound: 'default',
      interruptionLevel: 'timeSensitive',
    },
  });
};

export const delayNotificationApi = {
  download: showDownloadCompleteNotification,
  scheduleDelay: scheduleOnDelayReminder,
  delayDisplayNotify: onDelayDisplayNotification,
  cancel: cancelNotification,
  notifyEnabled: isNotificationScheduled,
};
