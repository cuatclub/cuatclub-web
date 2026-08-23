import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import {
  DeleteImagesOutputDTOSchema,
  type DeleteImagesInputDTO,
} from "@/server/api/modules/s3/dto/delete-images.dto";
import { client } from "@/server/services/r2";
import { usersRepository } from "@/server/api/modules/users/users.repository";
import { validationError } from "@/server/errors";

function getKeyFromUrl(userId: string, fileUrl: string): string {
  const parsed = new URL(fileUrl);
  const key = parsed.pathname.replace(/^\//, "");
  const decodedKey = decodeURIComponent(key);
  const expectedPrefix = `uploads/${userId}/`;

  if (!decodedKey.startsWith(expectedPrefix)) {
    throw Error("Unauthorized or invalid file URL");
  }

  return decodedKey;
}

export const deleteImages = async (userId: string, input: DeleteImagesInputDTO) => {
  const user = await usersRepository.getById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const objectsToDelete = input.urls.map((url) => {
    try {
      const Key = getKeyFromUrl(userId, url);
      return { Key };
    } catch (error) {
      throw validationError("Invalid or unauthorized file URL");
    }
  });

  const command = new DeleteObjectsCommand({
    Bucket: process.env.R2_BUCKET, // Bucket name
    Delete: {
      Objects: objectsToDelete,
      Quiet: false, // false = return the deleted objects in the response, true = don't return them
    },
  });

  const response = await client.send(command);
  const deletedKeys = (response.Deleted ?? []).map((obj) => obj.Key!);
  const errorMessages = (response.Errors ?? []).map((err) => `${err.Key}: ${err.Message}`);

  return DeleteImagesOutputDTOSchema.parse({
    success: true,
    deleted: deletedKeys, // successfully deleted objects
    errors: errorMessages,
  });
};
