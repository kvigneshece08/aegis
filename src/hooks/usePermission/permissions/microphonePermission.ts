import {checkPermission, requestPermission} from '../modules';
import {PermissionsAndroid, Platform} from 'react-native';
import {Camera} from 'react-native-vision-camera';

import {PermissionModule, PermissionType} from './types';

export class MicrophonePermission implements PermissionModule {
  type = PermissionType.MICROPHONE;

  async getStatus() {
    if (Platform.OS === 'android') {
      return checkPermission(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
    }

    const status = await Camera.getMicrophonePermissionStatus();
    return {granted: status === 'granted', canAskAgain: status !== 'denied'};
  }

  async request() {
    if (Platform.OS === 'android') {
      return requestPermission(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
    }

    const status = await Camera.requestMicrophonePermission();
    return {granted: status === 'granted', canAskAgain: status !== 'denied'};
  }
}
