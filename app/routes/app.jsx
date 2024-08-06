import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  console.log('--AUTH-06--')
  const { admin, session } = await authenticate.admin(request);

  // const carrier_service = new admin.rest.resources.CarrierService({session: session});
  // carrier_service.name = "Torch Rate Provider";
  // //carrier_service.callback_url = "https://87cb-187-221-162-50.ngrok-free.app/v1/rates/shopify?key=ac787bba-4470-45b2-b195-f98c53bd006f";
  // carrier_service.callback_url = "https://api-qa.u-torch.com/v1/rates/shopify?key=b5e502d4-27d9-4216-93cb-c4fb9894e925";
  // carrier_service.service_discovery = true;
  // const services = await carrier_service.save({
  //   update: true,
  // });

  // const services = await admin.rest.resources.CarrierService.all({
  //   session: session,
  // });

  // const services = await admin.rest.resources.CarrierService.delete({
  //   session: session,
  //   id: 58867810368,
  // });

  // console.log('--SERV-07--', services)
  return json({ apiKey: process.env.SHOPIFY_API_KEY || "" });
};

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        {/*<Link to="/app" rel="home">
          Home
        </Link>*/}
        {/*<Link to="/app/additional">Pedidos con envío</Link>*/}
        <Link to="/app/configuration">Configuración</Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
