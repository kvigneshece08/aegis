import React, {forwardRef} from 'react';
import {View} from 'react-native';
import {Controller} from 'react-hook-form';
import {
  TextInput,
  TextInputProps,
  HelperText,
  Tooltip,
  IconButton,
  Menu,
  Button,
} from 'react-native-paper';
import {InputFiedlProps} from '../../entities/input';
import {styles} from './styles';

export const InputField = forwardRef<TextInputProps, InputFiedlProps>(
  (
    {
      label,
      errorMessage = null,
      inputProps,
      controllerProps,
      modeType = 'outlined',
      overrideStyle = null,
      inputTooltip = null,
      prePopulatedOption = null,
      updateValue = null,
      disabled = false
    },
    ref,
  ) => {
    const [visible, setVisible] = React.useState(false);
    const openMenu = () => setVisible(true);

    const closeMenu = () => setVisible(false);

    const handleOptionSelect = option => {
      if (updateValue !== null) {
        updateValue(controllerProps?.name, option);
      }
      closeMenu();
    };

    return (
      <Controller
        render={({field}) => (
          <View style={[styles(inputTooltip).container, overrideStyle]}>
            <TextInput
              label={label}
              value={field?.value?.toString()}
              onChangeText={text => {
                field.onChange(text);
              }}
              mode={modeType}
              {...inputProps}
              ref={ref as any}
              disabled={disabled}
            />
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              {/* {!!inputTooltip && (
                <Tooltip
                  title={inputTooltip}
                  enterTouchDelay={100}
                  leaveTouchDelay={2000}>
                  <IconButton
                    icon="information"
                    selected
                    size={14}
                    onPress={() => {}}
                    style={{margin: 0, paddingTop: 0}}
                  />
                </Tooltip>
              )} */}
              {!!prePopulatedOption && (
                <Menu
                  visible={visible}
                  onDismiss={closeMenu}
                  anchor={
                    <Button
                      labelStyle={{marginVertical: 4, marginHorizontal: 5}}
                      onPress={openMenu}>
                      Suggestions?
                    </Button>
                  }>
                  {prePopulatedOption?.map((option: any, index) => (
                    <Menu.Item
                      key={index}
                      onPress={() => handleOptionSelect(option.value)}
                      title={option.label}
                    />
                  ))}
                </Menu>
              )}
            </View>
            {!!errorMessage && (
              <View style={styles(inputTooltip).errorContainer}>
                <HelperText
                  type="error"
                  style={styles(inputTooltip).error}
                  visible={!!errorMessage}>
                  {errorMessage}
                </HelperText>
              </View>
            )}
          </View>
        )}
        {...controllerProps}
      />
    );
  },
);
