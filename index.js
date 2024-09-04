/**
 * @format
 */

import {AppRegistry} from 'react-native';
import AppInitialize from './AppInitialize';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => AppInitialize);
