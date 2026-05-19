/**
 * @file aiElementsAdapters.ts
 * @description Spark 类型与 AI Elements / AI SDK 之间的适配
 */

import type { ToolCallContent } from '@spark/types'
import type { ToolUIPart } from 'ai'
import type { BundledLanguage } from 'shiki'

export function toCodeBlockLanguage(language?: string): BundledLanguage {
  const raw = (language || 'typescript').toLowerCase()
  const aliases: Record<string, BundledLanguage> = {
    ts: 'typescript',
    js: 'javascript',
    py: 'python',
    shell: 'bash',
    md: 'markdown',
  }
  const normalized = (aliases[raw] ?? raw) as BundledLanguage
  return normalized
}

export function mapToolCallToUIPart(content: ToolCallContent): {
  type: ToolUIPart['type']
  state: ToolUIPart['state']
  input: ToolUIPart['input']
  output?: ToolUIPart['output']
  errorText?: ToolUIPart['errorText']
} {
  const type = `tool-${content.toolName}` as ToolUIPart['type']

  const state: ToolUIPart['state'] =
    content.status === 'success'
      ? 'output-available'
      : content.status === 'error'
        ? 'output-error'
        : 'input-available'

  let output: ToolUIPart['output']
  if (content.toolResult) {
    try {
      output = JSON.parse(content.toolResult) as ToolUIPart['output']
    } catch {
      output = content.toolResult
    }
  }

  return {
    type,
    state,
    input: (content.toolArgs ?? {}) as ToolUIPart['input'],
    output,
    errorText: content.status === 'error' ? content.toolResult : undefined,
  }
}
