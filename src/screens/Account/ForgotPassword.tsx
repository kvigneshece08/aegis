import React, {useRef, useState} from 'react';
import {TextInput, View, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import {ScreensNavigationProps} from '../../@types/navigation';
import {InputField} from '../../components/InputField/InputField';
import {Button} from '../../components/Button';
import {FormDataForgotPassword} from '../../entities/Form/accountForm';
import {ScrollViewCenterView} from '../../components/ScrollViewCenterView';
import {Images, ImgStyles, FontsStyle, ItemSpaceTen} from '../../themes';
import {Text, Card} from 'react-native-paper';
import {styles} from './styles';
import {useForgotPasswordMutation} from '../../services/apiServices';
import {forgotPasswordSchema} from '../../schemas/schema';
import {STATUS_HTTP_CODE, STATUS_MESSAGE} from '../../constants/enumValues';
import {darkColor} from '../../themes';

const ForgotPassword = () => {
  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
  } = useForm<FormDataForgotPassword>({
    resolver: yupResolver(forgotPasswordSchema),
  });
  const [forgotPassword, {isLoading, isSuccess}] = useForgotPasswordMutation();
  const refEmail = useRef<TextInput>(null);
  const navigation = useNavigation<ScreensNavigationProps>();
  const [forgotError, setForgotError] = useState<boolean>(false);
  const [forgotErrorMsg, setForgotErrorMsg] = useState<string>('');

  const onSubmit = async (formData: FormDataForgotPassword) => {
    try {
      const userDetails = await forgotPassword(formData).unwrap();
      if (userDetails?.status === STATUS_HTTP_CODE.SUCCESS) {
        setForgotErrorMsg(userDetails?.message ?? STATUS_MESSAGE.SUCCESS);
        setForgotError(true);
        setTimeout(() => {
          setForgotError(false);
          reset();
          navigation.navigate('AccountEnroll');
        }, 5000);
      } else {
        setForgotError(true);
        setForgotErrorMsg(userDetails?.message ?? STATUS_MESSAGE.UNKNOWN);
      }
    } catch (error: any) {
      setForgotError(true);
      setForgotErrorMsg(
        `${
          error?.message ?? STATUS_MESSAGE.UNKNOWN
        }. Check Spam/Junk folder once`,
      );
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
          Forgot Password
        </Text>
        {forgotError && (
          <Card mode="contained">
            <Card.Content>
              <Text
                variant="bodyMedium"
                style={{color: darkColor.colors.error}}>
                {forgotErrorMsg}
              </Text>
            </Card.Content>
          </Card>
        )}
        <InputField
          ref={refEmail}
          label="Email Address"
          controllerProps={{name: 'emailAddress', control}}
          inputProps={{
            placeholder: 'Enter your email address',
            keyboardType: 'email-address',
            onSubmitEditing: () => handleSubmit(onSubmit),
            returnKeyType: 'done',
          }}
          errorMessage={errors.emailAddress?.message}
        />
        <Button
          loading={isLoading}
          disabled={isLoading || isSuccess}
          mode="contained"
          uppercase
          labelStyle={FontsStyle.fontBold}
          style={ItemSpaceTen.spaceTenTopMargin}
          onPress={handleSubmit(onSubmit)}>
          Send Reset Instructions
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

export default ForgotPassword;
