import { json } from "@remix-run/node";
import { authenticate } from "../../shopify.server";

// En el loader de la página, puedes realizar la solicitud a la API de Shopify
export async function loader({ request }) {
  //const session = await getSession(request.headers.get("Cookie"));
	const { admin, session } = await authenticate.admin(request);
	console.log('--SSSS--', session)
	/*
  // const accessToken = session.get("accessToken");
  // const shop = session.get("shop");
	const accessToken = session.accessToken
  const shop = session.shop

  const url = `https://${shop}/admin/api/2023-04/orders.json?limit=50`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  }).then(response => {
  	return response
  })
  .catch( error => {
  	console.error('--Errors--', error)
  })

  if (!response.ok) {
    throw new Error("Error al obtener los datos de los pedidos");
  }

  const ordersData = await response.json();
  */
	try{
	  const ordersData = await admin.rest.resources.Order.all({
		  session: session,
		  limit: 100
		});
	}
	catch(error){
		console.log('--err02--', error)
	}

  console.log('--D--', ordersData)
  return json(ordersData);
}

// En el componente de la página, puedes utilizar los datos obtenidos
export default function OrdersPage() {
  const data = useLoaderData();
  console.log('--DD--', data)
  return (
    <Page
      divider>
    </Page>
  )
}
