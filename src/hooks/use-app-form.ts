import { createFormHook } from "@tanstack/react-form"

import {
  DateField,
  NumberField,
  PasswordField,
  RadioPillField,
  SelectField,
  SwitchField,
  TextareaField,
  TextField,
} from "@/components/shared/inputs/AppFormFields"
import { fieldContext, formContext } from "@/hooks/use-app-form-context"

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    NumberField,
    TextareaField,
    DateField,
    PasswordField,
    RadioPillField,
    SelectField,
    SwitchField,
  },
  formComponents: {},
})
