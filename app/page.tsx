import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Aftercare Companion</CardTitle>
          <CardDescription>
            Simplifying medical aftercare instructions for better patient outcomes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Welcome to your personal aftercare assistant. Get started by logging in or testing your connection.
          </p>
          
          <div className="space-y-2">
            <Link href="/login" className="block">
              <Button className="w-full">
                Get Started
              </Button>
            </Link>
            
            <Link href="/test-connection" className="block">
              <Button variant="outline" className="w-full">
                Test Database Connection
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}