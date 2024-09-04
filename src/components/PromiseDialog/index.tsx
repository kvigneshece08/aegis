import React from 'react';
import {Portal, Dialog, Text, Button} from 'react-native-paper';

type ConfirmationDialogProps = {
  onClose: () => void;
  onConfirm?: () => void;
  title: React.ReactNode;
  description: React.ReactNode;
  cancelButtonChildren: React.ReactNode;
  confirmButtionChildren?: React.ReactNode;
  isVisible?: boolean;
};

export const ConfirmationDialog = (props: ConfirmationDialogProps) => {
  const {
    onClose,
    onConfirm,
    title,
    description,
    cancelButtonChildren,
    confirmButtionChildren,
    isVisible = true,
  } = props;
  return (
    <Portal>
      <Dialog visible={isVisible} onDismiss={onClose}>
        {title && <Dialog.Title>{title}</Dialog.Title>}
        {description && (
          <Dialog.Content>
            <Text variant="bodyMedium">{description}</Text>
          </Dialog.Content>
        )}

        <Dialog.Actions>
          {cancelButtonChildren && onClose && (
            <Button onPress={onClose}>{cancelButtonChildren}</Button>
          )}

          {confirmButtionChildren && (
            <Button onPress={onConfirm}>{confirmButtionChildren}</Button>
          )}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
