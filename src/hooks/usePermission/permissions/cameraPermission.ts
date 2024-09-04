import {PermissionsAndroid, Platform} from 'react-native';
import {Camera} from 'react-native-vision-camera';
import {checkPermission, requestPermission} from '../modules';
import {PermissionModule, PermissionType} from './types';

export class CameraPermission implements PermissionModule {
  type = PermissionType.CAMERA;

  async getStatus() {
    if (Platform.OS === 'android') {
      const permissionVal = await checkPermission(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );
      const status = await Camera.getCameraPermissionStatus();
      const canAskAgain = status !== 'denied' && status !== 'granted';
      return {...permissionVal, canAskAgain};
    }
    const status = await Camera.getCameraPermissionStatus();
    return {granted: status === 'granted', canAskAgain: status !== 'denied'};
  }

  async request() {
    if (Platform.OS === 'android') {
      return requestPermission(PermissionsAndroid.PERMISSIONS.CAMERA);
    }
    const status = await Camera.requestCameraPermission();
    return {granted: status === 'granted', canAskAgain: status !== 'denied'};
  }
}
