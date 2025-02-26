import axios from "axios";

import { json } from "@remix-run/node";
import { authenticate } from "../../shopify.server";
import { upsert, clean } from "../../models/torch.server"

const host = "https://api.u-torch.com"
//const host = "https://api-qa.u-torch.com"
//const host = "https://torch-api.serveo.net"

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
      break;
    case 'SET-ID-DELIVERY' :
      const idTrack = formData.get('id_tracking_number')
      const idRate = formData.get('id_rate')
      console.log('---llegó---', idTrack, idRate)
      return json({ídRate, idTrack})
    default :
      return null
  }

  return json({session})
}

async function login(formData, session, admin){

  const apiTorch = axios.create();

  return apiTorch.post(host+'/v1/login', {
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
      carrier_service.callback_url = host+"/v1/rates/shopify?key="+data.api_key;
      carrier_service.service_discovery = true;
      const services = await carrier_service.save({
        update: true,
      });

      const srv = await admin.rest.resources.CarrierService.all({
        session: session,
      });

      return { status : "ok" }
    })
    .catch((error) => {
      console.log('--error--',error)
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

  return "ok"
}