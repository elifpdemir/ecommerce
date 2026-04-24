import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface ChatResponse {
  reply: string;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './ai-assistant.component.html',
  styleUrls: ['./ai-assistant.component.scss']
})
export class AiAssistantComponent implements OnDestroy {
  private readonly AI_API = 'http://localhost:8001/chat';

  isOpen = false;
  inputText = '';
  isTyping = false;
  apiOnline = true;

  messages: Message[] = [
    {
      role: 'assistant',
      text: 'Hello! 👋 I can help you with questions about products, orders, and your account.',
      timestamp: new Date()
    }
  ];

  quickReplies = [
    'What are the best sellers?',
    'How many products are there?',
    'Which categories are available?',
    'What is the most expensive product?'
  ];

  private destroy$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
  }

  sendQuickReply(text: string) {
    this.inputText = text;
    this.send();
  }

  send() {
    const trimmed = this.inputText.trim();
    if (!trimmed || this.isTyping) return;

    this.messages.push({ role: 'user', text: trimmed, timestamp: new Date() });
    this.inputText = '';
    this.isTyping = true;
    setTimeout(() => this.scrollToBottom(), 50);

    this.http.post<ChatResponse>(this.AI_API, { message: trimmed })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.apiOnline = true;
          this.messages.push({ role: 'assistant', text: res.reply, timestamp: new Date() });
          this.isTyping = false;
          setTimeout(() => this.scrollToBottom(), 50);
        },
        error: () => {
          this.apiOnline = false;
          this.messages.push({
            role: 'assistant',
            text: '⚠️ The AI service is currently unavailable. Please try again later.',
            timestamp: new Date()
          });
          this.isTyping = false;
          setTimeout(() => this.scrollToBottom(), 50);
        }
      });
  }

  private scrollToBottom() {
    const el = document.querySelector('.chat__messages');
    if (el) el.scrollTop = el.scrollHeight;
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }
}
