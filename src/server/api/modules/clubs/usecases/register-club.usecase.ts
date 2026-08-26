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

// better-auth rejects an empty `name`; this is a stand-in until the profile step overwrites it.
const provisionalName = (email: string) => email.split("@")[0] ?? email;

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
    const { user } = await createTransactionAuth(client).api.signUpEmail({
      body: {
        email: input.email,
        password: input.password,
        name: provisionalName(input.email),
      },
    });

    // `role` is declared `input: false` in auth.ts, so sign-up can't set it directly.
    await usersRepository.updateById(user.id, { role: "CLUB" }, client);
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
