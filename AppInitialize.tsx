import React from 'react';
import {StyleSheet, KeyboardAvoidingView, Platform} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {Provider} from 'react-redux';
import {store} from './src/redux/store';
import {PaperProvider} from 'react-native-paper';
import {theme} from './src/themes';
import Navigation from './src/routes';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

const AppInitialize = () => {
  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{flex: 1, backgroundColor: '#1f1b16'}}>
        <Provider store={store}>
          <PaperProvider theme={theme}>
            <Navigation theme={theme} />
          </PaperProvider>
        </Provider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default AppInitialize;
