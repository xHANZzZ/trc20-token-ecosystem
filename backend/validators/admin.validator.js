import { z } from 'zod';

export const setComplianceSchema = z.object({
  body: z.object({
    required: z.boolean({
      required_error: 'required flag is mandatory',
      invalid_type_error: 'required must be a boolean'
    })
  })
});
