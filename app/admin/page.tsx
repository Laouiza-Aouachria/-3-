'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { getContent, saveContent } from '@/app/actions/content'

export default function AdminPage() {
  const router = useRouter()
  const [status, setStatus] = useState('')

  const [form, setForm] = useState({
    name: 'Laouiza',
    greeting: 'مرحبًا بكِ في عالمي الخاص.',
    description: 'مذكرات، معرفة قانونية، وأفكار أشاركها معكِ بهدوء ووضوح.',
    about: 'قانونية، باحثة، وصاحبة شغف.',
  })

  useEffect(() => {
    getContent()
      .then((data) => {
        setForm((current) => ({ ...current, ...data }))
      })
      .catch(() => {
        router.replace('/')
      })
  }, [router])

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setStatus('جارٍ الحفظ...')

    await saveContent(form)

    setStatus('تم حفظ التغييرات بنجاح')
  }

  async function logout() {
    await authClient.signOut()
    router.replace('/')
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="eyebrow">لوحة التحكم</p>
          <h1>تخصيص موقعك</h1>
        </div>

        <button className="secondary-button" onClick={logout}>
          تسجيل الخروج
        </button>
      </header>

      <form className="editor-form" onSubmit={submit}>
        <p className="form-note">
          عدّلي البيانات وستظهر على الموقع دون تعديل الكود.
        </p>

        <label>
          اسم الموقع
          <input
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
          />
        </label>

        <label>
          العنوان الرئيسي
          <textarea
            rows={3}
            value={form.greeting}
            onChange={(event) => update('greeting', event.target.value)}
          />
        </label>

        <label>
          الوصف
          <textarea
            rows={3}
            value={form.description}
            onChange={(event) => update('description', event.target.value)}
          />
        </label>

        <label>
          نبذة عنكِ
          <textarea
            rows={3}
            value={form.about}
            onChange={(event) => update('about', event.target.value)}
          />
        </label>

        <button className="primary-button" type="submit">
          حفظ التغييرات
        </button>

        {status && <p className="success-message">{status}</p>}
      </form>
    </main>
  )
}
