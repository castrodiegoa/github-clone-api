import { User } from "../interfaces/user.interface"; // Hacer archivo de barril
import { apiResponse } from "../interfaces/apiResponse.interface";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";


export const register = async (data: User): Promise<apiResponse> => {
    const { email, password } = data;

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser = userCredential.user;

    return {
        success: true,
        message: "User registered successfully.",
        data: {
            id: newUser.uid,
            email: newUser.email!,
        }
    };
};

export const login = async (data: User) => {
    const { email, password } = data;

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const loginUser = userCredential.user;

    return {
        success: true,
        message: "User logged in successfully.",
        data: {
            id: loginUser.uid,
            email: loginUser.email!,
        }
    };
};
