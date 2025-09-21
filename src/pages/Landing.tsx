import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Database, User, Upload, TestTube, Shield, Zap } from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center bg-gradient-hero text-primary-foreground">
        <div className="max-w-4xl mx-auto">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Infosys Virtual Internship
              <br />
              <span className="text-2xl md:text-4xl font-normal opacity-90">Milestone 1 Project</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
              Professional Dataset Management System with User Authentication & Profile Management
            </p>
            <p className="text-lg mb-8 opacity-75">
              Created by: <span className="font-semibold">Your Name</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="btn-professional bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="btn-professional border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Professional Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Complete web application with authentication, profile management, and dataset handling capabilities
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-professional animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Secure Authentication</CardTitle>
                <CardDescription>
                  Complete registration and login system with secure password handling and user session management
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-professional animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Profile Management</CardTitle>
                <CardDescription>
                  User profiles with age group settings, language preferences, and personalized data management
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-professional animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Dataset Upload</CardTitle>
                <CardDescription>
                  Secure file upload system for text and CSV datasets with progress tracking and validation
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-professional animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Dataset Selection</CardTitle>
                <CardDescription>
                  Browse and select from predefined datasets including Wikipedia, News, and custom uploads
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-professional animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <TestTube className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Integration Testing</CardTitle>
                <CardDescription>
                  Complete flow demonstration from login through profile setup to dataset management
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-professional animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Responsive Design</CardTitle>
                <CardDescription>
                  Professional Infosys-inspired design that works perfectly on desktop and mobile devices
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-professional text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join the Infosys Virtual Internship platform and explore professional dataset management
          </p>
          <Link to="/register">
            <Button size="lg" className="btn-professional bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              Create Your Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}