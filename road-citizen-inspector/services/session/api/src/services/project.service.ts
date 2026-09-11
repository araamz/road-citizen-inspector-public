import {
  NewProject,
  Project,
  ProjectModel,
  Session,
} from "@road-citizen-inspector/models/session";
import Service, { ServiceError } from "./service.js";
import SessionService from "./session.service.js";

export default class ProjectService extends Service {
  private projectModel: ProjectModel;
  private sessionService: SessionService;

  constructor(projectModel: ProjectModel, sessionService: SessionService) {
    super();
    this.projectModel = projectModel;
    this.sessionService = sessionService;
  }

  private ProjectCreationError(
    message: string,
    details: Pick<NewProject, "session_id" | "tts_app_id">,
  ) {
    return new ServiceError(message, "session_creation_failure", details);
  }

  private ProjectNotFoundError(
    message: string,
    details: Partial<Pick<Project, "project_id" | "session_id">>,
  ) {
    return new ServiceError(message, "project_not_found", details);
  }

  async createProject(sessionId: number, ttsAppId: string) {
    return this.sessionService
      .getSession(sessionId)
      .then((session: Session) =>
        this.projectModel.createProject({
          session_id: session.session_id,
          tts_app_id: ttsAppId,
        }),
      )
      .then((createdProject) => {
        if (!createdProject)
          throw this.ProjectCreationError(
            "An error occured creating a project. Failed to create project.",
            {
              session_id: sessionId,
              tts_app_id: ttsAppId,
            },
          );

        return createdProject;
      });
  }

  async getProject(projectId: number) {
    return this.projectModel
      .getProjectByProjectId(projectId)
      .then((project) => {
        if (!project)
          throw this.ProjectNotFoundError(
            "Project is not found. Getting project has failed.",
            {
              project_id: projectId,
            },
          );

        return project;
      });
  }

  async getProjectBySessionId(sessionId: number) {
    return this.projectModel.getProjectBySessionId(sessionId).then((project) => {
      if (!project) {
        throw this.ProjectNotFoundError(
          "Project is not found. Getting project has failed.",
          {
            session_id: sessionId
          }
        )
      }
      return project;
    })
  }
}
