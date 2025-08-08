import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, CreditCard, Shield, Zap, Users, TrendingUp, Globe } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center" href="/">
          <CreditCard className="h-6 w-6 mr-2" />
          <span className="font-bold text-xl">Paym8</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
            Características
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#pricing">
            Precios
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
            Iniciar Sesión
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-white">
                Pagos Simples y Seguros con Paym8
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl">
                La plataforma de pagos más confiable para empresas y usuarios. Envía, recibe y gestiona tus pagos de forma segura.
              </p>
            </div>
            <div className="space-x-4">
              <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                <Link href="/signup">
                  Comenzar Gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-white border-white hover:bg-white hover:text-blue-600">
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              ¿Por qué elegir Paym8?
            </h2>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl mt-4">
              Ofrecemos las mejores herramientas para gestionar tus pagos de manera eficiente y segura.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Seguridad Avanzada</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Protección de nivel bancario con encriptación de extremo a extremo y autenticación de dos factores.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Pagos Instantáneos</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Procesa pagos en tiempo real con confirmación inmediata y notificaciones automáticas.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Globe className="h-10 w-10 text-blue-600 mb-2" />
                <CardTitle>Global</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Acepta pagos en múltiples monedas y países con tasas de cambio competitivas.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
            <div className="flex flex-col items-center space-y-2 text-center">
              <Users className="h-12 w-12 text-blue-600" />
              <h3 className="text-2xl font-bold">1M+</h3>
              <p className="text-gray-500">Usuarios Activos</p>
            </div>
            <div className="flex flex-col items-center space-y-2 text-center">
              <TrendingUp className="h-12 w-12 text-blue-600" />
              <h3 className="text-2xl font-bold">$50B+</h3>
              <p className="text-gray-500">Procesado Anualmente</p>
            </div>
            <div className="flex flex-col items-center space-y-2 text-center">
              <Globe className="h-12 w-12 text-blue-600" />
              <h3 className="text-2xl font-bold">150+</h3>
              <p className="text-gray-500">Países Soportados</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                ¿Listo para comenzar?
              </h2>
              <p className="mx-auto max-w-[600px] text-gray-500 md:text-xl">
                Únete a miles de empresas que confían en Paym8 para sus pagos.
              </p>
            </div>
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/signup">
                Crear Cuenta Gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">© 2024 Paym8. Todos los derechos reservados.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Términos de Servicio
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacidad
          </Link>
        </nav>
      </footer>
    </div>
  )
}
