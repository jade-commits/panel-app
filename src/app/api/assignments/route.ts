import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const assignments = await prisma.panelAssignment.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(assignments);
    } catch (error) {
        console.error('Error fetching assignments:', error);
        return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { set, adviser, chairman, members, secretary } = body;

        const newAssignment = await prisma.panelAssignment.create({
            data: {
                set,
                adviser,
                chairman,
                members,
                secretary
            }
        });

        return NextResponse.json(newAssignment, { status: 201 });
    } catch (error) {
        console.error('Error creating assignment:', error);
        return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
    }
}
