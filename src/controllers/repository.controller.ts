import { Request, Response } from "express";
import { deleteRepository, getRepositories, postRepository, putRepository } from "../services/repository.service";

export const postRepositoryController = async (req: Request, res: Response) => {
  try {
    const repository = JSON.parse(req.body.data);
    const files = req.files as Express.Multer.File[];

    const response = await postRepository(repository, files);
    res.status(201).json(response);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error registering repository.",
    });
  }
};

export const getRepositoriesController = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const response = await getRepositories(userId);
    console.log(response);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error retrieving repositories.",
    });
  }
};

export const putRepositoryController = async (req: Request, res: Response) => {
  try {
    const repository = req.body;
    const files = req.files as Express.Multer.File[];

    const response = await putRepository(repository, files);
    res.status(201).json(response);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error updating repository.",
    });
  }
};

export const deleteRepositoryController = async (req: Request, res: Response) => {
  try {
    const repository = req.body;
    const response = await deleteRepository(repository);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting repository.",
    });
  }
};
function listRepositories(userId: string) {
  throw new Error("Function not implemented.");
}
