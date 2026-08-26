'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { sql } from 'drizzle-orm'

async function getUserId() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  return session.user.id
}

export async function saveContent(data: Record<string, unknown>) {
  const userId = await getUserId()
  const content = JSON.stringify(data)

  await db.execute(sql`
    INSERT INTO site_content (id, "userId", data)
    VALUES ('main', ${userId}, ${content}::jsonb)
    ON CONFLICT (id)
    DO UPDATE SET
      data = ${content}::jsonb,
      "userId" = ${userId},
      "updatedAt" = now()
  `)

  revalidatePath('/')
  revalidatePath('/admin')

  return { ok: true }
}

export async function getContent() {
  const userId = await getUserId()

  const result = await db.execute(sql`
    SELECT data
    FROM site_content
    WHERE id = 'main'
    AND "userId" = ${userId}
    LIMIT 1
  `)

  return (
    (result.rows[0]?.data as Record<string, unknown>) || {}
  )
}
