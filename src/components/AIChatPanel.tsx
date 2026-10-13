import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, RotateCcw, Send, Sparkles, Trash2, User as UserRound } from 'lucide-react';
import { aiChatApi } from '../services/api';

type ChatContext = {
  productId?: string;
  overrideNewExpiry?: string;
  datasetProductId?: string;
  trialInput?: Record<string, unknown>;
};

type ChatMessage = { role: 'user' | 'assistant'; message: string; source?: string };

type Props = {
  pageContext: 'support' | 'ai-recommendations' | 'reorder';
  context?: ChatContext;
  title?: string;
  suggestions?: string[];
};

const welcome = 'Xin chào! Tôi có thể giúp bạn sử dụng Smart Store, tìm hiểu dữ liệu cửa hàng và giải thích các kết quả phân tích. Bạn cần hỗ trợ điều gì?';

const AIChatPanel: React.FC<Props> = ({ pageContext, context = {}, title = 'Trò chuyện với AI', suggestions }) => {
  const storageKey = useMemo(() => {
    const scope = context.productId || context.datasetProductId || 'general';
    return `smart-store-ai-chat:${pageContext}:${scope}`;
  }, [pageContext, context.productId, context.datasetProductId]);
  const [conversationId, setConversationId] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: 'assistant', message: welcome }]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const savedId = localStorage.getItem(storageKey);
    setConversationId(savedId || '');
    setMessages([{ role: 'assistant', message: welcome }]);
    setError('');
    if (savedId) {
      aiChatApi.getConversation(savedId).then(({ data }) => {
        if (active && Array.isArray(data.messages)) setMessages(data.messages);
      }).catch(() => {
        if (active) localStorage.removeItem(storageKey);
      });
    }
    return () => { active = false; };
  }, [storageKey]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  const send = async (text = input) => {
    const question = text.trim();
    if (!question || sending) return;
    setSending(true);
    setPending(question);
    setError('');
    try {
      const { data } = await aiChatApi.sendMessage({
        question,
        pageContext,
        conversationId: conversationId || undefined,
        ...context
      });
      if (data.conversationId) {
        setConversationId(data.conversationId);
        localStorage.setItem(storageKey, data.conversationId);
      }
      setMessages(current => [
        ...current,
        { role: 'user', message: question },
        { role: 'assistant', message: data.answer, source: data.source }
      ]);
      setInput('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Chưa gửi được câu hỏi. Nội dung vẫn được giữ lại để bạn thử lại.');
    } finally {
      setPending('');
      setSending(false);
    }
  };

  const newConversation = async () => {
    if (conversationId) {
      try { await aiChatApi.deleteConversation(conversationId); }
      catch { setError('Không xóa được hội thoại trên máy chủ. Hãy thử lại sau.'); return; }
    }
    localStorage.removeItem(storageKey);
    setConversationId('');
    setMessages([{ role: 'assistant', message: welcome }]);
    setInput('');
    setError('');
  };

  return (
    <section className="mt-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm" aria-label={title}>
      <header className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-900 px-5 py-4 text-white sm:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <span className="rounded-xl bg-blue-600 p-2"><Bot size={19} /></span>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-black">{title}</h2>
            <p className="text-[10px] font-bold text-slate-400">Chỉ tư vấn, không tự thay đổi dữ liệu cửa hàng</p>
          </div>
        </div>
        <button type="button" onClick={newConversation} className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-wide text-slate-300 hover:bg-white/10 hover:text-white" title="Cuộc trò chuyện mới">
          <Trash2 size={14} /><span className="hidden sm:inline">Làm mới</span>
        </button>
      </header>

      <div ref={bodyRef} className="max-h-[420px] min-h-[240px] space-y-4 overflow-y-auto bg-slate-50/70 p-4 sm:p-6" aria-live="polite">
        {messages.map((item, index) => (
          <div key={`${index}-${item.role}`} className={`flex items-start gap-2.5 ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {item.role === 'assistant' && <span className="mt-1 rounded-lg bg-blue-100 p-1.5 text-blue-700"><Sparkles size={15} /></span>}
            <div className={`max-w-[88%] whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-relaxed ${item.role === 'user' ? 'rounded-tr-sm bg-blue-600 text-white' : 'rounded-tl-sm border border-slate-200 bg-white text-slate-700'}`}>
              {item.message}
              {item.role === 'assistant' && item.source && <div className="mt-2 border-t border-slate-100 pt-2 text-[9px] font-black uppercase tracking-wider text-slate-400">{item.source === 'cohere_ai' ? 'Phản hồi từ Cohere AI' : 'Phản hồi dự phòng hệ thống'}</div>}
            </div>
            {item.role === 'user' && <span className="mt-1 rounded-lg bg-slate-200 p-1.5 text-slate-600"><UserRound size={15} /></span>}
          </div>
        ))}
        {sending && <div className="flex items-start gap-2.5"><span className="rounded-lg bg-blue-100 p-1.5 text-blue-700"><Sparkles size={15} /></span><div className="rounded-2xl rounded-tl-sm border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">Đang xem xét câu hỏi…</div></div>}
      </div>

      <div className="space-y-3 p-4 sm:p-5">
        {suggestions?.length ? <div className="flex flex-wrap gap-2">{suggestions.map(item => <button key={item} type="button" disabled={sending} onClick={() => { setInput(item); void send(item); }} className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-[10px] font-bold text-blue-700 hover:bg-blue-100 disabled:opacity-50">{item}</button>)}</div> : null}
        {error && <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700"><span>{error}</span><button type="button" disabled={sending} onClick={() => void send(pending || input)} className="inline-flex items-center gap-1 font-black underline disabled:opacity-50"><RotateCcw size={13} /> Thử lại</button></div>}
        <form onSubmit={event => { event.preventDefault(); void send(); }} className="flex items-end gap-2">
          <textarea value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void send(); } }} rows={2} maxLength={1000} placeholder="Nhập câu hỏi… (Enter để gửi, Shift+Enter xuống dòng)" className="min-h-[48px] flex-1 resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
          <button type="submit" disabled={sending || !input.trim()} className="flex h-12 shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-black text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"><Send size={15} /><span className="hidden sm:inline">Gửi</span></button>
        </form>
      </div>
    </section>
  );
};

export default AIChatPanel;
