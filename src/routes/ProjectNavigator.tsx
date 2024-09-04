import React from 'react';
import {StackNavigatorParamListType} from '../@types/navigation';
import {createMaterialBottomTabNavigator} from 'react-native-paper/react-navigation';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBuilding, faGear, faHome } from '@fortawesome/free-solid-svg-icons';
import Settings from '../screens/Main/Settings';
import Home from '../screens/Main/Home';
import {ProjectSelectionNavigator} from './ProjectSelectionNavigator';
import {theme} from '../themes';
import {Platform} from 'react-native';


const Tab = createMaterialBottomTabNavigator<StackNavigatorParamListType>();

export const ProjectNavigator = () => {
  return (
    <Tab.Navigator initialRouteName="ProjectHome" theme={theme}>
      <Tab.Screen
        name="ProjectHome"
        component={Home}
        options={{
          tabBarLabel: 'Home',
          // eslint-disable-next-line react/no-unstable-nested-components
          tabBarIcon: ({color}) => (
            Platform.OS === 'ios' ? 
            <FontAwesomeIcon icon={faHome} color={color} size={26} /> :
            <MaterialCommunityIcons name="home" color={color} size={26} />
           ),
        }}
      />
      <Tab.Screen
        name="ProjectSelection"
        component={ProjectSelectionNavigator}
        options={{
          tabBarLabel: 'Project',
          // eslint-disable-next-line react/no-unstable-nested-components
          tabBarIcon: ({color}) => (
            Platform.OS === 'ios' ? 
            <FontAwesomeIcon icon={faBuilding} size={26} color={color} /> :
            <MaterialCommunityIcons
              name="office-building-marker"
              color={color}
              size={26}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          tabBarLabel: 'Settings',
          // eslint-disable-next-line react/no-unstable-nested-components
          tabBarIcon: ({color}) => (
            Platform.OS === 'ios' ? 
            <FontAwesomeIcon icon={faGear} color={color} size={26} /> :
            <MaterialCommunityIcons
              name="account-settings"
              color={color}
              size={26}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};
