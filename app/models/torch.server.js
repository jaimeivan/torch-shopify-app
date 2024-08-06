import invariant from "tiny-invariant";
import db from "../db.server";

export async function getTorchIdentity(id, graphql) {
  const torch = await db.torch_identity.findFirst();
  console.log('--t--', torch)
  if (!torch) {
    return null;
  }

  return torch
}

export async function upsert(data){
  const torch = await db.torch_identity.findFirst();
  console.log('--torch--', torch)
  if(torch){
    console.log('--01--')
    await db.torch_identity.update({ where: { id: Number(torch.id) }, data });
  }
  else {
    console.log('--02--')
    await db.torch_identity.create({ data })
  } 
}

export async function clean(){
  const torch = await db.torch_identity.findFirst();
  console.log('--T--', torch)
  if(torch){
    await db.torch_identity.delete({ where: { id: Number(torch.id) } });
  }
}