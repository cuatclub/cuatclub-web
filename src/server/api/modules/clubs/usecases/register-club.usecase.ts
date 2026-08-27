import { createTransactionAuth } from "@/server/auth";
import { unitOfWork } from "@/server/db/unit-of-work";
import { clubsRepository } from "@/server/api/modules/clubs/clubs.repository";
import { usersRepository } from "@/server/api/modules/users/users.repository";
import { invitationCodesRepository } from "@/server/api/modules/invitations/invitation-codes.repository";
import {
  RegisterClubOutputDTOSchema,
  type RegisterClubInputDTO,
  type RegisterClubOutputDTO,
} from "@/server/api/modules/clubs/dto/register-club.dto";
import { conflict, notFound, validationError } from "@/server/errors";

export const registerClub = async (input: RegisterClubInputDTO): Promise<RegisterClubOutputDTO> => {
  // Checked before the invite code: a resubmitted form would otherwise fail the (now-consumed)
  // code check and report a mismatch instead of "email already registered".
  const existingUser = await usersRepository.getByEmail(input.email);
  if (existingUser) {
    throw conflict("This email is already registered.");
  }

  const invitation = await invitationCodesRepository.findByEmail(input.email);
  if (!invitation) {
    throw notFound("No invitation code found for this email.");
  }
  if (!invitation.validate(input.inviteCode)) {
    throw validationError("Invitation code does not match this email.");
  }

  const { clubId, userId } = await unitOfWork.run(async (client) => {
    // better-auth's signUpEmail requires a non-empty `name`; the real one is set
    // later in saveClubProfileRegistration, so the email is just a placeholder here.
    const { user } = await createTransactionAuth(client).api.signUpEmail({
      body: {
        email: input.email,
        password: input.password,
        name: input.email,
      },
    });

    // `role` is declared `input: false` in auth.ts, so sign-up can't set it directly.
    // Reset the placeholder `name` back to empty here too, now that sign-up is past
    // better-auth's own non-empty check.
    await usersRepository.updateById(user.id, { role: "CLUB", name: "" }, client);
    const clubId = await clubsRepository.create(
      { userId: user.id, registrationStatus: "PENDING" },
      client
    );
    await invitationCodesRepository.markUsed(invitation.id, client);

    return { clubId, userId: user.id };
  });

  return RegisterClubOutputDTOSchema.parse({
    id: clubId,
    userId,
    email: input.email,
    registrationStatus: "PENDING",
  });
};
