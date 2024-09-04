import * as Keychain from 'react-native-keychain';

export const setSecureValue = async (key: any, value: any) =>
  await Keychain.setGenericPassword(key, value, {service: key});

export const getSecureValue = async (key: any) => {
  const result = await Keychain.getGenericPassword({service: key});
  if (result) {
    return result.password;
  }
  return false;
};

export const removeSecureValue = async (key: any) =>
  await Keychain.resetGenericPassword({service: key});
