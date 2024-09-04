import {TouchableRipple} from 'react-native-paper';
import Animated, {FadeInDown, FadeOutUp} from 'react-native-reanimated';
import React from 'react';
import {FlashMode} from './useCamera';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export function SwitchFlashModeButton({
  value,
  disabled,
  onChange,
}: {
  value: FlashMode;
  disabled?: boolean;
  onChange: (value: FlashMode) => void;
}) {
  return (
    <TouchableRipple
      onPress={() => {
        switch (value) {
          case 'on':
            onChange('auto');
            break;
          case 'off':
            onChange('on');
            break;
          case 'auto':
            onChange('off');
            break;
        }
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
      <Animated.View
        key={value}
        entering={FadeInDown.duration(200)}
        exiting={FadeOutUp.duration(200)}>
        {value === 'on' ? (
          <MaterialCommunityIcons name="flash" size={26} />
        ) : value === 'off' ? (
          <MaterialCommunityIcons name="flash-off" size={26} />
        ) : (
          <MaterialCommunityIcons name="flash-auto" size={26} />
        )}
      </Animated.View>
    </TouchableRipple>
  );
}
