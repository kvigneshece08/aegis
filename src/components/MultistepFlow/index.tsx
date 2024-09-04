import React, {forwardRef, useContext, useImperativeHandle} from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
  Pressable,
  LayoutAnimationConfig,
  LayoutAnimation,
  Platform,
  useWindowDimensions,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Text} from 'react-native-paper';
import {Button} from '../Button';
import {useNavigation} from '@react-navigation/native';
import {useAction} from '../../utils/action';
import Animated, {
  useSharedValue,
  withRepeat,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {darkColor} from '../../themes';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

type Props = {
  children?: React.ReactNode;
  onCancel?: () => void;
  onFinish: () => Promise<void> | void;
  animator?: Animator;
};

type Animator = {
  prevStyle?: ViewStyle;
  nextStyle?: ViewStyle;
  animation: LayoutAnimationConfig;
};

export const SLIDE_ANIMATOR: Animator = {
  prevStyle: {left: '-100%'},
  nextStyle: {left: '100%'},
  animation: LayoutAnimation.Presets.easeInEaseOut,
};

export function MultistepFlow(props: Props) {
  const {onCancel, animator = SLIDE_ANIMATOR} = props;
  const onFinish = useLatestCallback(props.onFinish);
  const children = React.Children.toArray(props.children);
  const [curPage, setCurPage] = React.useState(0);
  const {prevStyle, nextStyle} = animator;
  const transition = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateX: withSpring(transition.value)}],
    };
  });

  async function next() {
    if (isLast()) {
      await onFinish.current();
    } else {
      transition.value = withRepeat(withSpring(1), 1, true);
      setCurPage(curPage + 1);
    }
  }

  async function back() {
    if (curPage === 0) {
      if (onCancel) {
        onCancel();
      }
    } else {
      transition.value = withRepeat(withSpring(-1), 1, true);
      setCurPage(curPage - 1);
    }
  }

  function isLast() {
    return curPage === children.length - 1;
  }

  return (
    <FlowApiContext.Provider value={{next, back, isLast}}>
      <View style={S.multiFlowContainer}>
        {children.map((child, index) => {
          const animStyle =
            index < curPage ? prevStyle : index > curPage ? nextStyle : {};

          return (
            animStyle && (
              <Animated.View
                style={[S.fullscreen, animStyle, animatedStyle]}
                key={index}>
                {child}
              </Animated.View>
            )
          );
        })}
      </View>
    </FlowApiContext.Provider>
  );
}

function useLatestCallback<I extends any[], T>(fn: (...args: I) => T) {
  const ref = React.useRef(fn);
  ref.current = fn;
  return ref;
}

type FlowApi = {
  next: () => Promise<void>;
  back: () => Promise<void>;
  isLast: () => boolean;
};

const FlowApiContext = React.createContext<FlowApi | null>(null);

export function useFlow(): FlowApi {
  const api = useContext(FlowApiContext);
  if (api == null) {
    throw Error('not null');
  }
  return api;
}

type StepProps = {
  title?: string;
  subtitle?: string;
  submitText?: string;
  required?: boolean;
  nextOk?: boolean;
  backOk?: boolean;
  onNext?: () => void | Promise<void> | Promise<boolean>;
  onSkip?: () => void | Promise<void>;
  children?: React.ReactNode;
  defaultStyle?: boolean;
};

export function KeyboardDismissPressable() {
  return (
    <Pressable
      style={StyleSheet.absoluteFill}
      onPress={() => Keyboard.dismiss()}
    />
  );
}

export function StepFlowBackButton(props: {
  back?: () => void;
  backVisible?: boolean;
}) {
  const {back, backVisible} = props;
  const nav = useNavigation<any>();
  const show = backVisible ?? (back || nav.canGoBack());

  function onBack() {
    if (back) {
      back();
    } else {
      nav.goBack();
    }
  }

  return (
    <>
      {show && (
        <View style={{flexDirection: 'row'}}>
          <Button
            icon="chevron-left"
            compact
            onPress={onBack}
            style={S.backButton}>
            Previous Section
          </Button>
        </View>
      )}
    </>
  );
}

export const FADE_ANIMATOR: Animator = {
  animation: LayoutAnimation.create(800, 'easeInEaseOut', 'opacity'),
};

export const Step = forwardRef((props: StepProps, ref) => {
  const {title, subtitle, submitText, onNext, onSkip, children} = props;
  const {
    required = true,
    nextOk = true,
    backOk = true,
    defaultStyle = true,
  } = props;
  const flow = useFlow();
  const {top} = useSafeAreaInsets();
  const [onNextStep, loading] = useAction('NextStep:', nextStep);

  async function nextStep() {
    if (onNext) {
      const result = await onNext();
      if (!result) {
        return false;
      }
    }
    await flow.next();
    Keyboard.dismiss();
  }

  async function goToNextStep() {
    await flow.next();
    Keyboard.dismiss();
  }

  async function skip() {
    if (onSkip) {
      await onSkip();
    }
    await flow.next();
    Keyboard.dismiss();
  }

  const skippy = React.useCallback(skip, [onSkip, flow]);

  const nextText = flow.isLast() ? submitText || 'Finish' : 'Continue';
  const skipText = flow.isLast() ? 'Skip & Finish' : 'Skip';
  const {height} = useWindowDimensions();

  useImperativeHandle(ref, () => ({
    goToNextStep,
  }));

  return (
    <View style={S.container}>
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{flexGrow: 1}}
        showsVerticalScrollIndicator={false}
        style={[
          S.scrollViewContainer,
          {maxHeight: Platform.OS === 'ios' ? height - 390 : 'auto'},
        ]}
        contentInsetAdjustmentBehavior="automatic">
        <KeyboardDismissPressable />
        <StepFlowBackButton back={flow.back} backVisible={backOk} />

        {title && <Text variant="titleMedium">{title}</Text>}
        {subtitle && <Text variant="titleSmall">{subtitle}</Text>}
        <View style={S.content}>{children}</View>
      </KeyboardAwareScrollView>
      <View style={S.footerBtnContainer}>
        {!required && (
          <Button
            mode="outlined"
            onPress={skippy}
            textColor={
              defaultStyle
                ? darkColor.colors.secondary
                : darkColor.colors.tertiary
            }
            style={[
              S.skip,
              {
                borderColor: defaultStyle
                  ? darkColor.colors.secondary
                  : darkColor.colors.tertiary,
              },
            ]}>
            {skipText}
          </Button>
        )}
        <Button
          onPress={onNextStep}
          style={[
            S.skip,
            {
              backgroundColor: defaultStyle
                ? darkColor.colors.secondary
                : darkColor.colors.tertiary,
            },
          ]}
          mode="contained"
          disabled={!nextOk}
          loading={loading}>
          {nextText}
        </Button>
      </View>
    </View>
  );
});

const S = StyleSheet.create({
  multiFlowContainer: {
    flex: 1,
  },
  fullscreen: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: Platform.OS === 'ios' ? undefined : '100%',
  },
  containerRoot: {
    flex: 1,
  },
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'space-between',
  },
  scrollViewContainer: {
    maxHeight: Platform.OS === 'ios' ? 500 : 'auto',
  },
  content: {
    marginTop: 15,
  },

  skip: {
    marginBottom: 10,
    marginLeft: 15,
  },
  backButton: {
    zIndex: 5,
    marginLeft: -10,
    height: 36,
  },
  footerBtnContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Align buttons to the right
    alignItems: 'flex-end', // Align buttons to the bottom
    marginTop: 10,
    // marginBottom: 30,
  },
});
