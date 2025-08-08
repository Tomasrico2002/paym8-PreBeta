import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await request.json()

    // Aquí se integraría con el backend real
    if (firstName && lastName && email && password) {
      // Simular llamada al backend
      const backendResponse = await fetch(`${process.env.BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email, password }),
      })

      if (backendResponse.ok) {
        const data = await backendResponse.json()
        return NextResponse.json(data)
      } else {
        const errorData = await backendResponse.json()
        return NextResponse.json(
          { message: errorData.message || 'Error al crear la cuenta' },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { message: 'Todos los campos son requeridos' },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
