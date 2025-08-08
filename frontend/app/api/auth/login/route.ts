import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Aquí se integraría con el backend real
    // Por ahora, simulamos una respuesta exitosa
    if (email && password) {
      // Simular llamada al backend
      const backendResponse = await fetch(`${process.env.BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (backendResponse.ok) {
        const data = await backendResponse.json()
        return NextResponse.json(data)
      } else {
        return NextResponse.json(
          { message: 'Credenciales inválidas' },
          { status: 401 }
        )
      }
    }

    return NextResponse.json(
      { message: 'Email y contraseña son requeridos' },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
