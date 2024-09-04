import {Permission, PermissionsAndroid} from 'react-native';
export interface PermissionResult {
  granted: boolean;
  canAskAgain: boolean;
}

export async function checkPermission(
  permission: Permission,
): Promise<PermissionResult> {
  try {
    const granted = await PermissionsAndroid.check(permission);
    const canAskAgain = false;
    return {
      granted,
      canAskAgain,
    };
  } catch (error) {
    console.error('Error checking permission:', error);
    return {
      granted: false,
      canAskAgain: false,
    };
  }
}

export async function requestPermission(
  permission: string,
): Promise<PermissionResult> {
  try {
    const granted = await PermissionsAndroid.request(permission);
    const canAskAgain = granted === PermissionsAndroid.RESULTS.DENIED;
    return {
      granted: granted === PermissionsAndroid.RESULTS.GRANTED,
      canAskAgain,
    };
  } catch (error) {
    console.error('Error requesting permission:', error);
    return {
      granted: false,
      canAskAgain: false,
    };
  }
}
