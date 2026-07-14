import { useChat } from '@ai-sdk/react'
import { ArrowUp, Database, Sparkle, Stop, X } from '@phosphor-icons/react'
import { DefaultChatTransport } from 'ai'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { Opportunity } from '../data'
import { Message, MessageContent, MessageResponse } from './ai-elements/message'

export function GroundedAssistant({ item, onClose }: { item: Opportunity; onClose: () => void }) {
  const [input, setInput] = useState('')
  const transport = useMemo(() => new DefaultChatTransport({ api: '/api/chat' }), [])
  const { messages, sendMessage, status, stop, error } = useChat({ transport })
  const busy = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    const listener = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', listener)
    return () => window.removeEventListener('keydown', listener)
  }, [onClose])

  async function submit(event: FormEvent) {
    event.preventDefault()
    const question = input.trim()
    if (!question || busy) return
    setInput('')
    await sendMessage({ text: question }, { body: { assetId: item.id } })
  }

  const suggestions = [
    'What changed in the live evidence?',
    'Explain the score and its weakest input.',
    'What evidence would invalidate this view?',
  ]

  return <div className="assistant-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="assistant-drawer" role="dialog" aria-modal="true" aria-label={`${item.name} grounded assistant`} onMouseDown={(event) => event.stopPropagation()}>
      <header className="assistant-head">
        <div><span className="assistant-icon"><Sparkle size={19} weight="fill" /></span><span><strong>Grounded assistant</strong><small>{item.symbol} · {item.evidence.length} mapped source{item.evidence.length === 1 ? '' : 's'}</small></span></div>
        <button className="icon-button" onClick={onClose} aria-label="Close assistant"><X size={19} /></button>
      </header>

      <div className="assistant-policy"><Database size={16} /><p><strong>Evidence boundary active.</strong> Answers use the current market snapshot and linked source headlines only. No personalized advice.</p></div>

      <div className="assistant-messages" aria-live="polite">
        {!messages.length && <div className="assistant-empty">
          <Sparkle size={26} weight="duotone" />
          <h2>Ask about the evidence, not a trade.</h2>
          <p>I can explain the live score, compare supporting and contrary signals, or point out where the evidence is insufficient.</p>
          <div className="assistant-suggestions">{suggestions.map((suggestion) => <button key={suggestion} onClick={() => setInput(suggestion)}>{suggestion}</button>)}</div>
        </div>}
        {messages.map((message) => <Message from={message.role} key={message.id}>
          <MessageContent>
            {message.parts.map((part, index) => part.type === 'text'
              ? message.role === 'assistant'
                ? <MessageResponse isAnimating={status === 'streaming'} key={`${message.id}-${index}`}>{part.text}</MessageResponse>
                : <p key={`${message.id}-${index}`}>{part.text}</p>
              : null)}
          </MessageContent>
        </Message>)}
        {status === 'submitted' && <div className="assistant-thinking"><span /><span /><span /> Checking the evidence</div>}
        {error && <div className="assistant-error">The assistant could not connect. {error.message}</div>}
      </div>

      <form className="assistant-composer" onSubmit={submit}>
        <textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            event.currentTarget.form?.requestSubmit()
          }
        }} placeholder={`Ask about ${item.symbol}'s evidence…`} maxLength={1_200} rows={2} />
        {busy
          ? <button type="button" className="assistant-send stop" onClick={stop} aria-label="Stop response"><Stop size={17} weight="fill" /></button>
          : <button type="submit" className="assistant-send" disabled={!input.trim()} aria-label="Send question"><ArrowUp size={18} weight="bold" /></button>}
        <small>Grounded by {item.evidence.length} sources · AI can make mistakes</small>
      </form>
    </section>
  </div>
}
