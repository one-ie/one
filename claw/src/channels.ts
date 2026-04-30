/**
 * Channel adapters — normalize incoming webhooks to Signal, send replies back.
 *
 * Multi-bot Telegram: webhook path /webhook/telegram-<name> + group prefix tg-<name>-
 * routes through env.TELEGRAM_TOKEN_<NAME> (uppercased). Falls back to TELEGRAM_TOKEN.
 */

import type { Env, Signal } from './types'

interface TelegramUpdate {
  message?: {
    message_id: number
    chat: { id: number; title?: string }
    from?: { id: number; username?: string }
    text?: string
    reply_to_message?: { message_id: number }
  }
}

export const normalizeTelegram = (payload: TelegramUpdate, botPrefix = 'tg'): Signal | null => {
  const msg = payload.message
  if (!msg?.text) return null

  return {
    id: `${botPrefix}-${msg.message_id}`,
    group: `${botPrefix}-${msg.chat.id}`,
    channel: 'telegram',
    sender: msg.from?.username || msg.from?.id.toString() || 'unknown',
    content: msg.text,
    replyTo: msg.reply_to_message?.message_id?.toString(),
    ts: Date.now(),
  }
}

/** Resolve token + chat id from a tg-* group. tg-<name>-<chat> → env.TELEGRAM_TOKEN_<NAME>; else env.TELEGRAM_TOKEN. */
function resolveTelegram(env: Env, groupId: string): { token: string | undefined; chatId: string } {
  const m = groupId.match(/^tg-([a-z0-9]+)-(.+)$/)
  if (m) {
    const key = `TELEGRAM_TOKEN_${m[1].toUpperCase()}` as keyof Env
    const token = env[key] as string | undefined
    if (token) return { token, chatId: m[2] }
  }
  return { token: env.TELEGRAM_TOKEN, chatId: groupId.replace(/^tg-/, '') }
}

export const sendTelegram = async (env: Env, groupId: string, text: string): Promise<void> => {
  const { token, chatId } = resolveTelegram(env, groupId)
  if (!token) return
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' }),
  })
}

interface DiscordMessage {
  id: string
  channel_id: string
  author: { id: string; username: string }
  content: string
}

export const normalizeDiscord = (payload: DiscordMessage): Signal => ({
  id: `dc-${payload.id}`,
  group: `dc-${payload.channel_id}`,
  channel: 'discord',
  sender: payload.author.username,
  content: payload.content,
  ts: Date.now(),
})

export const sendDiscord = async (env: Env, groupId: string, text: string): Promise<void> => {
  if (!env.DISCORD_TOKEN) return
  const id = groupId.replace('dc-', '')
  await fetch(`https://discord.com/api/v10/channels/${id}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bot ${env.DISCORD_TOKEN}` },
    body: JSON.stringify({ content: text }),
  })
}

interface WebMessage {
  id?: string
  group: string
  sender?: string
  content: string
}

export const normalizeWeb = (payload: WebMessage): Signal => ({
  id: payload.id || `web-${Date.now()}`,
  group: payload.group,
  channel: 'web',
  sender: payload.sender || 'anonymous',
  content: payload.content,
  ts: Date.now(),
})

/** Dispatch by channel name. Supports `telegram`, `telegram-<name>`, `discord`, `web`. */
export const normalize = (channel: string, payload: unknown): Signal | null => {
  if (channel === 'telegram') return normalizeTelegram(payload as TelegramUpdate)
  if (channel.startsWith('telegram-')) {
    const prefix = `tg-${channel.slice('telegram-'.length)}`
    return normalizeTelegram(payload as TelegramUpdate, prefix)
  }
  if (channel === 'discord') return normalizeDiscord(payload as DiscordMessage)
  if (channel === 'web') return normalizeWeb(payload as WebMessage)
  return null
}

export const send = async (env: Env, group: string, text: string): Promise<void> => {
  if (group.startsWith('tg-')) return sendTelegram(env, group, text)
  if (group.startsWith('dc-')) return sendDiscord(env, group, text)
  // Web channels don't have push — clients poll /messages/:group
}
