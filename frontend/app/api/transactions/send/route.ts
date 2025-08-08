import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { message: 'Token de autorización requerido' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const transactionData = await request.json()

    // Aquí se integraría con el backend real
    const backendResponse = await fetch(`${process.env.BACKEND_URL}/api/transactions/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(transactionData),
    })

    if (backendResponse.ok) {
      const data = await backendResponse.json()
      return NextResponse.json(data)
    } else {
      const errorData = await backendResponse.json()
      return NextResponse.json(
        { message: errorData.message || 'Error al enviar el pago' },
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
