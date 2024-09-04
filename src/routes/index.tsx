import React from 'react';
import {RootNavigation} from './RootNavigator';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';

export default function Navigation({theme}: {theme: any}) {
  const navigationRef = useNavigationContainerRef();
  return (
    <NavigationContainer theme={theme} ref={navigationRef} fallback={<></>}>
      <RootNavigation />
    </NavigationContainer>
  );
}
