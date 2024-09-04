import React, {useRef, useState} from 'react';
import {TextInput, View, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useForm} from 'react-hook-form';
import {yupResolver} from '@hookform/resolvers/yup';
import {ScreensNavigationProps} from '../../@types/navigation';
import {InputField} from '../../components/InputField/InputField';
import {Button} from '../../components/Button';
import {
  FormDataChangePassword,
  FormDataChangePasswordValue,
} from '../../entities/Form/accountForm';
import {changePasswordSchema} from '../../schemas/schema';
import {useResetPasswordMutation} from '../../services/apiServices';
import {setAuthDetails} from '../../redux/authDetails';
import {ScrollViewCenterView} from '../../components/ScrollViewCenterView';
import {
  Images,
  ImgStyles,
  FontsStyle,
  ItemSpaceFive,
  ItemSpaceFifteen,
  darkColor,
} from '../../themes';
import {styles} from './styles';
import {Card, Text} from 'react-native-paper';
import {STATUS_HTTP_CODE} from '../../constants/enumValues';
import {setSecureValue} from '../../utils/keyChain';
import {useAppDispatch, useAppSelector} from '../../hooks/reduxHooks';
import {STATUS_MESSAGE, SECURE_KEY} from '../../constants/enumValues';

const ChangePassword = () => {
  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
  } = useForm<FormDataChangePassword>({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: FormDataChangePasswordValue,
  });
  const [resetPassword, {isLoading}] = useResetPasswordMutation();
  const dispatch = useAppDispatch();
  const authDetails = useAppSelector(state => state?.authDetails);
  const refPassword = useRef<TextInput>(null);
  const navigation = useNavigation<ScreensNavigationProps>();
  const [resetError, setResetError] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [resetErrorMsg, setResetErrorMsg] = useState<string>('');

  const onSubmit = async (formData: FormDataChangePassword) => {
    try {
      const formattedValue = {
        password: formData.confirmPassword,
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
        setShowSuccess(true);
        reset();
      } else {
        setResetError(true);
        setResetErrorMsg(userDetails?.message ?? STATUS_MESSAGE.UNKNOWN);
        setShowSuccess(false);
      }
    } catch (error: any) {
      setResetError(true);
      setResetErrorMsg(error?.message ?? STATUS_MESSAGE.UNKNOWN);
      setShowSuccess(false);
    }
  };

  return (
    <ScrollViewCenterView>
      <View style={styles.container}>
        {showSuccess && <Card mode="contained">
              <Card.Content>
                <Text
                  variant="bodyLarge"
                  style={{
                    color: darkColor.colors.secondary,
                    textAlign: 'center',
                  }}>
                  {`Successfully updated the password.`}
                </Text>
                <Button
                  labelStyle={FontsStyle.fontBold}
                  mode="text"
                  compact
                  onPress={() => navigation.navigate('Settings')}>
                  Back to Settings
                </Button>
              </Card.Content>
            </Card>}
        {!showSuccess && 
          <>
            <Image
              style={ImgStyles.imgContain}
              source={Images.app_aegis_logo_icon}
            />
            <Text variant="titleMedium" style={styles.title}>
              Change your account password
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
              label="New password"
              controllerProps={{
                name: 'newPassword',
                control,
              }}
              inputProps={{
                placeholder: 'Enter new password',
                secureTextEntry: true,
                onSubmitEditing: handleSubmit(onSubmit),
                returnKeyType: 'done',
              }}
              errorMessage={errors.newPassword?.message}
            />
            <InputField
              ref={refPassword}
              label="Confirm password"
              controllerProps={{
                name: 'confirmPassword',
                control,
              }}
              inputProps={{
                placeholder: 'Enter confirm password',
                secureTextEntry: true,
                onSubmitEditing: handleSubmit(onSubmit),
                returnKeyType: 'done',
              }}
              errorMessage={errors.confirmPassword?.message}
            />
            <Button
              loading={isLoading}
              disabled={isLoading}
              mode="contained"
              uppercase
              labelStyle={FontsStyle.fontBold}
              style={ItemSpaceFive.spaceTopMargin}
              onPress={handleSubmit(onSubmit)}>
              Save
            </Button>
            <Button
              disabled={isLoading}
              mode="outlined"
              uppercase
              labelStyle={FontsStyle.fontBold}
              style={ItemSpaceFifteen.marginTopVal}
              onPress={()=> navigation.navigate('Settings')}>
              Cancel
            </Button>
          </>}
      </View>
    </ScrollViewCenterView>
  );
};

export default ChangePassword;
