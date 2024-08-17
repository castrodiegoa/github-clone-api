import { Request, Response } from "express";
import { registerService, loginService } from "../services/auth.service";

const registerController = async (req: Request, res: Response) => {
    try {
        const user = req.body;
        const response = await registerService(user);
        res.status(201).json(response);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error registering user.",
        });
    }
};

const loginController = async (req: Request, res: Response) => {
    try {
        const user = req.body;
        const response = await loginService(user);
        res.status(201).json(response);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error occurred.",
        });
    }
};

export { registerController, loginController };
