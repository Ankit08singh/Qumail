// /pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";

const GOOGLE_AUTHORIZATION_PARAMS = {
  // request Gmail scopes and offline access (refresh token)
  scope: [
    "openid",
    "email",
    "profile",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.modify"
  ].join(" "),
  access_type: "offline",   // request refresh token
  prompt: "consent",
  include_granted_scopes: "true",
};

async function refreshAccessToken(token: any) {
  try {
    const url = "https://oauth2.googleapis.com/token";
    const body = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
    });

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const data = await res.json();

    if (!res.ok) throw data;

    return {
      ...token,
      accessToken: data.access_token,
      accessTokenExpires: Date.now() + data.expires_in * 1000,
      // Google sometimes returns a new refresh token; if not, keep old one
      refreshToken: data.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: { params: GOOGLE_AUTHORIZATION_PARAMS }
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
      authorization: {
        params: {
          scope: "openid email profile offline_access Mail.Read Mail.ReadWrite Mail.Send",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  
  debug: true, // Enable debug mode

  callbacks: {
    // Persist tokens in the JWT
    async jwt({ token, account }: any) {
      // first sign in
      if (account) {
        console.log('Account received:', account.provider);
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          provider: account.provider,
          accessTokenExpires: account.expires_at
            ? account.expires_at * 1000
            : Date.now() + (account.expires_in ?? 3600) * 1000,
        };
      }

      // Return previous token if the access token has not expired
      if (Date.now() < (token as any).accessTokenExpires) {
        return token;
      }

      // Access token expired — refresh it (only for Google)
      if (token.provider === 'google') {
        return await refreshAccessToken(token);
      }

      return token;
    },

    // Make tokens available in session
    async session({ session, token }: any) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.provider = token.provider;
      session.error = token.error;
      return session;
    },
  },
};

export default NextAuth(authOptions);
