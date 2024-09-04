import type {FieldValues, UseControllerProps} from 'react-hook-form';
import {TextInputProps, TextInput} from 'react-native-paper';

export interface InputFiedlProps extends FieldValues {
  label: string;
  errorMessage?: string | null;
  inputProps: TextInputProps;
  controllerProps: UseControllerProps;
  reference: typeof TextInput;
  modeType: string;
  overrideStyle?: null;
  updateValue?: null;
}
