// import { PrismaClient } from '@remlore/ids/core/prisma'
import { PrismaClient } from '../generated/client'

const prisma = new PrismaClient({} as any)

async function main() {
  // Create a test client
  const client = await prisma.client.createMany({
    data: [
      {
        clientId: 'remlore',
        clientName: 'Remlore',
        clientSecret: 'web-app-secret',
        tokenEndpointAuthMethod: 'none',
        responseTypes: ['code'],
        grantTypes: ['authorization_code', 'refresh_token'],
        redirectUris: ['https://localhost:4200/auth/callback'],
        postLogoutRedirectUris: ['http://localhost:4200'],
        allowedScopes: ['openid profile email offline_access api.read api.write api']
      },
      {
        clientId: 'api',
        clientName: 'Remlore api',
        clientSecret: 'super-secret-key',
        grantTypes: ['client_credentials'],
        responseTypes: [],
        tokenEndpointAuthMethod: 'clientSecret_basic',
        allowedScopes: ['api.read api.write']
      }
    ]
  })

  console.log('Created test client:', client)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
