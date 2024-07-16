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