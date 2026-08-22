import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import {
  DeleteImagesOutputDTOSchema,
  type DeleteImagesInputDTO,
} from "@/server/api/modules/s3/dto/delete-image.dto";
import { client } from "@/server/services/r2";
import { usersRepository } from "@/server/api/modules/users/users.repository";

export const deleteImages = async (userId: string, input: DeleteImagesInputDTO) => {
  const user = await usersRepository.getById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const objectsToDelete = input.fileKeys.map((key) => ({
    Key: key,
  }));

  const command = new DeleteObjectsCommand({
    Bucket: process.env.R2_BUCKET, // Bucket name
    Delete: {
      Objects: objectsToDelete,
      Quiet: false, // false = return the deleted objects in the response, true = don't return them
    },
  });

  const response = await client.send(command);

  return DeleteImagesOutputDTOSchema.parse({
    success: true,
    deleted: response.Deleted ?? [], // successfully deleted objects
    errors: response.Errors ?? [],
  });
};
