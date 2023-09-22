import Elysia from "elysia";
import { getUser } from "./db";

export const MACPlugin = () => {
  return new Elysia({
    name: 'mac-address-plugin',
  })
  .derive(async ({headers}) => {
    console.log(`headers: ${JSON.stringify(headers)}`)
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
    console.log(`MAC: ${MAC}`);
    const user = getUser(MAC);
    console.log(`user: ${JSON.stringify(user)}`);
    return {
      user
    }
  })
}

export const StageGuard = (stage: number) => {
  return new Elysia({
    name: 'stage-guard',
  })
  .use(UserPlugin())
  .guard({transform: ({set, user})=>{
    console.log(`user: ${JSON.stringify(user)}`)
    if(user?.stage != stage) set.redirect = '/'
  }})
}