// Per-client configuration. Edit this file when cloning the template for a new client deployment.

export const clientConfig = {
  clientName: "Demo",
  benefitsEnabled: true, // flip to false to grey out the Benefits card on the home page
  auth: {
    // The login form just asks for a username. The username is lower-cased and combined
    // with this domain to form the Supabase email under the hood — the client never
    // sees or types the email. For the default Demo setup, the Supabase user is
    // registered (once, at sign-up) with: demo@demo.twentysixconsulting.co.uk
    emailDomain: "demo.twentysixconsulting.co.uk",
  },
} as const;

export function clientNameToEmail(name: string): string {
  return `${name.trim().toLowerCase()}@${clientConfig.auth.emailDomain}`;
}
