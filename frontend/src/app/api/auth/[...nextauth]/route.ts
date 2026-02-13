import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const handler = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (!email || !password) return null;

        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) return null;
        const data = await response.json();

        return {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          backendToken: data.token,
        } as any;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.userId = (user as any).id;
        token.backendToken = (user as any).backendToken;
        token.name = user.name;
        token.email = user.email;
      }

      if (account?.provider === 'google' && account.id_token) {
        const response = await fetch(`${API_URL}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken: account.id_token }),
        });

        if (response.ok) {
          const data = await response.json();
          token.userId = data.user.id;
          token.backendToken = data.token;
          token.name = data.user.name;
          token.email = data.user.email;
        } else {
          token.backendToken = undefined;
          token.error = 'backend_token_failed';
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
      }
      session.backendToken = token.backendToken as string | undefined;
      session.error = token.error as string | undefined;
      return session;
    },
  },
});

export { handler as GET, handler as POST };
