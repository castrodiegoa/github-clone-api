import {
    postRepositoryController,
    getRepositoriesController,
    putRepositoryController,
    deleteRepositoryController
} from "../controllers/repository.controller";
import { Router } from "express";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.get("/:userId", getRepositoriesController);

router.post("/", upload.array("files"), postRepositoryController);

router.put("/", upload.array("files"), putRepositoryController);

router.delete("/", deleteRepositoryController);

export default router;
