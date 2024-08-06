import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {

  await authenticate.admin(request);
  console.log('--AUTH-01--',request)

  return null;
};
