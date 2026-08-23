import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import {
  DeleteImagesOutputDTOSchema,
  type DeleteImagesInputDTO,
} from "@/server/api/modules/s3/dto/delete-image.dto";
import { client } from "@/server/services/r2";
import { usersRepository } from "@/server/api/modules/users/users.repository";

function getKeyFromUrl(fileUrl: string): string {
  try {
    const parsed = new URL(fileUrl);

    const key = parsed.pathname.replace(/^\//, "");

    return decodeURIComponent(key);
  } catch {
    return fileUrl;
  }
}

export const deleteImages = async (userId: string, input: DeleteImagesInputDTO) => {
  const user = await usersRepository.getById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const objectsToDelete = input.urls.map((url) => ({
    Key: getKeyFromUrl(url),
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
