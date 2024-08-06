import axios from "axios";

import { json } from "@remix-run/node";
import { authenticate } from "../../shopify.server";
import { upsert, clean } from "../../models/torch.server"

export async function action({request}) {
  const { admin, session } = await authenticate.admin(request);
  console.log('--api--', session)

  const formData = await request.formData();
  const actn = formData.get('action');
  
  switch (actn) {
    case 'LOGIN':
      return await login(formData, session, admin)
    break;
    case 'LOGOUT' :
      return await logout(session, admin)
    default :
      return null
  }

  return json({session})
}

async function login(formData, session, admin){

  const apiTorch = axios.create();
  //const formData = await request.formData();

  return apiTorch.post('https://api-qa.u-torch.com/v1/login', {
      "email": formData.get('user'),
      "password": formData.get('password'),
      "service": "Shopify",
      "shop": session.shop
    })
    .then(async (response) => {
      console.log('--R--', response)
      const data = {
        api_key : response.data.token
      }

      await upsert(data)

      const carrier_service = new admin.rest.resources.CarrierService({session: session});
      carrier_service.name = "Torch Rate Provider";
      //carrier_service.callback_url = "https://87cb-187-221-162-50.ngrok-free.app/v1/rates/shopify?key=ac787bba-4470-45b2-b195-f98c53bd006f";
      carrier_service.callback_url = "https://api-qa.u-torch.com/v1/rates/shopify?key="+data.api_key;
      carrier_service.service_discovery = true;
      const services = await carrier_service.save({
        update: true,
      });

      return { status : "ok" }
    })
    .catch((error) => {
      console.log('--error--',error.response)
      return { error : error?.response?.data?.error ?? error.message }
    })
}

async function logout(session, admin){
  
  const services = await admin.rest.resources.CarrierService.all({
    session: session,
  });

  const srv = services.data.find((item) => item.name === "Torch Rate Provider")
  if(srv){
    await admin.rest.resources.CarrierService.delete({
      session: session,
      id: srv.id,
    });
  }

  await clean()

  console.log('--LO-01--', srv)

  return "ok"
}