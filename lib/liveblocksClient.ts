import { createClient } from "@liveblocks/client";

export const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY || "pk_dev_TRzan7F3w3E9gkcm03DDNP7VJAt5XatYD2zouzNXOvO9bSagSy5RtgLFuJz_Lkc2",
}); 