import {useState} from 'react';
import {Linking} from 'react-native';
import {PermissionType} from './permissions/types';
import {usePermission} from './usePermission';

export function useMandatoryPermission(
  type: PermissionType,
  options?: {when: boolean},
) {
  const {when = true} = options || {};

  const {status, request, isRequesting} = usePermission(type);

  const [isFirstAsk, setIsFirstAsk] = useState(true);

  const [dialogVisible, setDialogVisible] = useState(false);

  if (
    when &&
    status &&
    !status.granted &&
    (!status.canAskAgain || !isFirstAsk) &&
    !isRequesting &&
    !dialogVisible
  ) {
    setDialogVisible(true);
  } else if (status?.granted && dialogVisible) {
    setDialogVisible(false);
  }

  if (when && !status?.granted && isFirstAsk && !isRequesting) {
    setIsFirstAsk(false);
    request();
  }

  const requestPermission = async () => {
    if (status?.canAskAgain) {
      setIsFirstAsk(false);
      return request();
    }
    return Linking.openSettings();
  };
  return {status, request: requestPermission, dialogVisible};
}
