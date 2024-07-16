import axios from "axios";
import { json } from "@remix-run/node";
import { useLoaderData, Link, useNavigate } from "@remix-run/react";
import { Modal, TitleBar, useAppBridge } from '@shopify/app-bridge-react';
import { authenticate } from "../../shopify.server";
import { useState, useCallback } from 'react';
import {
  Card,
  EmptyState,
  Layout,
  Page,
  IndexTable,
  Thumbnail,
  Text,
  Icon,
  InlineStack,
  Box,
  InlineGrid,
  BlockStack,
  TextField,
  useBreakpoints,
  Divider,
  Button,
  Form, 
  FormLayout,
} from "@shopify/polaris";

//import db from "../../db.server";
import { getTorchIdentity } from "../../models/torch.server";

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);
  console.log('--ADM--', admin)
  console.log('--SES--', session)
  const torch = await getTorchIdentity()
  console.log('--T2--', torch)
  return json(torch);
}

export default function Configuration() {

  const { smUp } = useBreakpoints();
  const torch = useLoaderData();
  const shopify = useAppBridge();
  const apiTorch = axios.create();

  let [email, setEmail] = useState('');
  let [password, setPassword] = useState('');

  let handleEmailChange = useCallback(
    (value) => {console.log('--1--', value);setEmail(value)},
    [],
  );
  let handlePasswordChange = useCallback(
    (value) => {console.log('--2--', value);setPassword(value)},
    [],
  );

  const handleSubmit = useCallback(() => {
    console.log('--S--', email, password)
    apiTorch.post('https://api-qa.u-torch.com/v1/login', {
      "email": email,
      "password": password,
      "service": "Shopify"
    })
    .then((response) => {
      console.log(response)
    })
    .catch((error) => console.log(error))

  }, [email, password]);

  const openLogin = async () => {
    console.log('try-open')
    shopify.modal.show('login-modal')
  }

  return (
    <Page
      divider
      primaryAction={{ content: "View on your store", disabled: false }}
      secondaryActions={[
        {
          content: "Duplicate",
          accessibilityLabel: "Secondary action label",
          onAction: () => alert("Duplicate action"),
        },
      ]}>

      <Modal
        id="login-modal"
        variant="small">
        
        <Form>
          <FormLayout>
            <Box
              padding="400">
              <BlockStack
                gap="400">

                <TextField
                  value    = {email}
                  onChange = {handleEmailChange}
                  label    = "Usuario"
                  helpText = {
                    <span>
                      Escribe el usuario que tienes en la plataforma de Torch
                    </span>
                  }
                />

                <TextField
                  value    = {password}
                  onChange = {handlePasswordChange}
                  label    = "Constraseña"
                  type     = "password"
                  helpText = {
                    <span>
                      Escribe la contraseña que tienes en la plataforma de Torch
                    </span>
                  }
                />

              </BlockStack>
            </Box>
          </FormLayout>
        </Form>

        <TitleBar title="Conectar con la plataforma Torch">
          <button variant="primary" onClick={handleSubmit}>Conectar</button>
          <button onClick={() => shopify.modal.hide('login-modal')}>Cancelar</button>
        </TitleBar>
        
      </Modal>

      <BlockStack gap={{ xs: "800", sm: "400" }}>
        <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
          <Box
            as="section"
            paddingInlineStart={{ xs: 400, sm: 0 }}
            paddingInlineEnd={{ xs: 400, sm: 0 }}
          >
            <BlockStack gap="400">
              <Text as="h3" variant="headingMd">
                API KEY
              </Text>
              <Text as="p" variant="bodyMd">
                Conecta tu tienda Shopify con la plataforma Torch para que muestre los mejores precios en envíos
              </Text>
            </BlockStack>
          </Box>
          <Card roundedAbove="sm">
            { torch ? (
              <BlockStack gap="400">  
                <div>
                  <TextField label="Interjamb style" />
                  <TextField label="Interjamb ratio" />
                </div>
              </BlockStack>
            ) : (
              <div>
                <BlockStack gap="400">
                  <Text as="h3" variant="headingMd">
                    Te falta un sólo paso para continuar
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Por favor inicia sesión con Torch para que la aplicación pueda ofrecerte los mejores precios
                  </Text>
                </BlockStack>
                <Box paddingBlockStart="400">
                  <InlineStack 
                    align="end">
                    <Button variant="primary" onClick={openLogin}>Iniciar sesión</Button>
                  </InlineStack>
                </Box>
              </div>
            )}
          </Card>
        </InlineGrid>
        {smUp ? <Divider /> : null}
        <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
          <Box
            as="section"
            paddingInlineStart={{ xs: 400, sm: 0 }}
            paddingInlineEnd={{ xs: 400, sm: 0 }}
          >
            <BlockStack gap="400">
              <Text as="h3" variant="headingMd">
                Dimensiones por defecto
              </Text>
              <Text as="p" variant="bodyMd">
                Establece una dimensión por defecto para que aquellos productos que no lo tengan definido asi puedas mostrar un costo aproximado
              </Text>
            </BlockStack>
          </Box>
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <TextField label="Horizontal" />
              <TextField label="Interjamb ratio" />
            </BlockStack>
          </Card>
        </InlineGrid>
      </BlockStack>

    </Page>

  )
}