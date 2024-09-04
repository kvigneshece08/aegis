import {checkPermission, requestPermission} from '../modules';
import {PermissionsAndroid, Platform} from 'react-native';
import {request, PERMISSIONS, check} from 'react-native-permissions';
import {PermissionModule, PermissionType} from './types';

export class LocationPermission implements PermissionModule {
  type = PermissionType.LOCATION;

  async getStatus() {
    if (Platform.OS === 'android') {
      return await checkPermission(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
    }

    const status = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
    return {granted: status === 'granted', canAskAgain: status !== 'denied'};
  }

  async request() {
    if (Platform.OS === 'android') {
      return await requestPermission(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
    }

    const status = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
    return {granted: status === 'granted', canAskAgain: status !== 'denied'};
  }
}
