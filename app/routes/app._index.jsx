import { json } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { authenticate } from "../shopify.server";

export async function loader({ request }) {
  const { admin, session, redirect } = await authenticate.admin(request);
  console.log('--ADM--', admin)
  console.log('--SES--', session)
  return redirect('/app/configuration');
}