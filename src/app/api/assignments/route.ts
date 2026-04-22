import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient();
  }
  return prisma;
}

// GET all panel assignments (load on page refresh)
export async function GET() {
  try {
    const db = getPrisma();
    const assignments = await db.panelAssignment.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Transform flat DB records back into the nested shape the frontend expects
    const records = assignments.map((a) => ({
      id: a.id,
      title: a.title,
      students: a.students,
      set: a.set,
      adviser: a.adviser,
      panel: {
        chairman: a.chairman,
        members: a.members,
        secretary: a.secretary,
      },
    }));

    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}

// POST a new panel assignment (called when "Save Panel" is clicked)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, students, set, adviser, panel } = body;
    const { chairman, members, secretary } = panel;

    const db = getPrisma();
    const newAssignment = await db.panelAssignment.create({
      data: {
        title,
        students,
        set,
        adviser,
        chairman,
        members,
        secretary,
      }
    });

    // Return in the same nested shape
    return NextResponse.json({
      id: newAssignment.id,
      title: newAssignment.title,
      students: newAssignment.students,
      set: newAssignment.set,
      adviser: newAssignment.adviser,
      panel: {
        chairman: newAssignment.chairman,
        members: newAssignment.members,
        secretary: newAssignment.secretary,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
  }
}

// DELETE a panel assignment by id
export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    const db = getPrisma();
    await db.panelAssignment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 });
  }
}
