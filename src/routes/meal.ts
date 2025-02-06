import { FastifyInstance } from "fastify";
import { randomInt, randomUUID } from "node:crypto";
import { z } from "zod";
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

      const meals = await knex("meals").where("session_id", sessionId).select()
      const mappedMeals = meals.map((meal) =>({
        ...meal,
        is_on_diet: meal.is_on_diet ? 'Sim' : "Não",
      }))

      return {
        meals: mappedMeals,
      }
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
    const { name, description, date_time, is_on_diet } = createMealBodySchema.parse(request.body);

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
}
