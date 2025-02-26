import { json } from "@remix-run/node";
import { authenticate } from "../../shopify.server";
import { useLoaderData, Link } from "@remix-run/react";
import {
  Page,
  Card,
  Button,
  IndexTable,
  Layout,
  EmptyState,
} from "@shopify/polaris";

import { getTorchIdentity } from "../../models/torch.server";

// En el loader de la página, puedes realizar la solicitud a la API de Shopify
export async function loader({ request }) {
	const { admin, session, redirect } = await authenticate.admin(request);
  const torch = await getTorchIdentity()

  // Si no ha sesionado con Torch lo mandamos a la configuración
  if(!torch){
    return redirect('/app/configuration');
  }
  
  let response = []

	try {
    response = await admin.graphql(
      `#graphql
          query { 
            
              orders(first: 100) {
                nodes {
                  id
                  name
                  processedAt
                  totalPrice
                  shippingLine {
                    carrierIdentifier
                    code
                    custom
                    deliveryCategory
                    id
                    price
                    phone
                    shippingRateHandle
                    source
                    title
                  }
                  customer {
                    email
                    displayName
                  }
                  fulfillments {
                    id
                    trackingInfo {
                      number
                      url
                    }
                  }
                }
              }
              fulfillmentOrders(first: 100) {
                nodes {
                  id
                  orderId
                  deliveryMethod {
                    id
                  }
                }
              }
            

          }
      `,
    );
    response = await response.json();
    console.log('--R--', JSON.stringify(response.data,null,2))
	}
	catch(error){
		console.log('--err02--', error)
	}
  
  const ordersTorch = response.data.orders.nodes.filter(
    order => {
      // console.log('--d--', order)
      return order.shippingLine.source.includes("Torch")
    }
  );

  // Se agrega el id de fullfilment
  // Mapeamos fulfillmentOrders para que sea más fácil buscar el fulfillmentID por orderId
  const fulfillmentMap = {};
  response.data.fulfillmentOrders.nodes.forEach(fulfillment => {
    fulfillmentMap[fulfillment.orderId] = fulfillment.id
  });

  // console.log('--Mp--', fulfillmentMap)
  // console.log('--Ot--', ordersTorch)

  // Añadimos fulfillmentID a cada order en función de su orderId
  ordersTorch.forEach(order => {
    order.fulfillmentID = fulfillmentMap[order.id]
  });

  // console.log('--R2--', torch, session.accessToken)
  torch['idt'] = session.accessToken
  torch['shop'] = session.shop
  

  return json({ 
    //orders  : response.data.orders.nodes,
    orders : ordersTorch,
    "torch" : torch
  })
}

const EmptyOrdersState = () => (
  <EmptyState
    heading="There are no orders with Torch shipments yet"
    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
  >
    <p>When orders are placed with shipping through the Torch platform, they will appear here.</p>
  </EmptyState>
);

const OrderTable = ({orders,torch}) => {
  console.log('--OO1--', orders, torch)
  return (
  <IndexTable
    resourceName={{
      singular: "Order",
      plural: "Orders",
    }}
    itemCount={orders.length}
    headings={[
      { title: "Pedido" },
      { title: "Fecha" },
      { title: "Cliente" },
      { title: "Correo" },
      { title: "Monto" },
      { title: "Guía" },
    ]}
    selectable={false}
  >
    {orders.map((item) => (
      <OrderTableRow key={item.id} order={item} torch={torch}/>
    ))}
  </IndexTable>
  )
}

const OrderTableRow = ({order, torch}) => (
  <IndexTable.Row id={order.id} position={order.id}>
    <IndexTable.Cell>
      <Link to={order.id}>{order.name}</Link>
    </IndexTable.Cell>
    <IndexTable.Cell>
      {new Date(order.processedAt).toDateString()}
    </IndexTable.Cell>
    <IndexTable.Cell>
      {order.customer.displayName}
    </IndexTable.Cell>
    <IndexTable.Cell>
      {order.customer.email}
    </IndexTable.Cell>
    <IndexTable.Cell>
      ${order.totalPrice}
    </IndexTable.Cell>
    <IndexTable.Cell>
      {order.fulfillmentID ? (
        <Button onClick={() => {openGenerateShipping(order,torch)}}>Generar Guía</Button>
      ) : ( 
        order.fulfillments.length > 0 ? (
          <Link to={order.fulfillments[0].trackingInfo[0].url} target="_blank">{order.fulfillments[0].trackingInfo[0].number}</Link>
        ) : null
      )}
    </IndexTable.Cell>
  </IndexTable.Row>
)

function openGenerateShipping(order,torch){
  console.log('--i--', order, torch)
  
  const url = 'https://api.u-torch.com/v1/shipment/shopify';
  //const url = 'https://api-qa.u-torch.com/v1/shipment/shopify';
  //const url = 'https://torch-api.serveo.net/v1/shipment/shopify';
  
  const data = {
    apiKey        : torch.api_key,
    idRate        : order.shippingLine.code*1,
    shippingName  : order.shippingLine.title,
    sp            : torch.shop,
    idt           : torch.idt,
    idFullfilment : order.fulfillmentID,
  };
  console.log('--d--', data)
  
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = url;
  form.target = '_blank';

  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'json_data';
  input.value = JSON.stringify(data);
  form.appendChild(input);

  // Añadir el formulario al cuerpo y enviarlo
  document.body.appendChild(form);
  form.submit();

  // Eliminar el formulario del DOM después de enviarlo
  document.body.removeChild(form);
}

// En el componente de la página, puedes utilizar los datos obtenidos
export default function OrdersPage() {
  const {orders, torch} = useLoaderData();
  console.log('--DD--', orders, torch)

  return (
    <Page>

      <ui-title-bar title="Pedidos con envío Torch">
        <button variant="breadcrumb" onClick={() => navigate("/app")}>
          U-Torch :
        </button>
      </ui-title-bar>

      <Layout>
        <Layout.Section>
          <Card padding="0">
            {orders.length === 0 ? (
              <EmptyOrdersState />
            ) : (
              <OrderTable orders={orders} torch={torch} />
            )}
          </Card>
        </Layout.Section>
      </Layout>

    </Page>
  )
}
