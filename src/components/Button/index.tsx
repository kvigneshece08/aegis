import React from 'react';
import {Button as PaperButton} from 'react-native-paper';
import {theme} from '../../themes';

type Props = React.ComponentProps<typeof PaperButton>;

export const Button = ({mode, style, children, ...props}: Props) => (
  <PaperButton
    style={[
      mode === 'outlined' && {backgroundColor: theme.colors.surface},
      style,
    ]}
    mode={mode}
    {...props}>
    {children}
  </PaperButton>
);
