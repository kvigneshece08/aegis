import React, {useRef, useState} from 'react';
import {TextInput, View, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import {ScreensNavigationProps} from '../../@types/navigation';
import {InputField} from '../../components/InputField/InputField';
import {Button} from '../../components/Button';
import {
  FormDataSingIn,
  FormDataSingInValue,
} from '../../entities/Form/accountForm';
import {sigInSchema} from '../../schemas/schema';
import {useUserLoginMutation} from '../../services/apiServices';
import {setAuthDetails} from '../../redux/authDetails';
import {ScrollViewCenterView} from '../../components/ScrollViewCenterView';
import {
  Images,
  ImgStyles,
  FontsStyle,
  ItemSpaceFive,
  darkColor, theme
} from "../../themes";
import {styles} from './styles';
import { Card, IconButton, Text } from "react-native-paper";
import {STATUS_HTTP_CODE} from '../../constants/enumValues';
import {setSecureValue} from '../../utils/keyChain';
import {useAppDispatch, useAppSelector} from '../../hooks/reduxHooks';
import {STATUS_MESSAGE, SECURE_KEY} from '../../constants/enumValues';

const SignIn = () => {
  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
  } = useForm<FormDataSingIn>({
    resolver: yupResolver(sigInSchema),
    defaultValues: FormDataSingInValue,
  });
  const authDetails = useAppSelector(state => state?.authDetails);
  const [userLogin, {isLoading}] = useUserLoginMutation();
  const dispatch = useAppDispatch();
  const refUsername = useRef<TextInput>(null);
  const refPassword = useRef<TextInput>(null);
  const navigation = useNavigation<ScreensNavigationProps>();
  const [loginError, setLoginError] = useState<boolean>(false);
  const [loginErrorMsg, setLoginErrorMsg] = useState<string>('');

  const onSubmit = async (formData: FormDataSingIn) => {
    try {
      const userDetails = await userLogin(formData).unwrap();
      if (userDetails?.status === STATUS_HTTP_CODE.SUCCESS) {
        if (userDetails?.data?.resetFlag === true) {
          dispatch(
            setAuthDetails({
              ...authDetails,
              user: userDetails?.data?.user,
              resetFlag: true,
            }),
          );
          reset();
          navigation.navigate('ResetPassword');
        } else {
          dispatch(
            setAuthDetails({
              ...authDetails,
              user: userDetails?.data?.user,
              accessToken: userDetails?.data?.accessToken,
            }),
          );
          setSecureValue(
            SECURE_KEY.ACCESS_TOKEN,
            userDetails?.data?.accessToken,
          );
          setLoginError(false);
          reset();
        }
      } else {
        setLoginError(true);
        setLoginErrorMsg(userDetails?.message ?? STATUS_MESSAGE.UNKNOWN);
      }
    } catch (error: any) {
      setLoginError(true);
      setLoginErrorMsg(error?.message ?? STATUS_MESSAGE.UNKNOWN);
    }
  };

  return (
    <ScrollViewCenterView>
      <View style={styles.container}>
        <Image
          style={ImgStyles.imgContain}
          source={Images.app_aegis_logo_icon}
        />
        <Text variant="titleLarge" style={styles.title}>
          Access your account
        </Text>
        {loginError && (
          <Card mode="contained">
            <Card.Content>
              <Text
                variant="bodyMedium"
                style={{color: darkColor.colors.error}}>
                {loginErrorMsg}
              </Text>
            </Card.Content>
          </Card>
        )}
        <InputField
          ref={refUsername}
          label="Username"
          controllerProps={{name: 'username', control}}
          inputProps={{
            placeholder: 'Enter your username',
            keyboardType: 'default',
            onSubmitEditing: () => refPassword.current?.focus(),
            returnKeyType: 'next',
          }}
          errorMessage={errors.username?.message}
        />
        <InputField
          ref={refPassword}
          label="Password"
          controllerProps={{
            name: 'password',
            control,
          }}
          inputProps={{
            placeholder: 'Enter your password',
            secureTextEntry: true,
            onSubmitEditing: handleSubmit(onSubmit),
            returnKeyType: 'done',
          }}
          errorMessage={errors.password?.message}
        />

        <Button
          mode="text"
          compact
          style={styles.alignSelfEnd}
          onPress={() => navigation.navigate('ForgotPassword')}>
          Forgot Password ?
        </Button>

        <Button
          loading={isLoading}
          disabled={isLoading}
          mode="contained"
          uppercase
          labelStyle={FontsStyle.fontBold}
          style={ItemSpaceFive.spaceTopMargin}
          onPress={handleSubmit(onSubmit)}>
          Sign In
        </Button>
      </View>

      <View style={styles.accountLog}>
      <Text>Don't have an account?</Text>
        <Button
          mode="text"
          compact
          onPress={() => navigation.navigate('SignUp')}>
          Sign Up
        </Button>
      </View>
    </ScrollViewCenterView>
  );
};

export default SignIn;
