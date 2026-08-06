import { createTRPCRouter, adminProcedure, publicProcedure } from "@/server/api/trpc";
import { issueInvitationCode } from "@/server/api/modules/invitationCodes/usecases/issueInvitationCode.usecase";
import { listInvitationCodes } from "@/server/api/modules/invitationCodes/usecases/listInvitationCodes.usecase";
import { validateInvitationCode } from "@/server/api/modules/invitationCodes/usecases/validateInvitationCode.usecase";
import { IssueInvitationCodeRequestSchema } from "@/server/api/modules/invitationCodes/dto/issueInvitationCode.dto";
import { ListInvitationCodesRequestSchema } from "@/server/api/modules/invitationCodes/dto/listInvitationCodes.dto";
import { ValidateInvitationCodeRequestSchema } from "@/server/api/modules/invitationCodes/dto/validateInvitationCode.dto";
import { getTRPCError } from "@/utils/error";
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
