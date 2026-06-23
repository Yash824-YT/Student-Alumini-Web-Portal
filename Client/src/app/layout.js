import './globals.css';
import ClientLayout from './ClientLayout';

export const metadata = {
  title: 'AlumniConnect - Your Alumni Network Hub',
  description: 'Connect with alumni, explore job opportunities, join events, and build your professional profile. A comprehensive alumni networking platform.',
  keywords: 'alumni, networking, jobs, events, resume, university',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
