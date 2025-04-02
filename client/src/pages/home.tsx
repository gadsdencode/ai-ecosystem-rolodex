import { useEffect } from 'react';
import { useLocation } from 'wouter';
import Public from './public';

export default function Home() {
  // The Home component now just renders the Public component
  // In the future, we could add authentication checks here
  return <Public />;
}