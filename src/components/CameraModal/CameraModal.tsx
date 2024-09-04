import React, {useEffect, useState, useCallback} from 'react';
import {StyleSheet, Platform} from 'react-native';
import {TouchableRipple} from 'react-native-paper';
import {FadeInRight, FadeOutRight} from 'react-native-reanimated';
import {
  useSafeAreaFrame,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import {
  Camera as VisionCamera,
  PhotoFile,
  Orientation,
} from 'react-native-vision-camera';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  PermissionType,
  useMandatoryPermission,
} from '../../hooks/usePermission';
import {Modal} from '../Modal/Modal';
import {CaptureButton} from './CaptureButton';
import {PermissionDialog} from './PermissionDialog';
import {SwitchDeviceButton} from './SwitchDeviceButton';
import {SwitchFlashModeButton} from './SwitchFlashModeButton';
import {FlashMode, useCamera} from './useCamera';
import {useIsForeground} from '../../hooks/useIsForground';
import {Flex} from '../ui';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faClose} from '@fortawesome/free-solid-svg-icons';

const RATIO_16_9 = 16 / 9;
// const RATIO_4_3 = 4 / 3;

export function CameraModal({
  visible,
  onClose,
  onCapture,
  onError,
}: {
  visible: boolean;
  onClose: () => void;
  onCapture: (photo: PhotoFile, orientation: Orientation) => void;
  onError: () => void;
}) {
  return (
    <Modal
      visible={visible}
      onDismiss={onClose}
      fullScreen
      enteringAnimation={FadeInRight.duration(300)}
      exitingAnimation={FadeOutRight.duration(300)}>
      <Camera onClose={onClose} onCapture={onCapture} onError={onError} />
    </Modal>
  );
}

export function Camera({
  onClose,
  onCapture,
  onError,
}: {
  onClose: () => void;
  onCapture: (photo: PhotoFile, orientation: Orientation) => void;
  onError: () => void;
}) {
  const [flashMode, setFlashMode] = useState<FlashMode>('auto');
  const [isCameraInitialized, setIsCameraInitialized] = useState(false);
  const [cameraHeightView, setCameraHeightView] = useState(0);
  const {
    status: cameraPermissionStatus,
    request: requestCameraPermission,
    dialogVisible: cameraPermissionDialogVisible,
  } = useMandatoryPermission(PermissionType.CAMERA);

  const isForeground = useIsForeground();
  //Setting Ratio 4:3 for time-being, for smaller devices preview image is overflowing
  const {
    ref,
    device,
    toggleDevice,
    takePhoto,
    isCapturing,
    photoFormat,
    orientation,
  } = useCamera('4:3', isCameraInitialized);
  const {height, width} = useSafeAreaFrame();
  const {top, bottom} = useSafeAreaInsets();
  const maxHeight = height - bottom;
  const cameraHeight = Math.min(width * RATIO_16_9, maxHeight);
  const isFullScreen = cameraHeight + top > maxHeight;

  useEffect(() => {
    if (isCameraInitialized) {
      setCameraHeightView(cameraHeight);
    }
  }, [cameraHeight, isCameraInitialized]);

  const handleCapturePress = async () => {
    if (!cameraPermissionStatus?.granted) {
      return;
    }
    const photo = await takePhoto(flashMode);
    if (photo) {
      onCapture(photo, orientation);
    } else {
      onError();
      onClose();
    }
  };

  const onInitialized = useCallback(() => {
    setIsCameraInitialized(true);
  }, []);

  const disableAction =
    !cameraPermissionStatus?.granted || isCapturing || !isCameraInitialized;

  if (!device && !isForeground) {
    return null;
  }
  return (
    <>
      <PermissionDialog
        visible={cameraPermissionDialogVisible}
        title={'Camera Permission'}
        content={'App needs access to your camera to take photos.'}
        grantButtonText={
          cameraPermissionStatus?.canAskAgain ? 'Grant Permission' : 'Settings'
        }
        onDismiss={onClose}
        onGrant={requestCameraPermission}
      />
      {cameraPermissionStatus?.granted && !cameraPermissionDialogVisible && (
        <Flex flex={1} bgColor="#000">
          <Flex
            width={width}
            height={cameraHeightView}
            borderRadius={16}
            mt={isFullScreen ? 0 : top}
            pt={isFullScreen ? top : 0}
            justify="space-between"
            // eslint-disable-next-line react-native/no-inline-styles
            style={{position: 'relative', overflow: 'hidden'}}>
            {/* <FocusCircle x={focusPoint?.x} y={focusPoint?.y} /> */}
            <VisionCamera
              ref={ref}
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={true}
              exposure={0}
              format={photoFormat}
              orientation={orientation}
              onInitialized={onInitialized}
              enableHighQualityPhotos
              photo={true}
              enableZoomGesture
            />
            <Flex direction="row" justify="space-between" px="xs" py="sm">
              {cameraPermissionStatus?.granted && (
                <CloseButton onPress={onClose} />
              )}
            </Flex>
            <Flex gap="xl" pb={30}>
              <Flex direction="row" align="center" justify="space-between">
                <Flex direction="row" flex={1} justify="center">
                  <SwitchFlashModeButton
                    value={flashMode}
                    onChange={setFlashMode}
                    disabled={disableAction}
                  />
                </Flex>
                <CaptureButton
                  onPress={handleCapturePress}
                  disabled={disableAction}
                  mode="photo"
                />
                <Flex direction="row" flex={1} justify="center">
                  <SwitchDeviceButton
                    onPress={toggleDevice}
                    disabled={disableAction}
                  />
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      )}
    </>
  );
}

function CloseButton({
  disabled,
  onPress,
}: {
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableRipple
      onPress={() => {
        onPress();
      }}
      borderless
      disabled={disabled}
      // eslint-disable-next-line react-native/no-inline-styles
      style={{
        borderRadius: 40,
        padding: 8,
        opacity: disabled ? 0.5 : 1,
      }}>
      {Platform.OS === 'ios' ? (
        <FontAwesomeIcon icon={faClose} size={26} />
      ) : (
        <MaterialCommunityIcons name="close" size={26} />
      )}
    </TouchableRipple>
  );
}
