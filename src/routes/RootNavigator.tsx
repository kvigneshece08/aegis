import React, {useEffect} from 'react';
import {
  ActivityIndicator,
  Dialog,
  Portal,
  Button,
  Text,
  Appbar,
} from 'react-native-paper';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {StackNavigatorParamListType} from '../@types/navigation';
import {Images, ImgLandingStyles} from '../themes';
import {getSecureValue, removeSecureValue} from '../utils/keyChain';
import {STATUS_HTTP_CODE, SECURE_KEY} from '../constants/enumValues';
import {setAuthDetails} from '../redux/authDetails';
import {useAppDispatch, useAppSelector} from '../hooks/reduxHooks';
import {useApiGetAuthVerification} from '../hooks/useAuthVerification';
import SignIn from '../screens/Account/SignIn';
import SignUp from '../screens/Account/SignUp';
import AccountEnroll from '../screens/Account/AccountEnroll';
import ForgotPassword from '../screens/Account/ForgotPassword';
import ResetPassword from '../screens/Account/ResetPassword';
import ChangePassword from '../screens/Account/ChangePassword';
import {ProjectNavigator} from './ProjectNavigator';
import AddSiteReport from '../screens/Main/SiteReport/AddEditSiteReport';
import {getHeaderTitle} from '@react-navigation/elements';
import {theme, fonts} from '../themes';
import AddEditDelayReport from '../screens/Main/DelayReport/AddEditDelayReport';
import {Image, View} from 'react-native';

const Stack = createNativeStackNavigator<StackNavigatorParamListType>();

export const RootNavigation = () => {
  const authDetails = useAppSelector(state => state?.authDetails);
  const dispatch = useAppDispatch();
  const [skipAuthRequest, setSkipAuthRequest] = React.useState(true);
  const {
    authData,
    isAuthDataError,
    isAuthDataSuccess,
    authDataError,
    authDataRefetch,
  } = useApiGetAuthVerification(skipAuthRequest);

  useEffect(() => {
    async function verifyUserAuth() {
      try {
        let storedAccessToken = await getSecureValue(SECURE_KEY.ACCESS_TOKEN);
        if (storedAccessToken) {
          setSkipAuthRequest(false);
          dispatch(
            setAuthDetails({
              ...authDetails,
              accessToken: storedAccessToken,
            }),
          );
          if (isAuthDataSuccess) {
            if (authData?.status === STATUS_HTTP_CODE.SUCCESS) {
              dispatch(
                setAuthDetails({
                  user: authData?.data?.user,
                  accessToken: storedAccessToken,
                  isAuthLoading: false,
                }),
              );
            } else {
              // Remove the token details
              removeSecureValue('access_token');
              dispatch(
                setAuthDetails({
                  ...authDetails,
                  isAuthLoading: false,
                }),
              );
            }
          }
        } else {
          dispatch(
            setAuthDetails({
              ...authDetails,
              isAuthLoading: false,
            }),
          );
        }
      } catch (e) {
        dispatch(
          setAuthDetails({
            ...authDetails,
            isAuthLoading: false,
          }),
        );
      }
    }
    verifyUserAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authDataError, authData, isAuthDataSuccess]);

  if (authDetails?.isAuthLoading || isAuthDataError) {
    return (
      <>
        {isAuthDataError ? (
          <Portal>
            <Dialog visible={true}>
              <Dialog.Title>Error</Dialog.Title>
              <Dialog.Content>
                <Text variant="titleSmall">
                  Unable to login - Please verify your internet connection. Try
                  again later.
                </Text>
              </Dialog.Content>
              <Dialog.Actions>
                <Button onPress={() => authDataRefetch()} mode="contained">
                  Refresh
                </Button>
              </Dialog.Actions>
            </Dialog>
          </Portal>
        ) : (
          <View
            style={[
              {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}>
            <Image
              style={ImgLandingStyles.imgContain}
              source={Images.app_aegis_logo_three}
              resizeMode="contain"
            />
          </View>
        )}
      </>
    );
  }

  const initialRouteName =
    authDetails?.user !== null && !authDetails?.resetFlag
      ? 'Home'
      : 'AccountEnroll';

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{headerShown: false, gestureEnabled: false}}>
      {authDetails?.user !== null && !authDetails?.resetFlag ? (
        <>
          <Stack.Screen name="Project" component={ProjectNavigator} />
          <Stack.Screen
            name="AddEditSiteReport"
            component={AddSiteReport}
            options={{
              headerShown: true,
              title: 'Add Site Report',
              header: ({navigation, route, options, back}) => {
                const title = getHeaderTitle(options, route.name);
                return (
                  <Appbar.Header mode={back ? 'small' : 'center-aligned'}>
                    {back ? (
                      <Appbar.BackAction onPress={navigation.goBack} />
                    ) : null}
                    <Appbar.Content
                      title={title}
                      titleStyle={[
                        theme.fonts.titleLarge,
                        {fontSize: fonts.size.h6},
                      ]}
                    />
                  </Appbar.Header>
                );
              },
            }}
          />
          <Stack.Screen
            name="AddEditDelayReport"
            component={AddEditDelayReport}
            options={{
              headerShown: true,
              title: 'Add Delay / Disruption Report',
              header: ({navigation, route, options, back}) => {
                const title = getHeaderTitle(options, route.name);
                return (
                  <Appbar.Header mode={back ? 'small' : 'center-aligned'}>
                    {back ? (
                      <Appbar.BackAction onPress={navigation.goBack} />
                    ) : null}
                    <Appbar.Content
                      title={title}
                      titleStyle={[
                        theme.fonts.titleLarge,
                        {fontSize: fonts.size.h6},
                      ]}
                    />
                  </Appbar.Header>
                );
              },
            }}
          />
          <Stack.Screen name="ChangePassword" component={ChangePassword} />
        </>
      ) : (
        <>
          <Stack.Screen name="AccountEnroll" component={AccountEnroll} />
          <Stack.Screen name="SignIn" component={SignIn} />
          <Stack.Screen name="SignUp" component={SignUp} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          <Stack.Screen name="ResetPassword" component={ResetPassword} />
        </>
      )}
    </Stack.Navigator>
  );
};
