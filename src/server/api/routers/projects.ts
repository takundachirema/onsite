/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { createTRPCRouter, publicProcedure } from "$/src/server/api/trpc";
import {
  projectSchema,
  projectUpdateSchema,
  projectGetSchema,
  idSchema,
} from "$/src/server/api/schemas/projects";
import { type Response } from "$/src/utils/types";

export const projectsRouter = createTRPCRouter({
  //get all projects
  get: publicProcedure.input(projectGetSchema).query(async ({ ctx }) => {
    const response: Response = {
      success: true,
      message: "projects obtained",
      data: {},
    };

    const projects = await ctx.db.project.findMany();
    return { ...response, ...{ data: projects } };
  }),

  //get project by id
  getOne: publicProcedure.input(idSchema).query(({ input, ctx }) => {
    return ctx.db.project.findUnique({
      where: idSchema.parse(input),
    });
  }),

  //create project
  createProject: publicProcedure
    .input(projectSchema)
    .mutation(({ input, ctx }) => {
      const response: Response = {
        success: true,
        message: "project created",
        data: {},
      };

      const projectData = {
        name: input.name,
        organizationId: ctx.session?.organizationId!,
        dueDate: input.dueDate,
      };

      const project = ctx.db.project.create({
        data: projectData,
      });

      return { ...response, ...{ data: project } };
    }),

  //update project
  updateProject: publicProcedure
    .input(projectUpdateSchema)
    .mutation(({ input, ctx }) => {
      const response: Response = {
        success: true,
        message: "project updated",
        data: {},
      };

      const project = ctx.db.project.update({
        where: {
          id: input.id.toString(),
        },
        data: projectUpdateSchema.parse(input) as object,
      });

      return { ...response, ...{ data: project } };
    }),

  //delete project
  deleteProject: publicProcedure.input(idSchema).mutation(({ input, ctx }) => {
    const response: Response = {
      success: true,
      message: "project updated",
      data: {},
    };

    const result = ctx.db.project.delete({
      where: idSchema.parse(input),
    });

    return { ...response, ...{ data: result } };
  }),
});
