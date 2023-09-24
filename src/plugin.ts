import Elysia from "elysia";
import { getUser } from "./db";
import { User } from "./types";

export const MACPlugin = () => {
  return new Elysia({
    name: 'mac-address-plugin',
  })
  .derive(async ({headers}) => {
    const ip = headers['x-real-ip']!;
    const MAC = await new Response(Bun.spawn(['sh','-c',`arp -an | grep ${ip} | awk '{print $4}'`]).stdout).text();
    return {
      MAC
    }
  })
}

export const UserPlugin = () => {
  return new Elysia({
    name: 'user-plugin',
  })
  .use(MACPlugin())
  .derive(async ({MAC}) => {
    const user = getUser(MAC);
    return {
      user: user as User
    }
  })
}

export const StageGuard = (stage: number) => (app: (app: any) => any) => {
  return new Elysia({
    name: 'stage-guard',
  })
  .use(UserPlugin())
  .guard({transform: ({set, user})=>{
    if(user?.stage != stage) set.redirect = '/'
  }}, app)
}