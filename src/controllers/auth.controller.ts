import { Request, Response } from "express";
import { register, login } from "../services/auth.service";

 export const registerController = async (req: Request, res: Response) => {
    try {
        const user = req.body;
        const response = await register(user);
        res.status(201).json(response);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error registering user.",
        });
    }
};

export const loginController = async (req: Request, res: Response) => {
    try {
        const user = req.body;
        const response = await login(user);
        res.status(200).json(response);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error occurred.",
        });
    }
};
