import { type APIRequestContext } from "@playwright/test"

interface Email {
  id: number
  recipients: string[]
  subject: string
  text: string
  html: string
}

interface FindEmailOptions {
  request: APIRequestContext
  filter: (email: Email) => boolean
  timeout?: number
}

export async function findLastEmail({
  request,
  filter,
  timeout = 5000,
}: FindEmailOptions): Promise<Email> {
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    const response = await request.get(`${process.env.MAILCATCHER_HOST || 'http://localhost:1080'}/messages`)
    const emails = await response.json()

    for (const email of emails) {
      if (filter(email)) {
        return email
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  throw new Error("Email not found within timeout")
}
