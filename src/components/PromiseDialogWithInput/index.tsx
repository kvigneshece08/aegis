import React, {useRef} from 'react';
import {Portal, Dialog, Button} from 'react-native-paper';
import {InputField} from '../InputField/InputField';
import {useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import {templateSchema} from '../../schemas/schema';
import {TextInput} from 'react-native';

type ConfirmationDialogWithInputProps = {
  onClose: () => void;
  onConfirm?: () => void;
  title: React.ReactNode;
  cancelButtonChildren: React.ReactNode;
  confirmButtionChildren?: React.ReactNode;
  isVisible?: boolean;
  templates: Array<any>;
};

export const ConfirmationDialogWithInput = (
  props: ConfirmationDialogWithInputProps,
) => {
  const {
    onClose,
    onConfirm,
    title,
    cancelButtonChildren,
    confirmButtionChildren,
    isVisible = true,
    templates = [],
  } = props;

  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
  } = useForm({
    resolver: yupResolver(templateSchema(templates)),
  });

  const onSubmit = async formData => {
    onConfirm(formData.name);
  };

  const refName = useRef<TextInput>(null);

  return (
    <Portal>
      <Dialog visible={isVisible} onDismiss={onClose}>
        {title && <Dialog.Title>{title}</Dialog.Title>}
        <Dialog.Content>
          <InputField
            ref={refName}
            label="Template Name"
            controllerProps={{name: 'name', control}}
            inputProps={{
              placeholder: 'Enter template name',
              onSubmitEditing: () => handleSubmit(onSubmit),
              returnKeyType: 'done',
            }}
            errorMessage={errors.name?.message}
          />
        </Dialog.Content>
        <Dialog.Actions>
          {cancelButtonChildren && onClose && (
            <Button onPress={onClose}>{cancelButtonChildren}</Button>
          )}

          {confirmButtionChildren && (
            <Button onPress={handleSubmit(onSubmit)}>
              {confirmButtionChildren}
            </Button>
          )}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
