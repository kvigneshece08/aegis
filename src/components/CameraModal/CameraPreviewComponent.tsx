import React from 'react';
import {Image, Dimensions} from 'react-native';
import {Portal, Dialog, TextInput, Button} from 'react-native-paper';

export const CameraPreviewComponent = ({
  visible,
  imageUri,
  onAddComment,
  onClose,
}) => {
  const [comment, setComment] = React.useState('');
  const screenHeight = Dimensions.get('window').height;

  const handleAddComment = React.useCallback(() => {
    onAddComment(comment);
    setComment('');
  }, [comment, onAddComment]);

  const handleClose = () => {
    setComment('');
    onClose();
  };
  return (
    <Portal>
      <Dialog visible={visible}>
        <Dialog.Title>Image Comment</Dialog.Title>
        <Dialog.Content>
          <Image
            source={{uri: imageUri}}
            style={{
              width: '100%',
              aspectRatio: 1,
              maxHeight: screenHeight * 0.6,
            }}
          />
          <TextInput
            multiline={true}
            placeholder="Add your comment..."
            value={comment}
            onChangeText={setComment}
            maxLength={100}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleClose} mode="outlined">
            Don't Add
          </Button>
          <Button onPress={handleAddComment} mode="contained">
            Add Comment
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
