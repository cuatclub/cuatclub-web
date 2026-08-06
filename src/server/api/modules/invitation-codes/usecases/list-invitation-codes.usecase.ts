import { eq } from "drizzle-orm";
import { invitationCodesRepository } from "@/server/api/modules/invitation-codes/invitation-codes.repository";
import { invitationCodes } from "@/server/db/schema/invitation-codes";
import type { InvitationCode, ListInvitationCodesRequest } from "@/server/api/modules/invitation-codes/dto";

export const listInvitationCodes = async (req: ListInvitationCodesRequest): Promise<InvitationCode[]> => {
	const filter = req.email ? eq(invitationCodes.email, req.email) : undefined;
	const [codes, error] = await invitationCodesRepository.findMany(filter);
	if (error) throw error;

	return codes;
};
