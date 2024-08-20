import axios from "axios";
import { json } from "@remix-run/node";
import { 
  Link,
  useLoaderData, 
  useNavigate, 
  useFetcher } from "@remix-run/react";
import { Modal, TitleBar, useAppBridge } from '@shopify/app-bridge-react';
import { authenticate } from "../../shopify.server";
import { useState, useCallback, useEffect } from 'react';
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
  ButtonGroup,
  Form, 
  FormLayout,
  InlineError,
  Spinner,
} from "@shopify/polaris";

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
  const navigate = useNavigate();

  console.log('--tt--', torch)
  let [email, setEmail] = useState('');
  let [password, setPassword] = useState('');
  let [error, setError] = useState(null);

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
    .then(async (response) => {
      console.log('--R--', response)
      const data = {
        api_key : response.token
      }
      //await upsert(data)
    })
    .catch((error) => console.log(error))

  }, [email, password]);

  const openLogin = async () => {
    console.log('try-open')
    shopify.modal.show('login-modal')
  }

  const api = useFetcher()
  useEffect(() => {
    console.log('--ap--', api)
    const data = api.data;
    if (!(api.state !== "idle" && data)) return;
    
    if(data.error){
      setError(data.error)
    }
    //navigate("/app/configuration")
    shopify.modal.hide('login-modal')
    console.log('--d--', data)
  }, [ api ]);

  const isLoading = api.state !== "idle";

  return (
    <Page
      divider>

      <Modal
        id="login-modal"
        variant="small">
        
        <api.Form action="../../api/torch" method="post">
          <FormLayout>
            <Box
              padding="400">

            { isLoading ? (
              <Spinner
                accessibilityLabel="Loading login"
                hasFocusableParent={false}
              />
            ) : (
              <BlockStack
                gap="400">

                <input type="hidden" name="action" value="LOGIN"/>
                
                { error
                  ? (<InlineError message={error} />)
                  : null}

                <TextField
                  value    = {email}
                  onChange = {handleEmailChange}
                  label    = "User"
                  name     = "user"
                  helpText = {
                    <span>
                      Enter the username you have on the U-Torch platform
                    </span>
                  }
                />

                <TextField
                  value    = {password}
                  onChange = {handlePasswordChange}
                  label    = "Password"
                  type     = "password"
                  name     = "password"
                  helpText = {
                    <span>
                      Enter the password you have on the U-Torch platform
                    </span>
                  }
                />

                <InlineStack align="end">
                  <ButtonGroup>
                    <Button onClick={() => shopify.modal.hide('login-modal')}>Cancel</Button>
                    <Button variant="primary" submit>Connect</Button>
                  </ButtonGroup>
                </InlineStack>

              </BlockStack>
            )}
            </Box>
          </FormLayout>
        </api.Form>

        <TitleBar title="Connect with the Torch platform">
          {/*<button variant="primary" onClick={handleSubmit}>Conectar</button>*/}
          
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
                Connect your Shopify store to the U-Torch platform to display the best shipping prices
              </Text>
            </BlockStack>
          </Box>
          <Card roundedAbove="sm">
            { isLoading ? (
              <InlineStack align="center">
                <Box paddingBlockStart="300">
                  <Spinner
                    accessibilityLabel="Loading login"
                    hasFocusableParent={false}
                  />
                </Box>
              </InlineStack>
            ) : (torch ? (
                <api.Form action="../../api/torch" method="post">
                  <input type="hidden" name="action" value="LOGOUT"/>
                  <Box paddingBlockStart="400">
                    <Text as="h3" variant="headingMd" alignment="center">
                      You are successfully connected to the U-Torch platform
                    </Text>
                  </Box>
                  <Box paddingBlockStart="400">
                    <InlineStack 
                      align="end">
                      <Button variant="primary" submit>Disconnect</Button>
                    </InlineStack>
                  </Box>
                </api.Form>
              ) : (
                <div>
                  <BlockStack gap="400">
                    <Text as="h3" variant="headingMd">
                      You are just one step away from continuing.
                    </Text>
                    <Text as="p" variant="bodyMd">
                      Please log in with U-Torch so the app can offer you the best prices.
                    </Text>
                  </BlockStack>
                  <Box paddingBlockStart="400">
                    <InlineStack 
                      align="end">
                      <Button variant="primary" onClick={openLogin}>Login</Button>
                    </InlineStack>
                  </Box>
                </div>
              ))
            }
          </Card>
        </InlineGrid>
        {smUp ? <Divider /> : null}
        {/*<InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
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
        </InlineGrid>*/}
      </BlockStack>

    </Page>

  )
}