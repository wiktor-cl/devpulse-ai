import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { aiApi } from '@/api/services'
import {
  Brain, Sparkles, Send, Loader2, FileText, Calendar,
  ChevronDown, ChevronUp, Bot, User
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { format } from 'date-fns'
import ReactMarkdown from 'react-markdown'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function AiAnalyticsPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'reports' | 'chat'>('reports')
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your DevPulse AI assistant. Ask me anything about your projects, tasks, or productivity trends.",
      timestamp: new Date(),
    },
  ])
  const [expandedReport, setExpandedReport] = useState<string | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ['ai', 'reports'],
    queryFn: () => aiApi.getReports(),
  })

  const weeklyMutation = useMutation({
    mutationFn: aiApi.generateWeeklyReport,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai', 'reports'] }),
  })

  const chatMutation = useMutation({
    mutationFn: aiApi.chat,
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      }])
    },
    onError: () => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }])
    },
  })

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!chatInput.trim() || chatMutation.isPending) return
    const msg = chatInput.trim()
    setChatInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg, timestamp: new Date() }])
    chatMutation.mutate(msg)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const REPORT_TYPE_STYLES: Record<string, string> = {
    WEEKLY:  'bg-blue-500/10 text-blue-500',
    MONTHLY: 'bg-purple-500/10 text-purple-500',
    PROJECT: 'bg-green-500/10 text-green-500',
    CUSTOM:  'bg-orange-500/10 text-orange-500',
  }

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain size={24} className="text-primary" /> AI Analytics
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            AI-powered productivity insights and project analysis
          </p>
        </div>
        <button
          onClick={() => weeklyMutation.mutate()}
          disabled={weeklyMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {weeklyMutation.isPending
            ? <Loader2 size={14} className="animate-spin" />
            : <Sparkles size={14} />}
          Generate Weekly Report
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {(['reports', 'chat'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize',
              activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab === 'chat' ? '🤖 AI Chat' : '📊 Reports'}
          </button>
        ))}
      </div>

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reportsLoading && (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="animate-spin text-primary" size={28} />
            </div>
          )}

          {weeklyMutation.isPending && (
            <div className="bg-card border border-primary/30 rounded-xl p-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Brain size={20} className="text-primary animate-pulse" />
              </div>
              <div>
                <p className="font-medium text-foreground">Generating your weekly report…</p>
                <p className="text-sm text-muted-foreground">AI is analyzing your productivity data</p>
              </div>
              <Loader2 size={20} className="animate-spin text-primary ml-auto" />
            </div>
          )}

          {reportsData?.content.length === 0 && !reportsLoading && (
            <div className="text-center py-16 text-muted-foreground bg-card border border-border rounded-xl">
              <Brain size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium">No reports yet</p>
              <p className="text-sm mt-1">Generate your first weekly report to get AI insights</p>
            </div>
          )}

          {reportsData?.content.map(report => (
            <div key={report.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <div
                className="flex items-center justify-between p-5 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{report.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', REPORT_TYPE_STYLES[report.reportType])}>
                        {report.reportType}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar size={10} />
                        {format(new Date(report.generatedAt), 'MMM d, yyyy HH:mm')}
                      </span>
                    </div>
                  </div>
                </div>
                {expandedReport === report.id
                  ? <ChevronUp size={16} className="text-muted-foreground" />
                  : <ChevronDown size={16} className="text-muted-foreground" />}
              </div>

              {expandedReport === report.id && (
                <div className="px-5 pb-5 border-t border-border">
                  {report.summary && (
                    <div className="mt-4 p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground italic">
                      {report.summary}
                    </div>
                  )}
                  <div className="mt-4 prose prose-invert prose-sm max-w-none text-foreground">
                    <ReactMarkdown>{report.content}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="bg-card border border-border rounded-xl flex flex-col" style={{ height: '60vh' }}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={cn('flex items-start gap-3', msg.role === 'user' && 'flex-row-reverse')}>
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                  msg.role === 'assistant' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                )}>
                  {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
                </div>
                <div className={cn(
                  'max-w-[75%] rounded-2xl px-4 py-3',
                  msg.role === 'assistant'
                    ? 'bg-muted text-foreground rounded-tl-none'
                    : 'bg-primary text-primary-foreground rounded-tr-none'
                )}>
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none text-foreground prose-p:text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-li:text-foreground">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm">{msg.content}</p>
                  )}
                  <p className={cn(
                    'text-[10px] mt-1',
                    msg.role === 'assistant' ? 'text-muted-foreground' : 'text-primary-foreground/70'
                  )}>
                    {format(msg.timestamp, 'HH:mm')}
                  </p>
                </div>
              </div>
            ))}

            {chatMutation.isPending && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Bot size={14} className="text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-4">
            <div className="flex items-end gap-3">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your projects, productivity, deadlines…"
                rows={1}
                className="flex-1 px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                style={{ maxHeight: '120px' }}
              />
              <button
                onClick={sendMessage}
                disabled={!chatInput.trim() || chatMutation.isPending}
                className="p-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
