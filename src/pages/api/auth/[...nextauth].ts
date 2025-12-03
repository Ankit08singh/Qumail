// /pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

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
  ],
  secret: process.env.NEXTAUTH_SECRET,

  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',  
        path: '/',
        secure: process.env.NODE_ENV === 'production',  
      },
      callbackUrl: {
        name: process.env.NODE_ENV === 'production'
          ? '__Secure-next-auth.callback-url'
          : 'next-auth.callback-url',
        options: {
          httpOnly: true,
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',  
          path: '/',
          secure: process.env.NODE_ENV === 'production',  
        },
      },
      csrfToken: {
        name: process.env.NODE_ENV === 'production'
          ? '__Host-next-auth.csrf-token'
          : 'next-auth.csrf-token',
        options: {
          httpOnly: true,
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',  
          secure: process.env.NODE_ENV === 'production',  
        },
      },
    },
  },

  callbacks: {
    // Persist tokens in the JWT
    async jwt({ token, account }: any) {
      // first sign in
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token, // may be undefined if not returned
          // account.expires_at is seconds since epoch (sometimes present)
          accessTokenExpires: account.expires_at
            ? account.expires_at * 1000
            : Date.now() + (account.expires_in ?? 3600) * 1000,
        };
      }

      // Return previous token if the access token has not expired
      if (Date.now() < (token as any).accessTokenExpires) {
        return token;
      }

      // Access token expired — refresh it
      return await refreshAccessToken(token);
    },

    // Make tokens available in `session`
    async session({ session, token }: any) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.error = token.error;
      return session;
    },
  },
};

export default NextAuth(authOptions);
