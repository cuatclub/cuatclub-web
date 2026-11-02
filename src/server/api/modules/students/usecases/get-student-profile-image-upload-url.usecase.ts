import { randomUUID } from "crypto";
import { studentProfileImagePrefix } from "@/server/api/modules/students/entities/student.entity";
import {
  GetStudentProfileImageUploadUrlOutputDTOSchema,
  type GetStudentProfileImageUploadUrlInputDTO,
  type GetStudentProfileImageUploadUrlOutputDTO,
} from "@/server/api/modules/students/dto";
import { getExtension, getPublicUrl, getSignedUploadUrl } from "@/server/services/r2";

export const getStudentProfileImageUploadUrl = async (
  userId: string,
  input: GetStudentProfileImageUploadUrlInputDTO
): Promise<GetStudentProfileImageUploadUrlOutputDTO> => {
  const key = `${studentProfileImagePrefix(userId)}${randomUUID()}.${getExtension(input.contentType)}`;
  const url = await getSignedUploadUrl(key, input.contentType, undefined, input.contentLength);

  return GetStudentProfileImageUploadUrlOutputDTOSchema.parse({
    key,
    url,
    publicUrl: getPublicUrl(key),
  });
};
