import { createTRPCRouter, adminProcedure, publicProcedure } from "@/server/api/trpc";
import { issueInvitationCode } from "@/server/api/modules/invitation-codes/usecases/issue-invitation-code.usecase";
import { listInvitationCodes } from "@/server/api/modules/invitation-codes/usecases/list-invitation-codes.usecase";
import { validateInvitationCode } from "@/server/api/modules/invitation-codes/usecases/validate-invitation-code.usecase";
import { IssueInvitationCodeRequestSchema } from "@/server/api/modules/invitation-codes/dto/issue-invitation-code.dto";
import { ListInvitationCodesRequestSchema } from "@/server/api/modules/invitation-codes/dto/list-invitation-codes.dto";
import { ValidateInvitationCodeRequestSchema } from "@/server/api/modules/invitation-codes/dto/validate-invitation-code.dto";
import { getTRPCError } from "@/server/error";
import { TRPCError } from "@trpc/server";

export const invitationCodesRouter = createTRPCRouter({
	issue: adminProcedure.input(IssueInvitationCodeRequestSchema).mutation(async ({ input }) => {
		const [res, error] = await issueInvitationCode(input);
		if (error) throw new TRPCError(getTRPCError(error));
		return res;
	}),

	list: adminProcedure.input(ListInvitationCodesRequestSchema).query(async ({ input }) => {
		const [res, error] = await listInvitationCodes(input);
		if (error) throw new TRPCError(getTRPCError(error));
		return res;
	}),

	validate: publicProcedure.input(ValidateInvitationCodeRequestSchema).query(async ({ input }) => {
		const [res, error] = await validateInvitationCode(input);
		if (error) throw new TRPCError(getTRPCError(error));
		return res;
	}),
});
