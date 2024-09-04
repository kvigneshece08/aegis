import {CameraPermission} from './cameraPermission';
// import {MicrophonePermission} from './microphonePermission';
import {PermissionModule, PermissionType} from './types';
import {LocationPermission} from './locationPermission';
import {NotificationPermission} from './notificationPermission';

export class PermissionFactory {
  static create(type: PermissionType): PermissionModule {
    switch (type) {
      case 'camera':
        return new CameraPermission();
      case 'location':
        return new LocationPermission();
      // case 'photoLibrary':
      //   return new PhotoLibraryPermission();
      case 'notification':
        return new NotificationPermission();
      default:
        throw new Error(`Permission ${type} is not supported`);
    }
  }
}
