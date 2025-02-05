import { Knex } from "knex";

declare module 'knex/types/tables'{
    export interface Tables{
        meals: {
            id: string
            name: string
            description: string
            date_time: string
            created_at: string
            session_id?: string
            is_on_diet: boolean
        }
    }
}