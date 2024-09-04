import type {DefaultValues} from 'react-hook-form';
export type FormDataProjectSelect = {
  builderOpt: string;
  projectOpt: string;
  taskOpt: string;
};

export const FormDataProjectSelectValue: DefaultValues<FormDataProjectSelect> =
  {
    builderOpt: '',
    projectOpt: '',
    taskOpt: '',
  };
