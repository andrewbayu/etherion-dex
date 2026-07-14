import type { UIMessage } from 'ai'
import type { ComponentProps, HTMLAttributes } from 'react'
import { memo } from 'react'
import { Streamdown } from 'streamdown'

function classes(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(' ')
}

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: UIMessage['role']
}

export function Message({ className, from, ...props }: MessageProps) {
  return <div className={classes('ai-message', `ai-message-${from}`, className)} {...props} />
}

export type MessageContentProps = HTMLAttributes<HTMLDivElement>

export function MessageContent({ className, ...props }: MessageContentProps) {
  return <div className={classes('ai-message-content', className)} {...props} />
}

export type MessageResponseProps = ComponentProps<typeof Streamdown>

export const MessageResponse = memo(
  ({ className, ...props }: MessageResponseProps) => (
    <Streamdown className={classes('ai-message-response', className)} {...props} />
  ),
  (previous, next) => previous.children === next.children && previous.isAnimating === next.isAnimating,
)

MessageResponse.displayName = 'MessageResponse'
