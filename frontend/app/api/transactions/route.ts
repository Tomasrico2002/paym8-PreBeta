import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { message: 'Token de autorización requerido' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')

    // Aquí se integraría con el backend real
    const backendResponse = await fetch(`${process.env.BACKEND_URL}/api/transactions`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (backendResponse.ok) {
      const data = await backendResponse.json()
      return NextResponse.json(data)
    } else {
      return NextResponse.json(
        { message: 'Error al obtener las transacciones' },
        { status: 400 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
