import type { Env, Signal } from './types'

interface TelegramUpdate {
  message?: {
    message_id: number
    chat: { id: number }
    from?: { id: number; username?: string }
    text?: string
  }
}

export function normalizeTelegram(payload: TelegramUpdate): Signal | null {
  const msg = payload.message
  if (!msg?.text) return null
  return {
    id: `tg-${msg.message_id}`,
    group: `tg-${msg.chat.id}`,
    channel: 'telegram',
    sender: msg.from?.username || String(msg.from?.id) || 'unknown',
    content: msg.text,
    ts: Date.now(),
  }
}

export async function sendTelegram(env: Env, groupId: string, text: string): Promise<void> {
  if (!env.TELEGRAM_TOKEN) return
  const chatId = groupId.replace('tg-', '')
  await fetch(`https://api.telegram.org/bot${env.TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
  })
}

interface DiscordMessage {
  id: string
  channel_id: string
  author: { username: string; bot?: boolean }
  content: string
  type?: number
}

export function normalizeDiscord(payload: DiscordMessage): Signal {
  return {
    id: `dc-${payload.id}`,
    group: `dc-${payload.channel_id}`,
    channel: 'discord',
    sender: payload.author.username,
    content: payload.content,
    ts: Date.now(),
  }
}

export async function sendDiscord(env: Env, groupId: string, text: string): Promise<void> {
  if (!env.DISCORD_TOKEN) return
  const channelId = groupId.replace('dc-', '')
  await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bot ${env.DISCORD_TOKEN}`,
    },
    body: JSON.stringify({ content: text }),
  })
}
