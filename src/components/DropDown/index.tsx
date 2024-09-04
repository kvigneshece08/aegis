import {
  LayoutChangeEvent,
  ScrollView,
  TextStyle,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import {
  Checkbox,
  Divider,
  Menu,
  TextInput,
  TouchableRipple,
  useTheme,
  HelperText,
} from 'react-native-paper';
import {Controller} from 'react-hook-form';
import React, {
  ReactNode,
  forwardRef,
  useEffect,
  useState,
  useCallback,
  Fragment,
} from 'react';

type Without<T, K> = Pick<T, Exclude<keyof T, K>>;

export interface DropDownPropsInterface {
  visible: boolean;
  multiSelect?: boolean;
  onDismiss: () => void;
  showDropDown: () => void;
  selectedValue: any;
  setValue?: (_value: any, additionalVal?: any) => void;
  label?: string | undefined;
  placeholder?: string | undefined;
  mode?: 'outlined' | 'flat' | undefined;
  inputProps?: TextInputPropsWithoutTheme;
  list: Array<{
    label: string;
    value: string | number;
    additionalVal?: string | number | object | [];
    custom?: ReactNode;
  }>;
  dropDownContainerMaxHeight?: number;
  dropDownContainerHeight?: number;
  activeColor?: string;
  theme?: any;
  dropDownStyle?: ViewStyle;
  dropDownItemSelectedTextStyle?: TextStyle;
  dropDownItemSelectedStyle?: ViewStyle;
  dropDownItemStyle?: ViewStyle;
  dropDownItemTextStyle?: TextStyle;
  accessibilityLabel?: string;
  disabled?: boolean;
  inputRef?: any;
  controllerProps?: any;
  errorMessage?: string | null;
}

type TextInputPropsWithoutTheme = Without<any, 'theme'>;

export const DropDown = forwardRef<
  TouchableWithoutFeedback,
  DropDownPropsInterface
>((props, ref) => {
  const activeTheme = useTheme();
  const {
    multiSelect = false,
    visible,
    onDismiss,
    showDropDown,
    selectedValue,
    setValue,
    activeColor,
    mode,
    label,
    placeholder,
    inputProps,
    list,
    dropDownContainerMaxHeight,
    dropDownContainerHeight,
    theme,
    dropDownStyle,
    dropDownItemStyle,
    dropDownItemSelectedStyle,
    dropDownItemTextStyle,
    dropDownItemSelectedTextStyle,
    accessibilityLabel,
    disabled,
    inputRef,
    controllerProps,
    errorMessage = null,
  } = props;
  const [displayValue, setDisplayValue] = useState('');
  const [inputLayout, setInputLayout] = useState({
    height: 0,
    width: 0,
    x: 0,
    y: 0,
  });
  const onLayout = (event: LayoutChangeEvent) => {
    setInputLayout(event.nativeEvent.layout);
  };

  useEffect(() => {
    if (list.length > 0) {
      if (multiSelect) {
        const _labels = list
          .filter(_ => selectedValue.indexOf(_.value) !== -1)
          .map(_ => _.label)
          .join(', ');
        setDisplayValue(_labels);
      } else {
        const _label = list.find(_ => _.value === selectedValue)?.label;
        if (_label) {
          setDisplayValue(_label);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, selectedValue]);

  const isActive = useCallback(
    (currentValue: any) => {
      if (multiSelect) {
        return selectedValue.indexOf(currentValue) !== -1;
      } else {
        return selectedValue === currentValue;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedValue],
  );

  const setActive = useCallback(
    (currentValue: any, additionalVal?: any) => {
      if (multiSelect) {
        const valueIndex = selectedValue.indexOf(currentValue);
        const values = selectedValue.split(',');
        if (valueIndex === -1) {
          setValue([...values, currentValue].join(','), additionalVal);
        } else {
          setValue(
            [...values]
              .filter(valueItem => valueItem !== currentValue)
              .join(','),
            additionalVal,
          );
        }
      } else {
        setValue(currentValue, additionalVal);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedValue],
  );

  return (
    <Controller
      name={controllerProps.name}
      control={controllerProps.control}
      render={({field: {onChange, value}}) => {
        return (
          <>
            <Menu
              visible={visible}
              onDismiss={onDismiss}
              theme={theme}
              anchor={
                <TouchableRipple
                  ref={ref}
                  onPress={showDropDown}
                  onLayout={onLayout}
                  accessibilityLabel={accessibilityLabel}>
                  <View pointerEvents={'none'}>
                    <TextInput
                      ref={inputRef}
                      value={value}
                      mode={mode}
                      label={label}
                      placeholder={placeholder}
                      pointerEvents={'none'}
                      disabled={disabled}
                      theme={theme}
                      right={
                        <TextInput.Icon
                          icon={visible ? 'menu-up' : 'menu-down'}
                        />
                      }
                      {...inputProps}
                    />
                  </View>
                </TouchableRipple>
              }
              style={{
                maxWidth: inputLayout?.width,
                width: inputLayout?.width,
                marginTop: inputLayout?.height,
                ...dropDownStyle,
              }}>
              <ScrollView
                bounces={false}
                style={{
                  ...(dropDownContainerHeight
                    ? {
                        height: dropDownContainerHeight,
                      }
                    : {
                        maxHeight: dropDownContainerMaxHeight || 200,
                      }),
                }}>
                {list.map((_item, _index) => (
                  <Fragment key={_index}>
                    <TouchableRipple
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                      onPress={() => {
                        onChange(_item.value);
                        setActive(_item.value, _item.additionalVal);
                        if (onDismiss) {
                          onDismiss();
                        }
                      }}>
                      <Fragment>
                        <Menu.Item
                          key={_index}
                          titleStyle={{
                            color: isActive(_item.value)
                              ? activeColor ||
                                (theme || activeTheme).colors.primary
                              : (theme || activeTheme).colors.text,
                            ...(isActive(_item.value)
                              ? dropDownItemSelectedTextStyle
                              : dropDownItemTextStyle),
                          }}
                          title={_item.custom || _item.label}
                          style={{
                            ...(isActive(_item.value)
                              ? dropDownItemSelectedStyle
                              : dropDownItemStyle),
                            minWidth: inputLayout?.width,
                            maxWidth: inputLayout?.width,
                          }}
                          contentStyle={{
                            flex: 1,
                            minWidth: undefined,
                            maxWidth: undefined,
                          }}
                        />
                        {multiSelect && (
                          <Checkbox.Android
                            theme={{
                              colors: {accent: activeTheme?.colors.primary},
                            }}
                            status={
                              isActive(_item.value) ? 'checked' : 'unchecked'
                            }
                            onPress={() => setActive(_item.value)}
                          />
                        )}
                      </Fragment>
                    </TouchableRipple>
                    <Divider />
                  </Fragment>
                ))}
              </ScrollView>
            </Menu>
            {!!errorMessage && (
              <HelperText type="error" visible={!!errorMessage}>
                {errorMessage}
              </HelperText>
            )}
          </>
        );
      }}
    />
  );
});
