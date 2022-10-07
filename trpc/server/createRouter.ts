import { router } from "@trpc/server";
import { Context } from "./context";

const createRouter = () => router<Context>();

export default createRouter;
