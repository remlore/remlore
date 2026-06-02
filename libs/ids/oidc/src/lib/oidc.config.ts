import { PrismaService } from '@remlore/ids/core/prisma'
import { Configuration } from 'oidc-provider'
import { PrismaAdapter } from './oidc-adapter'

export function getOidcConfiguration(prismaService: PrismaService): Configuration {
  const isDevelopment = process.env['NODE_ENV'] !== 'production'
  const frontendUrl = process.env['IDS_FE_URL'] || (isDevelopment ? 'http://localhost:4200' : '')

  return {
    // Load clients from database
    clients: [], // Will be dynamically loaded

    adapter: (typeName: string) => new PrismaAdapter(prismaService, typeName),
    // Custom client loading function
    async findAccount(_ctx, id, _token) {
      // Find user by ID from your User table
      const user = await prismaService.user.findUnique({
        where: { id }
      })

      if (!user) {
        return undefined
      }

      return {
        accountId: id,
        async claims() {
          return {
            sub: id,
            email: user.email,
            email_verified: user.emailVerified,
            name: user.displayName
          }
        }
      }
    },

    // Claims configuration
    claims: {
      openid: ['sub'],
      email: ['email', 'email_verified'],
      profile: ['birthdate', 'gender', 'picture', 'display_name', 'updated_at']
    },

    // Features
    features: {
      devInteractions: { enabled: false },

      // Enable resource indicators (for API access)
      resourceIndicators: {
        enabled: true,
        defaultResource: (ctx, client) => {
          console.log('Default resource for client:', client)
          return (ctx.oidc.client?.metadata()['resource'] as string) || 'https://localhost:5000'
        },
        getResourceServerInfo: (_, resourceIndicator, client) => {
          return {
            scope: 'api:read api:write',
            audience: resourceIndicator,
            accessTokenFormat: 'jwt'
          }
        }
      },

      // Enable client credentials grant
      clientCredentials: { enabled: true },

      // Enable revocation endpoint
      revocation: {
        enabled: true
      },

      // Enable introspection
      introspection: {
        enabled: true
      },

      // Enable RP-initiated logout
      rpInitiatedLogout: {
        enabled: true,
        logoutSource: async (ctx, form) => {
          // Custom logout page
          ctx.body = `<!DOCTYPE html>
            <html>
            <head>
              <title>Logout</title>
            </head>
            <body>
              <h1>Logging out...</h1>
              ${form}
              <script>
                document.forms[0].submit();
              </script>
            </body>
            </html>`
        },
        postLogoutSuccessSource: async (ctx) => {
          ctx.body = `<!DOCTYPE html>
            <html>
            <head>
              <title>Logged Out</title>
            </head>
            <body>
              <h1>You have been logged out successfully</h1>
              <a href="/">Return to home</a>
            </body>
            </html>`
        }
      }
    },

    // Interaction configuration
    interactions: {
      url(_ctx, interaction) {
        if (isDevelopment && frontendUrl) {
          return `${frontendUrl}/auth/login?uid=${interaction.uid}`
        }
        // Redirect to Angular app for interactions
        return `/auth/login?uid=${interaction.uid}`
      }
    },

    // Cookie configuration
    cookies: {
      keys: [process.env['COOKIE_SECRET'] as string],
      long: {
        signed: true,
        httpOnly: true,
        sameSite: isDevelopment ? 'none' : 'lax',
        secure: true // Always true (use HTTPS in dev too)
      },
      short: {
        signed: true,
        httpOnly: true,
        sameSite: isDevelopment ? 'none' : 'lax',
        secure: true // Always true (use HTTPS in dev too)
      },
      names: {
        session: 'remlore.session',
        interaction: 'remlore.interaction',
        resume: 'remlore.resume',
        state: 'remlore.state'
      }
    },

    // Token TTLs
    ttl: {
      AccessToken: 3600, // 1 hour
      AuthorizationCode: 600, // 10 minutes
      IdToken: 3600, // 1 hour
      RefreshToken: 1_209_600_000, // 14 days
      ClientCredentials: 600, // 10 minutes
      Grant: 1_209_600_000, // 14 days
      Interaction: 3600, // 1 hour
      Session: 1_209_600_000 // 14 days
    },

    // PKCE configuration
    pkce: {
      required: (_, client) => {
        // Require PKCE for public clients (SPAs, mobile apps)
        return client.tokenEndpointAuthMethod === 'none'
      }
    },

    jwks: {
      keys: [
        {
          p: 'vyHnQixOqAlisgmPtTwjVd4c_Z9cFfZgRgaYBof3DvAHHvpvLR2WAXHEVX6Vqe_E6lSHPzrAYLPsCapaMP1kugshGIyldnG6vrhwgqw8ZImhb_OYfCF2iTwk1GzBjuHIJ7RcLPjFqKZLJcMiXTp8Rdu6vNsBfiS73xs8Qlk_KVk',
          kty: 'RSA',
          q: '1YJdCaD2dSZ0hhFvwIoguL7ryAnHyS55FH0iTKZgtCC9owzmBUqeVgTdSOQG-Mbrl1os2iPNyCCQzt-LOIaCyzA0QFa0r7BjC89kiO3LIbbV4XB-tRY63wsLXjWPUJgVEenFeUFcxTYwrhBQqebmIbx_OEJXJEktTsWFLChThrE',
          d: 'AQmxn13EmqLOkhP6u_-bzsJo1SFONHTizDqkoV8wAxKHWHWO8hGcsSipbpefASzZTRdpnQ7xbyKXhAUanzVCjgRfkOYBxBSUjx7vSawYqHJSErKY2mweaABXLaDudeu_e8eSAb28VIJLOSgK9OXiCzUrSenPBZ9WT0Ao-hksCj6_P9-rm62kDG7rkpsoQhsjbMNAaE8j2cApdjuLTjL52hP5r6JpQfk0xxPRtsB4ljBmM-KRQPg5QSG_KQXbbIEkCCcljxod4oW6anjMWrBXbvYym5SeZmz2nQEvfSJX9LWh43yeKVP_kIk5w_f0QALS7Yp1WJrAWng0gpIEYk8uIQ',
          e: 'AQAB',
          use: 'sig',
          qi: 'QZK32TaAEwewiPxFJ7Oikda5nQcIolarp5r9GXBQzpk1DUEwszyyj-eE4rloyyG19zy2v11tpi-YGM--I_HIrbsTunT6gOMZ31TVSqTfZwIjv5YCegdlfantpaGqWD1aeexLcoXVo505rHaZ4EcN60fGhBYfOdwrQu0b-5tj-yg',
          dp: 'mkWhRfZBXryEnzO8fQqXct2fBM-2IjwFJUB5QPxJ3BK9jLGTPxUcWPodAOz1nH7dsE6eA9lGIkfXg02vEs_Ul54YDpqni1zs4Lg6iB7BeFzmo1g5gif4Z3jWOWe3K77uMa4QoHQEBsaC7W39tMZaPIDIz1rub4Ty53gyQVOL-bE',
          alg: 'RS256',
          dq: 'bMKDciw0X2i_YqvvKT0zfeiDYtrYknrB4tX7auA10ov7Ddu8MGXaUicYMdE2W_O4ftjIkDY81P0Bxt_Io3qhla9wbnW8hOJtEc8Lf1TibMIeIUCUytoQEx4lJFBUONG_qehTV3kcMLlyArj83g9omzbR926TxUAhfEbRl7TTF4E',
          n: 'n2iKF__ZT8IPslXIKDQDfL0kkkX2js_WzhWdP6uAoYOPERdbp1ciV_knqqMuSptxPXll_hnLN4_dTXvCqGsM-2g59ZPn2pw081jbJmDCLgR6Zyl6UgLdF0vrYgJriaqMVzoEnrOqFfCKU-u8Xm5TFROL7HWv1J5IP3pHUSrdEboumqcUKiWJF0pMb8N_zGdF95WQpo1YDcZVEX0m2LeeojSXqfbBR001FfZfDHHxBXFLtN16zUjZMtDIRKT3vVbijUkCLSLYPQySZ38DZPvQshIZemzO81lNmAut98KAv1RK-K3t202cqYLboBWdd2PNH6H3WircuYqBp4rTFCssiQ'
        }
      ]
    },

    // Supported response types
    responseTypes: ['code', 'id_token', 'code id_token'],

    // Scopes
    scopes: ['openid', 'profile', 'email', 'api.read', 'api.write', 'api', 'offline_access'],

    // Extra token claims
    extraTokenClaims: async (ctx, token) => {
      if (token.kind === 'AccessToken') {
        return {
          // Add custom claims to access token
        }
      }
      return {}
    },

    // JWT configuration for Access Tokens
    conformIdTokenClaims: false
  }
}
