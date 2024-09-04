import React from 'react';
import {Text} from '../ui';
import {Button, Dialog, Portal} from 'react-native-paper';

interface PermissionDialogProps {
  visible: boolean;
  title: string;
  content: string;
  onDismiss: () => void;
  onGrant?: () => void;
  grantButtonText?: string;
}

export function PermissionDialog({
  visible,
  title,
  content,
  grantButtonText,
  onDismiss,
  onGrant,
}: PermissionDialogProps) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} dismissable={false}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{content}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Dismiss</Button>
          {grantButtonText && (
            <Button onPress={onGrant}>{grantButtonText}</Button>
          )}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
