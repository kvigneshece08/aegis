import {useEffect} from 'react';
import {useNavigation, useIsFocused} from '@react-navigation/native';

export function useFocusEffect(callback: any) {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (isFocused) {
        callback();
      }
    });

    return unsubscribe;
  }, [navigation, isFocused, callback]);
}
