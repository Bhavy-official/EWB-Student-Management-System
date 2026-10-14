import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Database,
  RefreshCw,
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { studentApi, getApiErrorMessage } from '../services/api';
import type { AIStatusResponse } from '../types/student';


interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  grounded_data?: any;
  intent?: string;
  timestamp: Date;
}

const SAMPLE_PROMPTS = [
  'How many students are currently registered?',
  'Which course has the most students?',
  'How many students enrolled this year?',
  'Show students born after 2003-01-01',
  'Students taking Computer Science',
  'Summarize the database overview',
];

export const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content:
        'Hello! I am your AI Student Assistant. You can ask me natural language questions about student enrollments, academic courses, or age demographics. All answers are grounded in real-time SQLite database queries.',
      timestamp: new Date(),
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<AIStatusResponse | null>(null);

  useEffect(() => {
    studentApi.getAIStatus().then(setStatus).catch(() => null);
  }, []);

  const handleSend = async (queryToSend?: string) => {
    const query = (queryToSend || inputQuery).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      content: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await studentApi.askAI(query);
      const assistantMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        content: response.answer,
        grounded_data: response.grounded_data,
        intent: response.intent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        content: `Error answering query: ${getApiErrorMessage(err)}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">AI Student Assistant</h1>
            <Badge variant="emerald" size="sm">
              <Sparkles className="w-3 h-3 mr-1 inline" />
              Grounded DB
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ask natural language questions grounded in real-time student database metrics.
          </p>
        </div>

        {status && (
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
            <span className="font-medium">Mode:</span>
            <Badge variant={status.configured ? 'emerald' : 'purple'} size="sm">
              {status.mode}
            </Badge>
          </div>
        )}
      </div>

      {/* Suggested Prompts */}
      <Card title="Quick Inquiries" subtitle="Click any prompt to submit directly">
        <div className="flex flex-wrap gap-2">
          {SAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="text-xs bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 border border-slate-200 hover:border-emerald-300 px-3 py-1.5 rounded-lg transition-all text-left flex items-center gap-1.5"
            >
              <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Chat Area */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col h-[520px] overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white ${
                    isUser ? 'bg-slate-800' : 'bg-emerald-600 shadow-sm'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/60'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* Grounded Result Display */}
                  {!isUser && msg.grounded_data && (
                    <div className="mt-3 pt-3 border-t border-slate-200/60 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-2">
                        <Database className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Database Query Evidence ({msg.grounded_data.title}):</span>
                      </div>

                      {/* Student list preview */}
                      {msg.grounded_data.students && (
                        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden divide-y divide-slate-100 mt-2">
                          {msg.grounded_data.students.map((s: any) => (
                            <div key={s.id} className="p-2 flex items-center justify-between text-[11px]">
                              <span className="font-medium text-slate-800">{s.full_name}</span>
                              <span className="text-slate-500">{s.course}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Course counts preview */}
                      {msg.grounded_data.data && (
                        <div className="grid grid-cols-2 gap-1.5 mt-2">
                          {msg.grounded_data.data.map((c: any) => (
                            <div key={c.course} className="p-2 bg-white rounded border border-slate-200 text-[11px] flex justify-between">
                              <span className="font-medium truncate text-slate-800">{c.course}</span>
                              <span className="text-emerald-700 font-bold ml-2">{c.count}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <span className={`text-[10px] block mt-1.5 opacity-60 ${isUser ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-md">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div className="bg-slate-100 border border-slate-200/60 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span>Querying grounded database and formulating response...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your question about students, courses, or trends..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            disabled={isLoading}
            className="flex-1 bg-white border border-slate-200 px-3.5 py-2 text-xs sm:text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Button
            size="md"
            onClick={() => handleSend()}
            disabled={isLoading || !inputQuery.trim()}
            icon={<Send className="w-4 h-4" />}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};
