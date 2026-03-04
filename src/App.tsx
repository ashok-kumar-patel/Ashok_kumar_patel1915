import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Image as ImageIcon, 
  Code, 
  FileText, 
  Mic, 
  Search, 
  Settings, 
  LayoutDashboard, 
  Zap, 
  BarChart3, 
  Plus, 
  Send,
  User,
  Bot,
  Loader2,
  Download,
  Smartphone,
  Monitor,
  Terminal,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Markdown from 'react-markdown';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import { cn } from './lib/utils';
import { generateChatResponse, generateImage, analyzeData } from './services/gemini';

// --- Types ---
type Tool = 'chat' | 'image' | 'code' | 'docs' | 'data' | 'automation' | 'platforms';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'text' | 'image' | 'chart';
  data?: any;
}

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-white/10 text-white shadow-lg shadow-black/5" 
        : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
    )}
  >
    <Icon size={20} className={cn("transition-transform group-hover:scale-110", active ? "text-emerald-400" : "")} />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

export default function App() {
  const [activeTool, setActiveTool] = useState<Tool>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      if (activeTool === 'chat') {
        const response = await generateChatResponse([...messages, userMsg].map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content })));
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: response || '' }]);
      } else if (activeTool === 'image') {
        const imageUrl = await generateImage(input);
        if (imageUrl) {
          setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'Generated your image:', type: 'image', data: imageUrl }]);
        }
      } else if (activeTool === 'data') {
        const analysis = await analyzeData({ sample: "data" }, input);
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: analysis.analysis, type: 'chart', data: analysis.chartData }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: 'An error occurred. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col p-4 bg-[#0D0D0D]">
        <div className="flex items-center gap-3 px-4 py-6 mb-4">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sparkles size={18} className="text-black" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">OmniAI</h1>
        </div>

        <nav className="flex-1 space-y-1">
          <SidebarItem icon={MessageSquare} label="AI Assistant" active={activeTool === 'chat'} onClick={() => setActiveTool('chat')} />
          <SidebarItem icon={ImageIcon} label="Image Studio" active={activeTool === 'image'} onClick={() => setActiveTool('image')} />
          <SidebarItem icon={Code} label="Code Engine" active={activeTool === 'code'} onClick={() => setActiveTool('code')} />
          <SidebarItem icon={FileText} label="Doc Editor" active={activeTool === 'docs'} onClick={() => setActiveTool('docs')} />
          <SidebarItem icon={BarChart3} label="Data Analytics" active={activeTool === 'data'} onClick={() => setActiveTool('data')} />
          <SidebarItem icon={Zap} label="Automation" active={activeTool === 'automation'} onClick={() => setActiveTool('automation')} />
          <div className="pt-4 mt-4 border-t border-white/5">
            <SidebarItem icon={Terminal} label="Platform Export" active={activeTool === 'platforms'} onClick={() => setActiveTool('platforms')} />
          </div>
        </nav>

        <div className="mt-auto p-4 bg-white/5 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
              <User size={20} />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Pro User</p>
              <p className="text-xs text-zinc-500">Enterprise Plan</p>
            </div>
          </div>
          <button className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors">
            <Settings size={14} />
            Settings
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 border-bottom border-white/5 flex items-center justify-between px-8 bg-[#0A0A0A]/80 backdrop-blur-xl z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-500">
              {activeTool === 'chat' && "Conversational Intelligence"}
              {activeTool === 'image' && "Visual Synthesis"}
              {activeTool === 'code' && "Algorithmic Generation"}
              {activeTool === 'docs' && "Editorial Suite"}
              {activeTool === 'data' && "Quantitative Analysis"}
              {activeTool === 'automation' && "Workflow Orchestration"}
              {activeTool === 'platforms' && "Multi-Platform Architecture"}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">System Online</span>
            </div>
          </div>
        </header>

        {/* Workspace */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTool}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col p-8"
            >
              {activeTool === 'chat' || activeTool === 'image' || activeTool === 'data' ? (
                <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
                  <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto space-y-6 pr-4 scrollbar-thin scrollbar-thumb-zinc-800"
                  >
                    {messages.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                        <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center border border-white/10">
                          <Sparkles size={40} className="text-emerald-500" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">How can I assist you today?</h3>
                          <p className="text-zinc-500 max-w-md">
                            I'm your universal AI partner, ready to help with research, creative tasks, coding, and more.
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                          {[
                            "Analyze market trends for 2025",
                            "Generate a futuristic city concept",
                            "Write a Python script for data scraping",
                            "Create a business proposal template"
                          ].map((suggestion) => (
                            <button 
                              key={suggestion}
                              onClick={() => setInput(suggestion)}
                              className="p-4 text-left text-sm bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-zinc-400 hover:text-white"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {messages.map((msg) => (
                      <div 
                        key={msg.id}
                        className={cn(
                          "flex gap-4 max-w-[85%]",
                          msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                          msg.role === 'user' ? "bg-zinc-800" : "bg-emerald-500/20 border border-emerald-500/30"
                        )}>
                          {msg.role === 'user' ? <User size={16} /> : <Bot size={16} className="text-emerald-500" />}
                        </div>
                        <div className={cn(
                          "p-4 rounded-2xl space-y-3",
                          msg.role === 'user' ? "bg-emerald-600 text-white" : "bg-white/5 border border-white/10"
                        )}>
                          <div className="prose prose-invert prose-sm max-w-none">
                            <Markdown>{msg.content}</Markdown>
                          </div>
                          
                          {msg.type === 'image' && (
                            <img 
                              src={msg.data} 
                              alt="Generated" 
                              className="rounded-xl border border-white/10 w-full shadow-2xl"
                              referrerPolicy="no-referrer"
                            />
                          )}

                          {msg.type === 'chart' && (
                            <div className="h-64 w-full bg-black/20 rounded-xl p-4 border border-white/5">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={msg.data}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                  <XAxis dataKey="name" stroke="#666" fontSize={12} />
                                  <YAxis stroke="#666" fontSize={12} />
                                  <Tooltip 
                                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                                    itemStyle={{ color: '#10b981' }}
                                  />
                                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                          <Loader2 size={16} className="text-emerald-500 animate-spin" />
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input Area */}
                  <div className="mt-8 relative">
                    <div className="absolute inset-0 bg-emerald-500/5 blur-2xl rounded-full" />
                    <div className="relative bg-white/5 border border-white/10 rounded-2xl p-2 flex items-end gap-2 focus-within:border-emerald-500/50 transition-all shadow-2xl">
                      <button className="p-3 text-zinc-500 hover:text-white transition-colors">
                        <Plus size={20} />
                      </button>
                      <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                        placeholder={`Ask anything for ${activeTool}...`}
                        className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-zinc-600 py-3 resize-none max-h-40 min-h-[48px]"
                        rows={1}
                      />
                      <div className="flex items-center gap-1 p-1">
                        <button className="p-2 text-zinc-500 hover:text-emerald-500 transition-colors">
                          <Mic size={20} />
                        </button>
                        <button 
                          onClick={handleSend}
                          disabled={!input.trim() || loading}
                          className="p-2 bg-emerald-500 text-black rounded-xl hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20"
                        >
                          <Send size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTool === 'docs' ? (
                <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="text-emerald-500" />
                      <h3 className="text-xl font-bold text-white">Editorial Suite</h3>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold hover:bg-white/10 transition-all">
                        Export PDF
                      </button>
                      <button className="px-4 py-2 bg-emerald-500 text-black rounded-xl text-xs font-semibold hover:bg-emerald-400 transition-all">
                        Save Draft
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl p-8 shadow-inner">
                    <textarea 
                      className="w-full h-full bg-transparent border-none focus:ring-0 text-zinc-300 font-serif text-lg leading-relaxed resize-none"
                      placeholder="Start writing your masterpiece..."
                      defaultValue={`# Project OmniAI: Strategic Vision 2026\n\n## Abstract\nThe convergence of multimodal intelligence and edge computing represents the next frontier in human-machine collaboration. OmniAI is designed to bridge the gap between raw data and actionable wisdom.\n\n## Core Pillars\n1. **Ubiquity**: Seamless transition between mobile, desktop, and ambient interfaces.\n2. **Autonomy**: Self-orchestrating workflows that anticipate user needs.\n3. **Integrity**: Privacy-first architecture with local-first processing capabilities.`}
                    />
                  </div>
                </div>
              ) : activeTool === 'code' ? (
                <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Terminal className="text-emerald-500" />
                      <h3 className="text-xl font-bold text-white">Algorithmic Workspace</h3>
                    </div>
                    <div className="flex items-center gap-4">
                      <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-zinc-400 outline-none focus:border-emerald-500/50">
                        <option>Python 3.11</option>
                        <option>TypeScript 5.0</option>
                        <option>Rust 1.75</option>
                      </select>
                      <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black rounded-xl text-xs font-bold hover:bg-emerald-400 transition-all">
                        <Zap size={14} /> Run Script
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 grid grid-cols-3 gap-6">
                    <div className="col-span-2 bg-[#050505] border border-white/10 rounded-3xl p-6 font-mono text-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20">
                          <Download size={16} />
                        </button>
                      </div>
                      <pre className="text-emerald-400/80 leading-relaxed">
{`import torch
import torch.nn as nn

class OmniTransformer(nn.Module):
    def __init__(self, d_model, nhead):
        super().__init__()
        self.encoder = nn.TransformerEncoderLayer(
            d_model=d_model, 
            nhead=nhead
        )
        
    def forward(self, x):
        return self.encoder(x)

# Initialize the core intelligence module
model = OmniTransformer(d_model=512, nhead=8)
print("OmniAI Core Initialized.")`}
                      </pre>
                    </div>
                    <div className="space-y-6">
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Debug Console</h4>
                        <div className="space-y-2 font-mono text-[10px]">
                          <p className="text-emerald-500">[SYSTEM] Kernel initialized</p>
                          <p className="text-zinc-500">[INFO] Loading weights...</p>
                          <p className="text-zinc-500">[INFO] GPU acceleration active</p>
                          <p className="text-emerald-500">[SUCCESS] Ready for inference</p>
                        </div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">AI Suggestions</h4>
                        <div className="space-y-3">
                          {[
                            "Optimize memory allocation",
                            "Add layer normalization",
                            "Implement attention masks"
                          ].map(s => (
                            <div key={s} className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white cursor-pointer group">
                              <ChevronRight size={12} className="text-emerald-500 group-hover:translate-x-1 transition-transform" />
                              {s}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTool === 'automation' ? (
                <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Zap className="text-emerald-500" />
                      <h3 className="text-xl font-bold text-white">Workflow Orchestration</h3>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black rounded-xl text-xs font-bold hover:bg-emerald-400 transition-all">
                      <Plus size={14} /> New Workflow
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { title: "Daily News Briefing", status: "Active", triggers: "08:00 AM Daily", actions: 4 },
                      { title: "GitHub Repo Monitor", status: "Paused", triggers: "On Push Event", actions: 2 },
                      { title: "Smart Invoice Processing", status: "Active", triggers: "New Email Attachment", actions: 5 },
                      { title: "Social Media Auto-Post", status: "Draft", triggers: "Manual Trigger", actions: 3 }
                    ].map((workflow) => (
                      <div key={workflow.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-12 h-12 rounded-xl flex items-center justify-center",
                              workflow.status === 'Active' ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-500"
                            )}>
                              <Zap size={24} />
                            </div>
                            <div>
                              <h4 className="font-bold text-white group-hover:text-emerald-400 transition-colors">{workflow.title}</h4>
                              <p className="text-xs text-zinc-500">{workflow.triggers} • {workflow.actions} actions</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={cn(
                              "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md",
                              workflow.status === 'Active' ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-500"
                            )}>
                              {workflow.status}
                            </span>
                            <button className="p-2 text-zinc-500 hover:text-white">
                              <Settings size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-8 text-center space-y-4">
                    <h4 className="text-lg font-bold text-emerald-500">Autonomous Agent Mode</h4>
                    <p className="text-zinc-400 text-sm max-w-xl mx-auto">
                      Enable OmniAI to perform complex multi-step tasks independently. 
                      Agents can browse the web, interact with APIs, and manage files on your behalf.
                    </p>
                    <button className="px-6 py-3 bg-emerald-500 text-black font-bold rounded-2xl hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20">
                      Activate Agent
                    </button>
                  </div>
                </div>
              ) : activeTool === 'platforms' ? (
                <div className="max-w-6xl mx-auto w-full grid grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <Smartphone className="text-emerald-500" />
                      <h3 className="text-xl font-bold">Android Mobile App</h3>
                    </div>
                    <div className="bg-zinc-900 rounded-2xl border border-white/5 p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Kotlin / Jetpack Compose</span>
                        <button className="flex items-center gap-2 text-xs text-emerald-500 hover:underline">
                          <Download size={14} /> Download Source
                        </button>
                      </div>
                      <div className="font-mono text-[10px] text-zinc-400 bg-black/40 p-4 rounded-xl overflow-x-auto">
                        <pre>{`// MainActivity.kt
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            OmniAITheme {
                MainScreen()
            }
        }
    }
}

@Composable
fun MainScreen(viewModel: AIViewModel = viewModel()) {
    Scaffold(
        bottomBar = { ChatInput(onSend = { viewModel.sendMessage(it) }) }
    ) { padding ->
        ChatList(messages = viewModel.messages, modifier = Modifier.padding(padding))
    }
}`}</pre>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <Monitor className="text-emerald-500" />
                      <h3 className="text-xl font-bold">Desktop Software</h3>
                    </div>
                    <div className="bg-zinc-900 rounded-2xl border border-white/5 p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Electron / React</span>
                        <button className="flex items-center gap-2 text-xs text-emerald-500 hover:underline">
                          <Download size={14} /> Download Source
                        </button>
                      </div>
                      <div className="font-mono text-[10px] text-zinc-400 bg-black/40 p-4 rounded-xl overflow-x-auto">
                        <pre>{`// main.js
const { app, BrowserWindow } = require('electron')

function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true
    }
  })
  win.loadURL('http://localhost:3000')
}

app.whenReady().then(createWindow)`}</pre>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-8 flex items-center justify-between">
                    <div className="space-y-2">
                      <h4 className="text-lg font-bold text-emerald-500">Universal Backend Engine</h4>
                      <p className="text-zinc-400 text-sm max-w-2xl">
                        The core AI logic is unified across all platforms. Our FastAPI backend handles vector embeddings, 
                        long-term memory via FAISS, and real-time inference orchestration.
                      </p>
                    </div>
                    <button className="px-6 py-3 bg-emerald-500 text-black font-bold rounded-2xl hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20">
                      Deploy Backend
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-zinc-500 italic">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Loader2 className="animate-spin" />
                    </div>
                    <p>Tool "{activeTool}" is currently being optimized for your workflow.</p>
                    <button 
                      onClick={() => setActiveTool('chat')}
                      className="text-emerald-500 hover:underline text-sm not-italic"
                    >
                      Return to Chat
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
