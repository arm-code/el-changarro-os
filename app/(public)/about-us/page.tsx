import { redirect } from 'next/navigation';

// La página principal fue movida a /
// Este redirect preserva links viejos hacia /about-us
export default function AboutUsPage() {
  redirect('/');
}