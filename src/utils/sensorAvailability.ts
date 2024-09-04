import {NativeModules} from 'react-native';
const {
  RNSensorsGyroscope: GyroNative,
  RNSensorsAccelerometer: AccNative,
  RNSensorsMagnetometer: MagnNative,
  RNSensorsBarometer: BarNative,
  RNSensorsOrientation: OrientNative,
  RNSensorsGravity: GravNative,
} = NativeModules;

if (
  !GyroNative &&
  !AccNative &&
  !MagnNative &&
  !BarNative &&
  !OrientNative &&
  !GravNative
) {
  throw new Error(
    'Native modules for sensors not available. Did react-native link run successfully?',
  );
}

const nativeApis = new Map([
  ['accelerometer', AccNative],
  ['gyroscope', GyroNative],
  ['magnetometer', MagnNative],
  ['barometer', BarNative],
  ['orientation', OrientNative],
  ['gravity', GravNative],
]);

export function isSensorAvailable(type: string) {
  const api = nativeApis.get(type);
  const promise = api.isAvailable();
  return promise;
}
