import { deleteObject, getDownloadURL, listAll, ref, uploadBytesResumable } from "firebase/storage";
import { Repository } from "../interfaces/repository.interface";
import { apiResponse } from "../interfaces/apiResponse.interface";
import { storage } from "../firebase";

// export const listRepositories = async (userId: string): Promise<apiResponse> => {
//     const userFolderRef = ref(storage, `users/${userId}/repositories/`);
//     try {
//         const repositoriesSnapshot = await listAll(userFolderRef);
//         const repositories = await Promise.all(repositoriesSnapshot.prefixes.map(async (repoRef) => {
//             const repoName = repoRef.name;
//             const filesSnapshot = await listAll(repoRef);
//             const files = await Promise.all(filesSnapshot.items.map(async (fileRef) => {
//                 const url = await getDownloadURL(fileRef);
//                 return {
//                     name: fileRef.name,
//                     url,
//                 };
//             }));
//             return {
//                 name: repoName,
//                 files,
//             };
//         }));
//         return {
//             success: true,
//             message: "Repositories retrieved successfully.",
//             data: repositories,
//         };
//     } catch (error) {
//         console.error("Error listing repositories:", error);
//         return {
//             success: false,
//             message: "Error listing repositories.",
//         };
//     }
// };

export const postRepository = async (data: Repository, files: Express.Multer.File[]): Promise<apiResponse> => {
    const { name, userId } = data;

    // Verificar si el repositorio con el mismo nombre ya existe
    const userFolderRef = ref(storage, `users/${userId}/repositories`);
    const { prefixes } = await listAll(userFolderRef);

    const repositoryExists = prefixes.some(prefix => prefix.name === name);

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

    const uploadPromises = files.map(file => {
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
            }
        }
    };
};

export const putRepository = async (data: Repository, files: Express.Multer.File[]): Promise<apiResponse> => {
    const { name, userId } = data;

    // Verificar si el repositorio si exista
    const userFolderRef = ref(storage, `users/${userId}/repositories`);
    const { prefixes } = await listAll(userFolderRef);

    const repositoryExists = prefixes.some(prefix => prefix.name === name);

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

    const uploadPromises = files.map(file => {
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
            }
        }
    };
};

export const deleteRepository = async (data: Repository): Promise<apiResponse> => {
    const { name, userId } = data;

    // Verificar si el repositorio si exista
    const userFolderRef = ref(storage, `users/${userId}/repositories`);
    const { prefixes } = await listAll(userFolderRef);

    const repositoryExists = prefixes.some(prefix => prefix.name === name);

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
    const deleteFilePromises = listResult.items.map(item => deleteObject(item));
    await Promise.all(deleteFilePromises);

    return {
        success: true,
        message: "Repository deleted successfully.",
    };

}
