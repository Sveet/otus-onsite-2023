import Elysia from "elysia";
import { getUser } from "./db";

export const MACPlugin = () => {
  return new Elysia({
    name: 'mac-address-plugin',
  })
  .derive(async ({headers}) => {
    const ip = headers['x-real-ip']!;
    const MAC = await new Response(Bun.spawn(['/home/j/get_mac.sh', ip]).stdout).text();
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
      user
    }
  })
}