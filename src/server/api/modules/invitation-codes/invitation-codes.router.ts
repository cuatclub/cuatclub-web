import { createTRPCRouter, adminProcedure, publicProcedure } from "@/server/api/trpc";
import {
	issueInvitationCode,
	listInvitationCodes,
	validateInvitationCode,
} from "@/server/api/modules/invitation-codes/usecases";
import {
	IssueInvitationCodeRequestSchema,
	ListInvitationCodesRequestSchema,
	ValidateInvitationCodeRequestSchema,
} from "@/server/api/modules/invitation-codes/dto";
import { ok } from "@/server/response";

export const invitationCodesRouter = createTRPCRouter({
	issue: adminProcedure.input(IssueInvitationCodeRequestSchema).mutation(async ({ input }) => {
		const res = await issueInvitationCode(input);
		return ok(res);
	}),

	list: adminProcedure.input(ListInvitationCodesRequestSchema).query(async ({ input }) => {
		const res = await listInvitationCodes(input);
		return ok(res);
	}),

	validate: publicProcedure.input(ValidateInvitationCodeRequestSchema).query(async ({ input }) => {
		const res = await validateInvitationCode(input);
		return ok(res);
	}),
});
