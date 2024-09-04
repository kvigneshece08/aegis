import React, {useMemo, useRef} from 'react';
import {TouchableRipple} from 'react-native-paper';
import Animated, {
  Extrapolate,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
} from 'react-native-reanimated';
import Carousel, {ICarouselInstance} from 'react-native-reanimated-carousel';

const captureModes = ['photo', 'video'] as const;
export type CaptureMode = (typeof captureModes)[number];

export function CaptureModeCarousel({
  value,
  onChange,
  isCapturing,
}: {
  value: CaptureMode;
  onChange: (value: CaptureMode) => void;
  isCapturing: boolean;
}) {
  const carouselRef = useRef<ICarouselInstance>(null);

  const data = useMemo(() => ['photo', 'video'] as CaptureMode[], []);

  return (
    <Carousel
      ref={carouselRef}
      width={120}
      height={40}
      mode="parallax"
      loop={false}
      modeConfig={{
        parallaxScrollingScale: 1,
        parallaxScrollingOffset: 50,
      }}
      // eslint-disable-next-line react-native/no-inline-styles
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'visible',
      }}
      scrollAnimationDuration={300}
      data={data}
      defaultIndex={captureModes.indexOf(value)}
      onSnapToItem={index => onChange(captureModes[index])}
      enabled={!isCapturing}
      customAnimation={(valueParam: number) => {
        'worklet';
        const scale = interpolate(
          valueParam,
          [-1, 0, 1],
          [1, 1, 1],
          Extrapolate.CLAMP,
        );
        const translate = interpolate(valueParam, [0, 1], [0, 70]);
        const backgroundColor = interpolateColor(
          valueParam,
          [-1, 0, 1],
          ['transparent', '#000008', 'transparent'],
        );

        return {
          transform: [
            {scale},
            {
              translateX: translate,
            },
            {perspective: 150},
          ],
          backgroundColor,
          width: 80,
          borderRadius: 40,
        };
      }}
      renderItem={({index, item, animationValue}) => (
        <CaptureModeItem
          animationValue={animationValue}
          text={item}
          disabled={isCapturing}
          onPress={() => carouselRef.current?.scrollTo({index, animated: true})}
        />
      )}
    />
  );
}

function CaptureModeItem({
  animationValue,
  text,
  onPress,
  disabled,
}: {
  animationValue: Animated.SharedValue<number>;
  text: string;
  onPress?: () => void;
  disabled: boolean;
}) {
  const textAnimatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      animationValue.value,
      [-1, 0, 1],
      ['#ffff80', '#fff', '#ffff80'],
    );

    return {
      color,
      textTransform: 'uppercase',

      fontWeight: '600',
    };
  });

  return (
    <TouchableRipple
      // eslint-disable-next-line react-native/no-inline-styles
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 40,
      }}
      onPress={onPress}
      borderless
      disabled={disabled}>
      <Animated.Text style={textAnimatedStyle}>{text}</Animated.Text>
    </TouchableRipple>
  );
}
