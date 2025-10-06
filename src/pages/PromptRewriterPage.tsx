import React, { useState } from 'react';
import { Bot, Sparkles, Clipboard, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { chatService } from '@/lib/chat';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion, AnimatePresence } from 'framer-motion';
export const PromptRewriterPage: React.FC = () => {
  const [basePrompt, setBasePrompt] = useState('');
  const [genre, setGenre] = useState('Synthwave');
  const [mood, setMood] = useState('Energetic');
  const [isLoading, setIsLoading] = useState(false);
  const [rewrittenPrompt, setRewrittenPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const handleRewrite = async () => {
    if (!basePrompt.trim()) {
      setError('Please enter a base prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setRewrittenPrompt('');
    const fullPrompt = `Rewrite and expand this music prompt for an AI music generator.
    Base Idea: "${basePrompt}"
    Genre: ${genre}
    Mood: ${mood}
    Make it detailed, creative, and ready to be used in a platform like Suno or Udio. Include specific instruments, tempo (BPM), structure, and overall vibe.`;
    // Use a new session for each rewrite to keep context clean
    chatService.newSession();
    let finalResponse = '';
    await chatService.sendMessage(fullPrompt, undefined, (chunk) => {
      finalResponse += chunk;
      setRewrittenPrompt(finalResponse);
    });
    setIsLoading(false);
  };
  const handleCopy = () => {
    navigator.clipboard.writeText(rewrittenPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-5xl font-mono font-bold text-glow-magenta">AI Prompt Rewriter</h1>
        <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
          Transform your simple ideas into detailed, creative prompts for AI music generators.
        </p>
      </header>
      <Alert variant="destructive" className="bg-magenta-900/30 border-magenta-500/50 text-magenta-200">
        <Bot className="h-4 w-4 !text-magenta-400" />
        <AlertTitle>AI Functionality Notice</AlertTitle>
        <AlertDescription>
          The AI prompt rewriter requires API keys to be configured in your environment. This live demo uses a mock response. To use the full feature, please clone the repository, add your keys, and deploy.
        </AlertDescription>
      </Alert>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-neutral-900/50 border-cyan-500/30">
          <CardHeader>
            <CardTitle className="font-mono text-2xl text-glow-cyan flex items-center gap-2">
              <Sparkles /> Your Idea
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="font-semibold text-gray-300">Base Prompt</label>
              <Textarea
                placeholder="e.g., A chill lo-fi beat with piano"
                value={basePrompt}
                onChange={(e) => setBasePrompt(e.target.value)}
                className="min-h-[120px] bg-neutral-950 border-neutral-700 focus:ring-cyan-500 focus:border-cyan-500"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="font-semibold text-gray-300">Genre</label>
                <Select value={genre} onValueChange={setGenre}>
                  <SelectTrigger className="bg-neutral-950 border-neutral-700 focus:ring-cyan-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Synthwave">Synthwave</SelectItem>
                    <SelectItem value="Cyberpunk">Cyberpunk</SelectItem>
                    <SelectItem value="Lo-fi">Lo-fi</SelectItem>
                    <SelectItem value="Vaporwave">Vaporwave</SelectItem>
                    <SelectItem value="Ambient">Ambient</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="font-semibold text-gray-300">Mood</label>
                <Select value={mood} onValueChange={setMood}>
                  <SelectTrigger className="bg-neutral-950 border-neutral-700 focus:ring-cyan-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Energetic">Energetic</SelectItem>
                    <SelectItem value="Calm">Calm</SelectItem>
                    <SelectItem value="Melancholic">Melancholic</SelectItem>
                    <SelectItem value="Epic">Epic</SelectItem>
                    <SelectItem value="Mysterious">Mysterious</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button
              onClick={handleRewrite}
              disabled={isLoading}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-lg py-6 transition-all duration-300 hover:shadow-glow-cyan"
            >
              {isLoading ? 'Rewriting...' : 'Rewrite Prompt'}
            </Button>
          </CardContent>
        </Card>
        <Card className="bg-neutral-900/50 border-lime-500/30">
          <CardHeader>
            <CardTitle className="font-mono text-2xl text-glow-lime flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot /> AI Enhanced Prompt
              </div>
              {rewrittenPrompt && !isLoading && (
                <Button variant="ghost" size="icon" onClick={handleCopy}>
                  {copied ? <Check className="w-5 h-5 text-lime-400" /> : <Clipboard className="w-5 h-5" />}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AnimatePresence mode="wait">
              {isLoading && !rewrittenPrompt && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full min-h-[200px] text-gray-400"
                >
                  <Bot className="w-12 h-12 animate-pulse" />
                  <p className="mt-4 font-semibold">AI is thinking...</p>
                </motion.div>
              )}
              {!isLoading && !rewrittenPrompt && (
                <motion.div
                  key="initial"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-full min-h-[200px] text-gray-500"
                >
                  <p>Your enhanced prompt will appear here.</p>
                </motion.div>
              )}
              {rewrittenPrompt && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="prose prose-invert prose-p:text-gray-300 prose-strong:text-lime-400 bg-neutral-950 p-4 rounded-md min-h-[200px]"
                >
                  <p>{rewrittenPrompt}{isLoading && <span className="animate-pulse">|</span>}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};