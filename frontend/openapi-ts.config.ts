import { createClient } from '@hey-api/openapi-ts';

createClient({
  client: '@hey-api/client-axios',
  input: './openapi.json',
  output: './client',
});


