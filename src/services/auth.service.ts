import { User } from "../models/user.model"; // Hacer archivo de barril
import { apiResponse } from "../models/apiResponse";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";


const registerService = async (data: User): Promise<apiResponse> => {
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

const loginService = async (data: User) => {
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

export { registerService, loginService };
