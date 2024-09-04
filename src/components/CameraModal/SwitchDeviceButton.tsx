import { faCameraRotate } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import React from 'react';
import { Platform } from 'react-native';
import {TouchableRipple} from 'react-native-paper';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export function SwitchDeviceButton({
  onPress,
  disabled,
}: {
  onPress: () => void;
  disabled?: boolean;
}) {
  const rotation = useSharedValue(0);
  const timingRotation = useDerivedValue(() =>
    withTiming(rotation.value, {duration: 200}),
  );
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{rotate: `${timingRotation.value}deg`}],
  }));

  return (
    // eslint-disable-next-line react/react-in-jsx-scope
    <TouchableRipple
      onPress={() => {
        onPress();
        rotation.value = rotation.value + 180;
      }}
      borderless
      disabled={disabled}
      // eslint-disable-next-line react-native/no-inline-styles
      style={{
        borderRadius: 40,
        borderColor: '#ffffff1A',
        padding: 8,
        borderWidth: 1,
        backgroundColor: '#00000033',
        opacity: disabled ? 0.5 : 1,
      }}>
      <Animated.View style={animatedStyle} entering={FadeInDown.duration(200)}>
        { Platform.OS === 'ios' ? <FontAwesomeIcon icon={faCameraRotate} size={26}/> :
          <MaterialIcons name="flip-camera-android" size={26} /> }
      </Animated.View>
    </TouchableRipple>
  );
}
