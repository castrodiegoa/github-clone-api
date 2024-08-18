import { deleteObject, listAll, ref, uploadBytesResumable, getDownloadURL, StorageReference } from "firebase/storage";
import { Repository } from "../interfaces/repository.interface";
import { apiResponse } from "../interfaces/apiResponse.interface";
import { storage } from "../firebase";

export const getRepositories = async (userId: string): Promise<apiResponse> => {
  if (!userId) {
    return {
      success: false,
      message: "No userId provided.",
    };
  }

  // Sanitizar el userId
  const sanitizedUserId = userId.replace(/[^a-zA-Z0-9_-]/g, "");

  const repoRef = ref(storage, `users/${sanitizedUserId}/repositories`);

  // Función para obtener la URL ejecutable
  const getExecutableUrl = async (item: StorageReference) => {
    try {
      const url = await getDownloadURL(item);
      return url;
    } catch (error) {
      console.error(`Error getting URL for ${item.fullPath}:`, error);
      return null;
    }
  };

  // Función para obtener la estructura de carpetas y archivos
  const getFolderStructure = async (folderRef: StorageReference) => {
    const folderData: any = { files: [], folders: [] };

    try {
      // Listar subcarpetas y archivos
      const listResult = await listAll(folderRef);

      // Procesar subcarpetas
      for (const prefix of listResult.prefixes) {
        const folder = await getFolderStructure(prefix);
        folderData.folders.push({
          name: prefix.name,
          ...folder,
        });
      }

      // Procesar archivos
      for (const item of listResult.items) {
        const url = await getExecutableUrl(item);
        if (url) {
          folderData.files.push({
            name: item.name,
            url,
          });
        }
      }

    } catch (error) {
      console.error(`Error listing items in ${folderRef.fullPath}:`, error);
    }

    return folderData;
  };

  try {
    const repoData = await getFolderStructure(repoRef);

    return {
      success: true,
      message: "Repositories and files retrieved successfully.",
      data: repoData,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Error retrieving repositories: ${error.message}`,
    };
  }
};

export const postRepository = async (data: Repository, files: Express.Multer.File[]): Promise<apiResponse> => {
  const { name, userId } = data;

  // Verificar si el repositorio con el mismo nombre ya existe
  const userFolderRef = ref(storage, `users/${userId}/repositories`);
  const { prefixes } = await listAll(userFolderRef);

  const repositoryExists = prefixes.some((prefix) => prefix.name === name);

  if (repositoryExists) {
    return {
      success: false,
      message: "Repository with this name already exists.",
    };
  }

  // Verificar si el cliente envió archivos
  if (!files || files.length === 0) {
    return {
      success: false,
      message: "No files provided.",
    };
  }

  // Verificar si el cliente envió un userId
  if (!userId) {
    return {
      success: false,
      message: "No userId provided.",
    };
  }

  const uploadPromises = files.map((file) => {
    const fileRef = ref(storage, `users/${userId}/repositories/${name}/${file.originalname}`);
    return uploadBytesResumable(fileRef, file.buffer);
  });

  await Promise.all(uploadPromises);

  return {
    success: true,
    message: "Repository registered successfully.",
    data: {
      name: name,
      user: {
        id: userId,
      },
    },
  };
};

export const putRepository = async (data: Repository, files: Express.Multer.File[]): Promise<apiResponse> => {
  const { name, userId } = data;

  // Verificar si el repositorio si exista
  const userFolderRef = ref(storage, `users/${userId}/repositories`);
  const { prefixes } = await listAll(userFolderRef);

  const repositoryExists = prefixes.some((prefix) => prefix.name === name);

  if (!repositoryExists) {
    return {
      success: false,
      message: "Repository with this name no exists.",
    };
  }

  // Verificar si el cliente envió archivos para actualizar
  if (!files || files.length === 0) {
    return {
      success: false,
      message: "No files provided.",
    };
  }

  // Verificar si el cliente envió un userId
  if (!userId) {
    return {
      success: false,
      message: "No userId provided.",
    };
  }

  const uploadPromises = files.map((file) => {
    const fileRef = ref(storage, `users/${userId}/repositories/${name}/${file.originalname}`);
    return uploadBytesResumable(fileRef, file.buffer);
  });

  await Promise.all(uploadPromises);

  return {
    success: true,
    message: "Repository updated successfully.",
    data: {
      name: name,
      user: {
        id: userId,
      },
    },
  };
};

export const deleteRepository = async (data: Repository): Promise<apiResponse> => {
  const { name, userId } = data;

  // Verificar si el repositorio si exista
  const userFolderRef = ref(storage, `users/${userId}/repositories`);
  const { prefixes } = await listAll(userFolderRef);

  const repositoryExists = prefixes.some((prefix) => prefix.name === name);

  if (!repositoryExists) {
    return {
      success: false,
      message: "Repository with this name no exists.",
    };
  }

  // Verificar si el cliente envió un userId
  if (!userId) {
    return {
      success: false,
      message: "No userId provided.",
    };
  }

  // Referencia al repositorio
  const repoRef = ref(storage, `users/${userId}/repositories/${name}`);

  // Listar todos los archivos y carpetas dentro del repositorio
  const listResult = await listAll(repoRef);

  // Eliminar todos los archivos
  const deleteFilePromises = listResult.items.map((item) => deleteObject(item));
  await Promise.all(deleteFilePromises);

  return {
    success: true,
    message: "Repository deleted successfully.",
  };
};
