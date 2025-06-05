import NextAuth, { DefaultSession } from 'next-auth';
import CognitoProvider from 'next-auth/providers/cognito';
import { JWT } from 'next-auth/jwt';

// Extend session to include the Cognito user id
declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    sub?: string;
  }
}

export const authOptions = {
  providers: [
    CognitoProvider({
      clientId: process.env.COGNITO_CLIENT_ID!,
      clientSecret: process.env.COGNITO_CLIENT_SECRET!,
      issuer: process.env.COGNITO_ISSUER!,
    })
  ],
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }: { session: any; token: JWT }) {
      if (session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
