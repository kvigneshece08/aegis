import React, {useState} from 'react';
import {StyleSheet, View, Modal, TouchableOpacity} from 'react-native';
import {Text, Card} from 'react-native-paper';
import {Button} from '../../components/Button';
import {useAppDispatch, useAppSelector} from '../../hooks/reduxHooks';
import {ItemSpaceTen, theme, FontsStyle, darkColor} from '../../themes';
import {removeSecureValue} from '../../utils/keyChain';
import {SECURE_KEY} from '../../constants/enumValues';
import {removeAuthDetails} from '../../redux/authDetails';
import {fonts} from '../../themes';
import {useAppTheme} from '../../hooks/useAppTheme';
import {useNavigation} from '@react-navigation/native';
import {ScreensNavigationProps} from '../../@types/navigation';
import {useDeactivateAccountMutation} from '../../services/apiServices';
import {useEffect} from 'react';
import {ConfirmationDialog} from '../../components/PromiseDialog';

const Settings = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<ScreensNavigationProps>();

  const theme = useAppTheme();
  const [deactivateAccount, {isLoading, isError, isSuccess}] =
    useDeactivateAccountMutation();
  const authDetails = useAppSelector(state => state?.authDetails);

  const logoutAction = () => {
    removeSecureValue(SECURE_KEY.ACCESS_TOKEN);
    dispatch(removeAuthDetails());
  };

  const handleResetpassword = () => {
    setTimeout(()=> {
      navigation.navigate('ChangePassword');
    });
  }

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        setModalVisible(false);
        setSuccessModalVisible(true);
      });
    }
  }, [isSuccess]);

  const deactivateAccountAction = async () => {
    try {
      await deactivateAccount({userId: authDetails?.user?.id});
    } catch (error) {
      console.log('Error in deactivating account', error);
    }
  };

  const handleDeactivateModal = () => {
    setModalVisible(true);
  };

  const handleClose = () => {
    setTimeout(()=> {
      setSuccessModalVisible(false);
      navigation.navigate('AccountEnroll');
    });
    removeSecureValue(SECURE_KEY.ACCESS_TOKEN);
    dispatch(removeAuthDetails());
  }

  const [modalVisible, setModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      { successModalVisible ? <Card mode="contained">
        <Card.Content>
          <Text
            variant="bodyLarge"
            style={{
              color: darkColor.colors.secondary,
              textAlign: 'center',
            }}>
            {`Successfully deleted the account.`}
          </Text>
          <Button
            labelStyle={[
              FontsStyle.fontBold,
              {fontSize: fonts.size.regular, marginTop: 10},
            ]}
            mode="text"
            compact
            onPress={() => handleClose()}>
            Close
          </Button>
        </Card.Content>
      </Card> : (<><Button
        mode="elevated"
        style={styles.buttonStyle}
        labelStyle={{fontSize: fonts.size.regular}}
        onPress={() => logoutAction()}>
        Logout
      </Button>
      <Button
        mode="elevated"
        style={styles.buttonStyle}
        labelStyle={{fontSize: fonts.size.regular}}
        onPress={() => handleResetpassword()}>
        Reset Password
      </Button>
      <Button
        mode="elevated"
        style={styles.buttonStyle}
        labelStyle={{fontSize: fonts.size.regular}}
        onPress={() => handleDeactivateModal()}>
        Delete Account
      </Button>
      <ConfirmationDialog
        isVisible={modalVisible}
        title="Are you sure you want to delete?"
        description="Your account will be deleted on selecting 'Confirm'"
        onConfirm={deactivateAccountAction}
        onClose={() => setModalVisible(!modalVisible)}
        cancelButtonChildren={'Cancel'}
        confirmButtionChildren={'Confirm'}
      /></>)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonStyle: {
    marginVertical: ItemSpaceTen.spaceTenVerticalMargin.marginVertical,
  },
  infoText: {
    margin: 10,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emailText: {
    color: theme.colors.primary,
  },
  modalView: {
    margin: 20,
    marginTop: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    color: 'black'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginHorizontal: 10,
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Settings;
