import React, {useRef, useState} from 'react';
import {TextInput, View, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import {ScreensNavigationProps} from '../../@types/navigation';
import {InputField} from '../../components/InputField/InputField';
import {Button} from '../../components/Button';
import {
  FormDataResetPassword,
  FormDataResetPasswordValue,
} from '../../entities/Form/accountForm';
import {resetPasswordSchema} from '../../schemas/schema';
import {useResetPasswordMutation} from '../../services/apiServices';
import {setAuthDetails} from '../../redux/authDetails';
import {ScrollViewCenterView} from '../../components/ScrollViewCenterView';
import {
  Images,
  ImgStyles,
  FontsStyle,
  ItemSpaceFive,
  darkColor,
} from '../../themes';
import {styles} from './styles';
import {Card, Text} from 'react-native-paper';
import {STATUS_HTTP_CODE} from '../../constants/enumValues';
import {setSecureValue} from '../../utils/keyChain';
import {useAppDispatch, useAppSelector} from '../../hooks/reduxHooks';
import {STATUS_MESSAGE, SECURE_KEY} from '../../constants/enumValues';

const ResetPassword = () => {
  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
  } = useForm<FormDataResetPassword>({
    resolver: yupResolver(resetPasswordSchema),
    defaultValues: FormDataResetPasswordValue,
  });
  const [resetPassword, {isLoading}] = useResetPasswordMutation();
  const dispatch = useAppDispatch();
  const authDetails = useAppSelector(state => state?.authDetails);
  const refPassword = useRef<TextInput>(null);
  const navigation = useNavigation<ScreensNavigationProps>();
  const [resetError, setResetError] = useState<boolean>(false);
  const [resetErrorMsg, setResetErrorMsg] = useState<string>('');

  const onSubmit = async (formData: FormDataResetPassword) => {
    try {
      const formattedValue = {
        ...formData,
        id: authDetails?.user?.id,
      };
      const userDetails = await resetPassword(formattedValue).unwrap();
      if (userDetails?.status === STATUS_HTTP_CODE.SUCCESS) {
        dispatch(
          setAuthDetails({
            user: userDetails?.data?.user,
            accessToken: userDetails?.data?.accessToken,
            resetFlag: false,
          }),
        );
        setSecureValue(SECURE_KEY.ACCESS_TOKEN, userDetails?.data?.accessToken);
        setResetError(false);
        reset();
      } else {
        setResetError(true);
        setResetErrorMsg(userDetails?.message ?? STATUS_MESSAGE.UNKNOWN);
      }
    } catch (error: any) {
      setResetError(true);
      setResetErrorMsg(error?.message ?? STATUS_MESSAGE.UNKNOWN);
    }
  };

  return (
    <ScrollViewCenterView>
      <View style={styles.container}>
        <Image
          style={ImgStyles.imgContain}
          source={Images.app_aegis_logo_icon}
        />
        <Text variant="titleLarge" style={styles.subtitle}>
          {`Hi, ${authDetails?.user?.firstName} ${authDetails?.user?.lastName}`}
        </Text>
        <Text variant="titleMedium" style={styles.title}>
          Reset your account password
        </Text>
        {resetError && (
          <Card mode="contained">
            <Card.Content>
              <Text
                variant="bodyMedium"
                style={{color: darkColor.colors.error}}>
                {resetErrorMsg}
              </Text>
            </Card.Content>
          </Card>
        )}
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
          loading={isLoading}
          disabled={isLoading}
          mode="contained"
          uppercase
          labelStyle={FontsStyle.fontBold}
          style={ItemSpaceFive.spaceTopMargin}
          onPress={handleSubmit(onSubmit)}>
          Reset Password
        </Button>
      </View>

      <View style={styles.accountLog}>
        <Button
          mode="text"
          compact
          onPress={() => navigation.navigate('SignIn')}>
          Go to Sign in
        </Button>
      </View>
    </ScrollViewCenterView>
  );
};

export default ResetPassword;
