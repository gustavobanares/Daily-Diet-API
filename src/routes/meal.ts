import { FastifyInstance } from "fastify";
import { randomInt, randomUUID } from "node:crypto";
import { object, z } from "zod";
import { knex } from "../database";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";

export async function mealRoutes(app: FastifyInstance) {
  app.get(
    "/",
    {
      preHandler: checkSessionIdExists,
    },
    async (request, reply) => {
      const { sessionId } = request.cookies;

      const meals = await knex("meals").where("session_id", sessionId).select();
      const mappedMeals = meals.map((meal) => ({
        ...meal,
        is_on_diet: meal.is_on_diet ? "Sim" : "Não",
      }));

      return {
        meals: mappedMeals,
      };
    }
  );

  app.get(
    "/:id",
    {
      preHandler: checkSessionIdExists,
    },
    async (request) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = getMealParamsSchema.parse(request.params);

      const { sessionId } = request.cookies;

      const meal = await knex("meals")
        .where({
          session_id: sessionId,
          id,
        })
        .first();

      return { meal };
    }
  );

  app.get(
    "/metrics",
    {
      preHandler: checkSessionIdExists,
    },
    async (request, reply) => {
      const { sessionId } = request.cookies;

      const totalMeals = await knex("meals")
        .where("session_id", sessionId)
        .count({ count: '*'})
        .first();

      return reply.status(200).send({
        totalMeals: totalMeals?.count || 0,
      });
    }
  );

  app.post("/", async (request, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date_time: z.preprocess((arg) => {
        if (typeof arg === "string" || arg instanceof Date) {
          return new Date(arg);
        }
        return arg;
      }, z.date()), // Aqui garantimos que será uma data válida
      is_on_diet: z.boolean(),
    });
    const { name, description, date_time, is_on_diet } =
      createMealBodySchema.parse(request.body);

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();

      reply.cookie("sessionId", sessionId, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    await knex("meals").insert({
      id: randomUUID(),
      name,
      description,
      date_time: new Date(date_time).toISOString(),
      is_on_diet,
      session_id: sessionId,
      created_at: new Date().toISOString(),
    });

    return reply.status(201).send();
  });

  app.put(
    "/:id",
    {
      preHandler: checkSessionIdExists,
    },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = getMealParamsSchema.parse(request.params);

      const { sessionId } = request.cookies;

      const updateMealBodySchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        date_time: z
          .preprocess((arg) => {
            if (typeof arg === "string" || arg instanceof Date) {
              return new Date(arg); // Aqui a conversão para Date
            }
            return arg;
          }, z.date())
          .optional(), // Tornamos a data opcional
        is_on_diet: z.boolean().optional(),
      });

      const { name, description, date_time, is_on_diet } =
        updateMealBodySchema.parse(request.body);

      await knex("meals").where({ id, session_id: sessionId }).update({
        name,
        description,
        date_time: date_time?.toISOString(),
        is_on_diet,
      });

      return reply
        .status(200)
        .send({ message: "Refeição atualizada com sucesso!" });
    }
  );

  app.delete(
    "/:id",
    {
      preHandler: checkSessionIdExists,
    },
    async (request, reply) => {
      const getMealParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = getMealParamsSchema.parse(request.params);

      const { sessionId } = request.cookies;

      const meal = await knex("meals")
        .where({ id, session_id: sessionId })
        .first();

      await knex("meals").where({ id, session_id: sessionId }).delete();

      return reply
        .status(200)
        .send({ message: "Refeição excluída com sucesso!" });
    }
  );
}
