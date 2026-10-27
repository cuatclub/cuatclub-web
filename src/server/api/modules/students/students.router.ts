import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import {
  getStudentRegistration,
  registerStudent,
  saveStudentGeneralInfo,
  saveStudentPreferences,
  saveStudentReferralSource,
} from "@/server/api/modules/students/usecases";
import {
  GetStudentRegistrationInputDTOSchema,
  GetStudentRegistrationOutputDTOSchema,
  RegisterStudentInputDTOSchema,
  RegisterStudentOutputDTOSchema,
  SaveStudentGeneralInfoInputDTOSchema,
  SaveStudentGeneralInfoOutputDTOSchema,
  SaveStudentPreferencesInputDTOSchema,
  SaveStudentPreferencesOutputDTOSchema,
  SaveStudentReferralSourceInputDTOSchema,
  SaveStudentReferralSourceOutputDTOSchema,
} from "@/server/api/modules/students/dto";

export const studentsRouter = createTRPCRouter({
  register: publicProcedure
    .input(RegisterStudentInputDTOSchema)
    .output(RegisterStudentOutputDTOSchema)
    .mutation(async ({ input }) => registerStudent(input)),

  getRegistration: protectedProcedure
    .input(GetStudentRegistrationInputDTOSchema)
    .output(GetStudentRegistrationOutputDTOSchema)
    .query(async ({ ctx }) => getStudentRegistration(ctx.session.user.id)),

  saveGeneralInfo: protectedProcedure
    .input(SaveStudentGeneralInfoInputDTOSchema)
    .output(SaveStudentGeneralInfoOutputDTOSchema)
    .mutation(async ({ ctx, input }) => saveStudentGeneralInfo(ctx.session.user.id, input)),

  savePreferences: protectedProcedure
    .input(SaveStudentPreferencesInputDTOSchema)
    .output(SaveStudentPreferencesOutputDTOSchema)
    .mutation(async ({ ctx, input }) => saveStudentPreferences(ctx.session.user.id, input)),

  saveReferralSource: protectedProcedure
    .input(SaveStudentReferralSourceInputDTOSchema)
    .output(SaveStudentReferralSourceOutputDTOSchema)
    .mutation(async ({ ctx, input }) => saveStudentReferralSource(ctx.session.user.id, input)),
});
