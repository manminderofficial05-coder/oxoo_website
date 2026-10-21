import { redirect } from 'next/navigation';

// Demo build: account creation is disabled; visitors use the pre-filled demo credentials.
export default function SignUpPage() {
  redirect('/sign-in');
}
