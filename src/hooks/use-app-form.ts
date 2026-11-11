import { createFormHook } from "@tanstack/react-form"

import {
  DateField,
  DateTimeField,
  NumberField,
  PasswordField,
  RadioPillField,
  SelectField,
  SwitchField,
  TextareaField,
  TextField,
} from "@/components/shared/composites/AppFormFields"
import { fieldContext, formContext } from "@/hooks/use-app-form-context"

export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    NumberField,
    TextareaField,
    DateField,
    DateTimeField,
    PasswordField,
    RadioPillField,
    SelectField,
    SwitchField,
  },
  formComponents: {},
})
