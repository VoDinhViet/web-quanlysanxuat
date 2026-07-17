import { z } from "zod"

import {
  refinePersonalEmail,
  updateCredentialSchema,
  userProfileFields,
} from "@/features/users/schemas/create-user.schema"

// Wire contract for PUT /api/users/:userId — same profile fields as create;
// userProfileFields' field-level transforms already leave every value
// wire-ready, so no object-level mapping step is needed. `credential`
// provisions a new ERP account when the employee doesn't have one yet, or
// updates the existing one otherwise (see EditUserForm) — its own transform
// (chained here, not on the shared updateCredentialSchema export) leaves a
// blank password as undefined so an edit can omit it to keep it unchanged.
// Password is passed through untrimmed — unlike other optional fields,
// trimming could silently alter a password the user intentionally typed with
// leading/trailing spaces.
export const updateUserSchema = z
  .object({
    userId: z.uuid(),
    ...userProfileFields,
    credential: updateCredentialSchema
      .transform((credential) => ({
        ...credential,
        password:
          credential.password.length > 0 ? credential.password : undefined,
      }))
      .optional(),
  })
  .superRefine(refinePersonalEmail)

export type UpdateUserSchema = z.input<typeof updateUserSchema>

// Client-side validator for EditUserForm when the employee already has an
// ERP account — its password may be left blank. Uses the untransformed
// updateCredentialSchema (not updateUserSchema's own credential above) so its
// type structurally matches createUserSchema's, letting EditUserForm pick
// between the two for onSubmit validation. This only runs for pre-submit UX
// validation — the actual payload comes from updateUserSchema.
export const editUserWithCredentialSchema = z
  .object({
    ...userProfileFields,
    credential: updateCredentialSchema.optional(),
  })
  .superRefine(refinePersonalEmail)
