import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {StackNavigatorParamListType} from '../@types/navigation';
import ProjectDetails from '../screens/Main/ProjectDetails';
import ProjectSelection from '../screens/Main/ProjectSelection';
import {getHeaderTitle} from '@react-navigation/elements';
import {Appbar} from 'react-native-paper';
import {fonts, theme} from '../themes';
import ViewSiteReport from '../screens/Main/SiteReport/ViewSiteReport';
import ViewDelayReport from '../screens/Main/DelayReport/ViewDelayReport';
import ProjectDashboard from '../screens/Main/ProjectDashboard';
import PDFViewerScreen from '../screens/Main/PDFViewer';
import TemplateAndFormView from '../screens/Main/TemplatesAndForms/TemplateAndFormView';
import TemplateAndFormsDashboard from '../screens/Main/TemplatesAndForms/TemplateAndFormsDashboard';
import PdfPreview from '../components/ui/components/PdfPreview';

const ProjectStack = createNativeStackNavigator<StackNavigatorParamListType>();
export const ProjectSelectionNavigator = () => {
  return (
    <ProjectStack.Navigator
      screenOptions={{
        header: ({navigation, route, options, back}) => {
          const title = getHeaderTitle(options, route.name);
          return (
            <Appbar.Header mode={back ? 'small' : 'center-aligned'}>
              {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
              <Appbar.Content
                title={route?.params?.paramName? route?.params?.paramName : title}
                titleStyle={[theme.fonts.titleLarge, {fontSize: fonts.size.h6}]}
              />
            </Appbar.Header>
          );
        },
      }}>
      <ProjectStack.Screen
        name="ProjectDashboard"
        options={{
          title: 'Project Dashboard',
        }}
        component={ProjectDashboard}
      />
      <ProjectStack.Screen
        name="ProjectSelectionHome"
        options={{
          title: 'Assigned Projects',
          headerBackVisible: false,
          headerBackButtonMenuEnabled: false,
          headerLeft: () => null,
        }}
        component={ProjectSelection}
      />
      <ProjectStack.Screen
        name="ProjectDetails"
        options={{
          title: 'Project Details',
        }}
        component={ProjectDetails}
      />
      <ProjectStack.Screen
        name="ViewSiteReport"
        options={{
          title: 'Project Site Report',
        }}
        component={ViewSiteReport}
      />
      <ProjectStack.Screen
        name="ViewDelayReport"
        options={{
          title: 'Project Delay / Disruption Report',
        }}
        component={ViewDelayReport}
      />
      <ProjectStack.Screen
        name="PDFViewer"
        component={PDFViewerScreen}
        options={{
          title: 'PDF Viewer',
        }}
      />
      <ProjectStack.Screen
        name="PdfPreview"
        component={PdfPreview}
        options={{
          title: 'PDF Preview',
        }}
      />
      <ProjectStack.Screen
        name="ViewTemplatesAndFormsDashboard"
        options={{
          title: 'Templates and Notices',
        }}
        component={TemplateAndFormsDashboard}
      />
       <ProjectStack.Screen
        name="ViewTemplatesAndForms"
        options={{
          title: 'Templates',
        }}
        component={TemplateAndFormView}
      />
    </ProjectStack.Navigator>
  );
};
