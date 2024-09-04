import React, {useRef, useState} from 'react';
import {TextInput, View, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import {ScreensNavigationProps} from '../../@types/navigation';
import {InputField} from '../../components/InputField/InputField';
import {Button} from '../../components/Button';
import {
  FormDataSingUp,
  FormDataSingUpValue,
} from '../../entities/Form/accountForm';
import {signUpSchema} from '../../schemas/schema';
import {styles} from './styles';
import {ScrollViewCenterView} from '../../components/ScrollViewCenterView';
import {
  ImgStyles,
  Images,
  FontsStyle,
  ItemSpaceTen,
  darkColor,
} from '../../themes';
import {Text, Card} from 'react-native-paper';
import {useUserRegistrationMutation} from '../../services/apiServices';
import {setAuthDetails} from '../../redux/authDetails';
import {useAppDispatch, useAppSelector} from '../../hooks/reduxHooks';
import {
  STATUS_HTTP_CODE,
  STATUS_MESSAGE,
  SECURE_KEY,
} from '../../constants/enumValues';
import {setSecureValue} from '../../utils/keyChain';

const SignUp = () => {
  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
  } = useForm<FormDataSingUp>({
    resolver: yupResolver(signUpSchema),
    defaultValues: FormDataSingUpValue,
  });

  const refFirstname = useRef<TextInput>(null);
  const refLastname = useRef<TextInput>(null);
  const refUsername = useRef<TextInput>(null);
  const refEmail = useRef<TextInput>(null);
  const refPassword = useRef<TextInput>(null);
  const dispatch = useAppDispatch();
  const [userRegistration, {isLoading}] = useUserRegistrationMutation();
  const navigation = useNavigation<ScreensNavigationProps>();
  const authDetails = useAppSelector(state => state?.authDetails);
  const [signinError, setSigninError] = useState<boolean>(false);
  const [signinErrorMsg, setSigninErrorMsg] = useState<string>('');

  const createAccount = async (formData: FormDataSingUp) => {
    try {
      const userDetails = await userRegistration(formData).unwrap();
      if (userDetails?.status === STATUS_HTTP_CODE.SUCCESS) {
        dispatch(
          setAuthDetails({
            ...authDetails,
            user: userDetails?.data?.user,
            accessToken: userDetails?.data?.accessToken,
          }),
        );
        setSecureValue(SECURE_KEY.ACCESS_TOKEN, userDetails?.data?.accessToken);
        setSigninError(false);
        reset();
      } else {
        setSigninError(true);
        setSigninErrorMsg(userDetails?.message ?? STATUS_MESSAGE.UNKNOWN);
      }
    } catch (error: any) {
      setSigninError(true);
      setSigninErrorMsg(error?.message ?? STATUS_MESSAGE.UNKNOWN);
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
          Create account
        </Text>
        {signinError && (
          <Card mode="contained">
            <Card.Content>
              <Text
                variant="bodyMedium"
                style={{color: darkColor.colors.error}}>
                {signinErrorMsg}
              </Text>
            </Card.Content>
          </Card>
        )}
        <InputField
          ref={refFirstname}
          label="First Name"
          controllerProps={{name: 'firstName', control}}
          inputProps={{
            keyboardType: 'default',
            placeholder: 'Enter your first name',
            onSubmitEditing: () => refLastname?.current?.focus(),
            returnKeyType: 'next',
          }}
          errorMessage={errors.firstName?.message}
        />
        <InputField
          ref={refLastname}
          label="Last Name"
          controllerProps={{name: 'lastName', control}}
          inputProps={{
            keyboardType: 'default',
            placeholder: 'Enter your last name',
            onSubmitEditing: () => refUsername.current?.focus(),
            returnKeyType: 'next',
          }}
          errorMessage={errors.lastName?.message}
        />
        <InputField
          ref={refUsername}
          label="Username"
          controllerProps={{name: 'username', control}}
          inputProps={{
            keyboardType: 'default',
            placeholder: 'Enter your username',
            onSubmitEditing: () => refEmail.current?.focus(),
            returnKeyType: 'next',
          }}
          errorMessage={errors.username?.message}
        />
        <InputField
          ref={refEmail}
          label="Email Address"
          controllerProps={{name: 'emailAddress', control}}
          inputProps={{
            placeholder: 'Enter your email address',
            keyboardType: 'email-address',
            onSubmitEditing: () => refPassword.current?.focus(),
            returnKeyType: 'next',
          }}
          errorMessage={errors.emailAddress?.message}
        />

        <InputField
          ref={refPassword}
          label="Password"
          controllerProps={{name: 'password', control}}
          inputProps={{
            placeholder: 'Enter your password',
            secureTextEntry: true,
            onSubmitEditing: handleSubmit(createAccount),
          }}
          errorMessage={errors.password?.message}
        />
        <Button
          loading={isLoading}
          disabled={isLoading}
          mode="contained"
          uppercase
          labelStyle={FontsStyle.fontBold}
          style={ItemSpaceTen.spaceTenTopMargin}
          onPress={handleSubmit(createAccount)}>
          Sign Up
        </Button>
      </View>
      <View style={styles.accountLog}>
        <Text>Already have an account?</Text>
        <Button
          mode="text"
          compact
          onPress={() => navigation.navigate('SignIn')}>
          Sign in now
        </Button>
      </View>
    </ScrollViewCenterView>
  );
};

export default SignUp;
