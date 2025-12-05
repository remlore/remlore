import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '@remlore/ids/prisma'
import {
  AdapterFactory,
  OidcConfiguration,
  OidcModuleOptions,
  OidcModuleOptionsFactory
} from 'nest-oidc-provider'
import { OidcAdapter } from './oidc-adapter'

@Injectable()
export class OidcService implements OidcModuleOptionsFactory {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService
  ) {}

  createModuleOptions(): OidcModuleOptions | Promise<OidcModuleOptions> {
    const issuer = this.config.get('REM_IDS_BASE_URL')

    return {
      issuer,
      path: '/oidc',
      oidc: this.getConfiguration()
    }
  }

  createAdapterFactory(): AdapterFactory | Promise<AdapterFactory> {
    return (modelName: string) => new OidcAdapter(this.prisma, modelName)
  }

  getConfiguration(): OidcConfiguration {
    return {
      cookies: {
        keys: ['akeylongggggggggggg'],
        long: {
          signed: true,
          httpOnly: true,
          // Add secure flag in production
          secure: true,
          // Add sameSite policy (strict, lax, or none)
          sameSite: 'none',
          path: '/'
        },
        short: {
          signed: true,
          httpOnly: true,
          // Add secure flag in production
          secure: true,
          // Add sameSite policy (strict, lax, or none)
          sameSite: 'none',
          path: '/'
        },
        names: {
          session: '_session',
          interaction: '_interaction',
          resume: '_resume',
          state: '_state'
        }
      },
      pkce: {
        methods: ['S256'],
        required: () => true
      },
      clients: [
        {
          client_id: 'remlore',
          client_name: 'Remlore',
          client_secret: 'web-app-secret',
          token_endpoint_auth_method: 'none',
          response_types: ['code'],
          grant_types: ['authorization_code'],
          redirect_uris: ['https://localhost:4200/auth/callback'],
          post_logout_redirect_uris: ['https://localhost:4200'],
          scope: 'openid profile email offline_access api.read api.write api'
        },
        {
          client_id: 'api',
          client_name: 'Remlore api',
          client_secret: 'super-secret-key',
          grant_types: ['client_credentials'],
          response_types: [],
          token_endpoint_auth_method: 'client_secret_basic',
          scope: 'api.read api.write'
        }
      ],
      features: {
        devInteractions: { enabled: false }, // defaults to true
        deviceFlow: { enabled: true }, // defaults to false
        revocation: { enabled: true }, // defaults to false
        clientCredentials: { enabled: true },
        // introspection: { enabled: true },
        resourceIndicators: {
          enabled: true,
          defaultResource: async (ctx, client) => {
            return 'https://localhost:5000'
          },
          getResourceServerInfo(ctx, resourceIndicator) {
            console.log('Resource Indicator called with:', resourceIndicator)
            return {
              scope: 'api.read api.write',
              audience: 'https://localhost:5000',
              accessTokenFormat: 'jwt'
            }
          }
        }
      },
      jwks: {
        keys: [
          {
            kty: 'RSA',
            use: 'sig',
            alg: 'RS256',
            d: 'EF2Kky61jzvMYQ_B6ImXzCsQ8uQzbFJrGnB2azlpr_CFStjjUVKP4EKrSCVEasD6SGNJV2QSiNJr7j05nvuGmHMKa__rbU8fqP4qbDahUgCgWOq-zS5tGK6Ifk4II_cZ_V1F-TnrvmcOKMWBiSV-p8i72KpXXucbHGNRwASVs7--M55wp_m1UsybI2jSQ4IgyvGzTnvMmQ_GsX-XoD8u0zGU_4eN3DGc8l6hdxxuSymH0fEeL1Aj0LoCj6teRGF37a2sBQdU6mkNNAuyyirkoDqGZCGJToQLqX4F1FafnzjeIgfdneRa-vuaV380Hhr2rorWnQyBqOO27M5O_VAkJbfRaWJVrXTJ69ZgkU4GPdeYdklVL0HkU6laziTNqNMeAjnt4m51sWokVyJpvdWcb_vJ4NSCsRo7kHOz7g-UvWTXa8UW0DTDliq_TJ3rN4Gv0vn9tBlFfaeuLPpK4VNmRRDRXY_fcuzlnQwYExL9a4V_vCyGmabdb7PrUFPBcjR5',
            dp: 'SX52TkZEc_eLIk5gYrKjAC643LJIw1RxMBWWewRSGLn_rbrH1he3hy7AGDUV6Uon7zkNh9R5GBVuxmlluBRAGbrhIXAAf8sWeyma3F6FIAt-MH_VkfW5K2p88PLOyVGljlv8-Z3wzdKYOlDP4yFU18LqGMqaRSDLDGhILkuZhjLYA40sfYJeJTi_HVP5UyWL4ohayqUWCT2W3DgeDDThYHmufOaqlrSLhUst6uez_cDz0BXAYIZvUuPVL_n1-_px',
            dq: 'K1KYU77I6yyPA2u32rc0exp_TCG59hhpWxrmXN8yTXWyq_xYBhCJA_nHdY8UV25Hmd7q0iX2i8y2cCAFNWA5UWiSiNg9-fKRLI2nz53IM4dGfssOLwUk66wzX8r_u3XiLZsO7XNNtQZdcZmF0YuNTtzEdiNDhaOyHiwwHgShL36WNmUn00mZR__G5Qk60VvI8vsbvJU9xRnWuEVS1wRgyD7v6Nl9nIxb8N7oibCdTJLmgnRXPWvArsW0cJ-NURfr',
            e: 'AQAB',
            n: '2QwX-NBMkQYedGpbPvHL7Ca0isvfmLC7lSc8XSOCLmCUIf6Bk_pdCNx2kxsmT81IoA8CfvJLHQj5vWKoVDFMLfwo4IujvsC3m2IrEg6jERE-YHfC3W5jKZtmzQYpfx5vC2_XTmcyPigtyaNVsftGfycES3B_tvphNsFmQcJjVGOsJQXXqh_TDv6FMcH4m9pngyw6wfe3GgAKA0dRTSfD0h7wLdNCeuid53lLpkQypTNdZ6_PiCMu2gr_cH5M0MPZtBb2TW12_2zOabExK1lI5-HvdPtbMT4Qzs2nd2NkjcWmlbKRZzq6IzyWt7W2EnfZDsi61PHECtTb-EQN2icl8Wnsp-0Bw66yviAOj0gn3X5hRLx-TknT_PnWMou17l5GoAojKDezcTW0iLlrfs2ixFlY28u7WklUN8uYhHvwgON6fsdefG-3bPpiRLBPZ_tgXa4doALsCwfXu2oz0vYktk31A-UYv92uJsKSUbK0_8ODTN0rslCqCYN_1a_aVt2P',
            p: '--L5BX8juLlGJk8hdPgEUmJjD7SsZuMrdq3cSibkkbaWUE5CQQ7vhLPr2dWCS1jUnY9WyoCx9QCZvhTHjORX50ykkOyBso9VJjWvYPjsrPpF7_Y6V0dKlblDmbbmRT9BW-MgjbwTivu3c2OpMXh2XLF-FOTq3t3Brs7SRnhTkD6GBDFf3X95J0PF7NELa9z2-kzPSDYz3k-9FepXnRPBM_ViDzlRw4eKUdylVuhzGbC2TRSmab9BRP0wipQKd-f5',
            q: '3Jd5CRJpQV3xUi3FiHHAwcjfsRkfXMrxfaXt0PjX2xWzxscYiDcyCF6VhHTAGsiq5SOtCp3l5mg6A9PzdR53AzM2-706D82fMwiUZvsLOVTepXkgriP_xw7rDlkOeAvjB80sL2G9scFliTzzRZ8I8E79A8DxZihfB75AIN9ijklEihnwxfhp2EgO5MYEyQRcqU1TT8wD8ekLMzd-kJUWyTz3BogiVJH__BQoB6kaDyjvQoxBgwh0hi72t9H5XqPH',
            qi: 'cwK0jhzwbu8BaTmTQhwfGiqwNN3v9F4nUQ4dtnBYRI6zlki4cLb2Mf9-VhyEsUYhhdTm8R7RwO9m5Xct3gEfozdk35wuvkVwkZgL3Uho5asao0xi4aENeUk5DCkU-paO3yLSDhIs9YYuYIDjUX6QuMCPjomypuE3SRm-Dg1PGOxYvX3w_P-0kd5iBFrm4jwGTZViFOr8tl_dXgDRDWDgofOYOYcmUv2_0zt1aO3j5dhEpwdkyuDMLfVZNpJQyopJ',
            kid: 'f262a3214213d194c92991d6735b153b'
          }
        ]
      },
      claims: {
        email: ['email', 'email_verified'],
        phone: ['phone_number', 'phone_number_verified'],
        profile: ['birthdate', 'gender', 'picture', 'displayName', 'updated_at']
      },
      ttl: {
        Session: 3600, // 1 hour (set based on your requirement)
        AccessToken: 3600, // 1 hour
        AuthorizationCode: 600, // 10 minutes
        IdToken: 3600, // 1 hour
        RefreshToken: 1209600, // 14 days
        Interaction: 300, // Set interaction TTL to 5 minutes
        Grant: 3600
      },
      scopes: ['openid', 'profile', 'email', 'api.read', 'api.write', 'api', 'offline_access'],
      renderError(ctx, error) {
        ctx.type = 'html'
        ctx.body = `<html>
          <head><title>Oops!</title></head>
          <body>
            <h1>Error: ${error.error}</h1>
            <p>${error.error_description}</p>
          </body>
        </html>`
      },
      // interactions: {
      //   policy: interactions,
      //   url(ctx, interaction) {
      //     console.info('interaction', interaction)
      //     return `${process.env['REM_IDS_FE_BASE_URL']}/auth/login/${interaction.uid}`
      //   },
      // },
      findAccount: async (ctx, id) => {
        console.log(`Looking for user with ID: ${id}`)

        const user = await this.prisma.user.findUnique({
          where: { id },
          select: {
            id: true,
            email: true,
            role: true,
            profile: {
              select: {
                displayName: true
              }
            }
          }
        })

        console.log('============== the user here babe: ', user)

        if (!user) return undefined

        return {
          accountId: user.id,
          claims() {
            return {
              sub: user.id,
              email: user.email,
              name: user.profile?.displayName,
              roles: user.role
            }
          }
        }
      }
    }
  }
}
