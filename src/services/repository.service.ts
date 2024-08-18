import { deleteObject, listAll, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
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

  console.log(sanitizedUserId);

  const repoRef = ref(storage, `users/${sanitizedUserId}/repositories`);

  try {
    const repoList = await listAll(repoRef);
    const imageUrls: string[] = [];

    // Iterar sobre los prefijos
    for (const prefix of repoList.prefixes) {
      const prefixList = await listAll(prefix);
      for (const item of prefixList.items) {
        const url = await getDownloadURL(item);
        imageUrls.push(url);
      }
    }

    // Iterar sobre los items
    for (const item of repoList.items) {
      const url = await getDownloadURL(item);
      imageUrls.push(url);
    }

    return {
      success: true,
      message: "Repositories and images retrieved successfully.",
      data: imageUrls,
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
