import { z } from "zod"

import {
  createCredentialSchema,
  refinePersonalEmail,
  userProfileFields,
} from "@/features/users/schemas/user-form.schema"

// Wire contract for POST /api/users — same profile fields as userFormSchema.
export const createUserSchema = z
  .object({
    ...userProfileFields,
    credential: createCredentialSchema.optional(),
  })
  .superRefine(refinePersonalEmail)

export type CreateUserSchema = z.input<typeof createUserSchema>
