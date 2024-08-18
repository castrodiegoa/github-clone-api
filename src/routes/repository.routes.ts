import { Router } from "express";
import { postRepositoryController, getRepositoriesController, putRepositoryController, deleteRepositoryController } from "../controllers/repository.controller";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = Router();

router.get("/repository/:userId", getRepositoriesController);

router.post("/repository", upload.array("files"), postRepositoryController);

router.put("/repository", upload.array("files"), putRepositoryController);

router.delete("/repository", deleteRepositoryController);

export default router;
