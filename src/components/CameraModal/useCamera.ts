import {useEffect, useMemo, useRef, useState} from 'react';
import {Platform} from 'react-native';
import {
  gravity,
  SensorTypes,
  setUpdateIntervalForType,
} from 'react-native-sensors';
import {
  Camera,
  CameraCaptureError,
  CameraDeviceFormat,
  useCameraDevices,
  useCameraDevice,
  VideoFile,
} from 'react-native-vision-camera';
import {isSensorAvailable} from '../../utils/sensorAvailability';
import {Subscription} from 'rxjs';

export type FlashMode = 'on' | 'off' | 'auto';

setUpdateIntervalForType(SensorTypes.gravity, 1000);

//Setting Ratio 4:3 for time-being, for smaller devices preview image is overflowing
export function useCamera(
  ratio: '16:9' | '4:3' = '4:3',
  hasPermission = false,
) {
  const devices = useCameraDevices();
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>(
    'back',
  );
  let device = useCameraDevice(cameraPosition);
  const [orientation, setOrientation] = useState<
    'portrait' | 'portrait-upside-down' | 'landscape-left' | 'landscape-right'
  >('portrait');
  const [isRecording, setIsRecording] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    let subscription: Subscription;
    const gravitySensorCall = async () => {
      try {
        isSensorAvailable('gravity').then(() => {
          subscription = gravity.subscribe(({x, y}) => {
            // const radian = Math.atan2(y, x);
            // const degree = (radian * 180) / Math.PI;
            // if (degree > 135) {
            //   setOrientation(
            //     Platform.OS === 'android'
            //       ? 'landscape-left'
            //       : 'landscape-right',
            //   );
            // } else if (degree > 45) {
            //   setOrientation(
            //     Platform.OS === 'android' ? 'portrait' : 'portrait-upside-down',
            //   );
            // } else if (degree > -45) {
            //   setOrientation(
            //     Platform.OS === 'android'
            //       ? 'landscape-right'
            //       : 'landscape-left',
            //   );
            // } else if (degree > -135) {
            //   setOrientation(
            //     Platform.OS === 'android' ? 'portrait-upside-down' : 'portrait',
            //   );
            // } else {
            //   setOrientation(
            //     Platform.OS === 'android'
            //       ? 'landscape-left'
            //       : 'landscape-right',
            //   );
            // }

            const radian = Math.atan2(y, x);
            const degree = (radian * 180) / Math.PI;

            if (degree > 135 || degree < -135) {
              setOrientation(
                Platform.OS === 'android'
                  ? 'landscape-left'
                  : 'landscape-right',
              );
            } else if (degree > 45 && degree <= 135) {
              setOrientation(
                Platform.OS === 'android' ? 'portrait' : 'portrait-upside-down',
              );
            } else if (degree > -45 && degree <= 45) {
              setOrientation(
                Platform.OS === 'android'
                  ? 'landscape-right'
                  : 'landscape-left',
              );
            } else {
              setOrientation(
                Platform.OS === 'android' ? 'portrait-upside-down' : 'portrait',
              );
            }
          });
          return () => subscription.unsubscribe();
        });
      } catch (error) {
        console.error('Error in gravity sensor subscription:', error);
      }
    };
    if (hasPermission) {
      gravitySensorCall();
    }
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [hasPermission]);
  const ref = useRef<Camera>(null);

  const availableRatios = useMemo(
    () =>
      device?.formats.reduce<Record<string, CameraDeviceFormat[]>>(
        (acc, format) => {
          const photoRatio = reduceRatio(format.photoWidth, format.photoHeight);
          const videoRatio = reduceRatio(format.videoWidth, format.videoHeight);

          return {
            ...acc,
            [`photo-${photoRatio}`]: [
              ...(acc[`photo-${photoRatio}`] || []),
              format,
            ].sort(sortPhotoFormatsByResolution),
            [`video-${videoRatio}`]: [
              ...(acc[`video-${videoRatio}`] || []),
              format,
            ].sort(sortVideoFormatsByResolution),
          };
        },
        {},
      ),
    [device?.formats],
  );

  const photoFormat = useMemo(() => {
    const format = availableRatios?.[`photo-${ratio}`]?.[0];
    if (format && Platform.OS === 'android') {
      return {
        ...format,
        photoHeight: format.photoWidth,
        photoWidth: format.photoHeight,
      };
    }
    return format;
  }, [availableRatios, ratio]);

  const videoFormat = useMemo(() => {
    const format = availableRatios?.[`video-${ratio}`]?.[0];
    if (format && Platform.OS === 'android') {
      return {
        ...format,
        videoHeight: format.videoWidth,
        videoWidth: format.videoHeight,
      };
    }
    return format;
  }, [availableRatios, ratio]);

  const toggleDevice = () => {
    setCameraPosition(prev => (prev === 'back' ? 'front' : 'back'));
  };

  const takePhoto = async (flash: FlashMode) => {
    setIsCapturing(true);
    const photo = await ref.current?.takePhoto({
      qualityPrioritization: 'balanced',
      flash,
      enableAutoRedEyeReduction: true,
    });
    setIsCapturing(false);
    return photo;
  };

  const startRecording = async (
    flash: Exclude<FlashMode, 'auto'>,
    onError?: (error: CameraCaptureError) => void,
    onFinish?: (file: VideoFile) => void,
  ) => {
    setIsRecording(true);
    setIsCapturing(true);
    return new Promise<VideoFile>((resolve, reject) => {
      ref.current?.startRecording({
        flash,
        onRecordingError: err => {
          setIsRecording(false);
          setIsCapturing(false);
          onError?.(err);
          // onError(err);
          reject(err);
        },
        onRecordingFinished: file => {
          setIsRecording(false);
          setIsCapturing(false);
          onFinish?.(file);
          // onFinish(file);
          resolve(file);
        },
      });
    });
    // ref.current?.startRecording({ flash, onRecordingError: onError, onRecordingFinished: onFinish });
  };

  const stopRecording = () => {
    setIsRecording(false);
    ref.current?.stopRecording();
  };

  return {
    device,
    toggleDevice,
    ref,
    takePhoto,
    startRecording,
    stopRecording,
    isRecording,
    isCapturing,
    photoFormat,
    videoFormat,
    orientation,
  };
}

const reduceRatio = (numerator: number, denominator: number): string => {
  let temp: number | undefined;
  let left: number;
  let right: number;

  const gcd = function (a: number, b: number): number {
    if (b === 0) {
      return a;
    }
    return gcd(b, a % b);
  };

  if (numerator === denominator) {
    return '1:1';
  }

  if (+numerator < +denominator) {
    temp = numerator;
    numerator = denominator;
    denominator = temp;
  }

  const divisor = gcd(+numerator, +denominator);

  if (typeof temp === 'undefined') {
    left = numerator / divisor;
    right = denominator / divisor;
  } else {
    left = denominator / divisor;
    right = numerator / divisor;
  }

  if (left === 8 && right === 5) {
    left = 16;
    right = 10;
  }

  return `${left}:${right}`;
};

function sortPhotoFormatsByResolution(
  left: CameraDeviceFormat,
  right: CameraDeviceFormat,
) {
  return (
    right.photoHeight * right.photoWidth - left.photoHeight * left.photoWidth
  );
}

function sortVideoFormatsByResolution(
  left: CameraDeviceFormat,
  right: CameraDeviceFormat,
) {
  return (
    right.videoHeight * right.videoWidth - left.videoHeight * left.videoWidth
  );
}
