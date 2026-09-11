import { Hono } from "hono";
import ProjectService from "../services/project.service.js";
import { zValidator } from "@hono/zod-validator";
import { NEW_PROJECT_SCHEMA } from "@road-citizen-inspector/schemas/session";
import { Context } from "hono";
import { ServiceError } from "../services/service.js";
import {
  ContractError,
  ProjectContract,
} from "@road-citizen-inspector/contracts";

export default function useProjectController(projectService: ProjectService) {
  const projectController = new Hono();

  projectController.post(
    "/",
    zValidator("json", NEW_PROJECT_SCHEMA),
    async (ctx: Context) => {
      const { session_id, tts_app_id } = await ctx.req.json();

      const createdProject = await projectService.createProject(
        session_id,
        tts_app_id,
      );

      return ctx.json<ProjectContract>({
        success: true,
        message: "Project created successfully",
        data: createdProject,
      });
    },
  );

  projectController.get("/:projectId", async (ctx: Context) => {
    const projectId = Number(ctx.req.param("projectId"));

    const project = await projectService.getProject(projectId);

    return ctx.json<ProjectContract>({
      success: true,
      message: "Project retrieved successfully",
      data: project,
    });
  });

  projectController.get("/session/:sessionId", async (ctx: Context) => {
    const sessionId = Number(ctx.req.param("sessionId"))
    const project = await projectService.getProjectBySessionId(sessionId)

    return ctx.json<ProjectContract>({
      success: true,
      message: "Project retrieved successfully",
      data: project,
    })
  })

  projectController.onError((error, ctx) => {
    if (error instanceof ServiceError) {
      return ctx.json<ContractError>(
        {
          success: false,
          message: error.message,
          error: error.details,
        },
        500,
      );
    } else if (error instanceof Error) {
      return ctx.json<ContractError<unknown | null>>(
        {
          success: false,
          message: error.message || "Unknown error occurred.",
          error: error.cause || null,
        },
        500,
      );
    } else {
      return ctx.json<ContractError<unknown | null>>(
        {
          success: false,
          message: "An unexpected error occurred.",
          error: null,
        },
        500,
      );
    }
  });

  return projectController;
}
