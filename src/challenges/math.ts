import { Elysia } from "elysia"
import { StageGuard } from "../plugin"

const math = (stage: number) => (app: Elysia) => app
  .use(StageGuard(stage))

export default math;