import './globals.css'
export const metadata = { title: 'Raksha Farms Admin', description: 'Admin Dashboard' }
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
