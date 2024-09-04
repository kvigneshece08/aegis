import type {DefaultValues} from 'react-hook-form';
export type FormDataSingUp = {
  firstName: string;
  lastName: string;
  username: string;
  emailAddress: string;
  password: string;
};

export type FormDataSingIn = {
  username: string;
  password: string;
};

export const FormDataSingUpValue: DefaultValues<FormDataSingUp> = {
  firstName: '',
  lastName: '',
  username: '',
  emailAddress: '',
  password: '',
};

export const FormDataSingInValue: DefaultValues<FormDataSingIn> = {
  username: '',
  password: '',
};

export type FormDataForgotPassword = {
  emailAddress: string;
};

export const FormDataForgotPasswordValue: DefaultValues<FormDataForgotPassword> =
  {
    emailAddress: '',
  };

export type FormDataResetPassword = {
  id: number;
  password: string;
};

export type FormDataChangePassword = {
  newPassword: string;
  confirmPassword: string;
}

export const FormDataResetPasswordValue: DefaultValues<FormDataResetPassword> =
  {
    id: 0,
    password: '',
  };

export const FormDataChangePasswordValue: DefaultValues<FormDataChangePassword> =
  {
    newPassword: '',
    confirmPassword: '',
  };