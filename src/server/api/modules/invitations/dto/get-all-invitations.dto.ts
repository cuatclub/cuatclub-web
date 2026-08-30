import { z } from "zod";

export const InvitationStatusSchema = z.enum(["PENDING", "USED", "EXPIRED"]);

export type InvitationStatus = z.infer<typeof InvitationStatusSchema>;

export const GetAllInvitationsInputDTOSchema = z.object({
  search: z.string().trim().optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
});

export type GetAllInvitationsInputDTO = z.infer<typeof GetAllInvitationsInputDTOSchema>;

export const InvitationListItemDTOSchema = z.object({
  id: z.string(),
  email: z.string(),
  inviteCode: z.string(),
  status: InvitationStatusSchema,
  expiredAt: z.date(),
  createdAt: z.date(),
  usedAt: z.date().nullable(),
  redeemedByClub: z.object({ id: z.string(), name: z.string() }).nullable(),
});

export type InvitationListItemDTO = z.infer<typeof InvitationListItemDTOSchema>;

export const GetAllInvitationsOutputDTOSchema = z.object({
  invitations: z.array(InvitationListItemDTOSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export type GetAllInvitationsOutputDTO = z.infer<typeof GetAllInvitationsOutputDTOSchema>;
