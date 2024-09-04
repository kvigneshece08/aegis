import {requestPermission} from '../modules';
import {PermissionsAndroid, Platform} from 'react-native';
import {PermissionModule, PermissionType} from './types';
import notifee, {AuthorizationStatus} from '@notifee/react-native';
const CHANNEL_ID = 'aegis.channel';
export class NotificationPermission implements PermissionModule {
  type = PermissionType.NOTIFICATION;
  async getStatus() {
    const notificationSettings = await notifee.getNotificationSettings();
    const status = notificationSettings.authorizationStatus;
    const canAskAgain =
      status !== AuthorizationStatus.DENIED &&
      status !== AuthorizationStatus.AUTHORIZED;
    if (Platform.OS === 'android') {
      const channel = await notifee.getChannel(CHANNEL_ID);
      const isChannelBlocked = channel?.blocked === true;
      return {
        granted: status === AuthorizationStatus.AUTHORIZED && !isChannelBlocked,
        canAskAgain,
      };
    }

    return {granted: status === AuthorizationStatus.AUTHORIZED, canAskAgain};
  }

  async request() {
    if (Platform.OS === 'android') {
      return await requestPermission(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
    }

    const settings = await notifee.requestPermission();
    return {
      granted: settings.authorizationStatus === AuthorizationStatus.AUTHORIZED,
      canAskAgain: false,
    };
  }
}
