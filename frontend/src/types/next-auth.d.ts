import 'next-auth';

declare module 'next-auth' {
  interface Session {
    backendToken?: string;
    error?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string;
    backendToken?: string;
    error?: string;
  }
}
