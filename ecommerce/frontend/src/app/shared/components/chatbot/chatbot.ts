import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Message {
  role: 'user' | 'bot';
  text: string;
  time: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.scss'
})
export class ChatbotComponent {
  isOpen = signal(false);
  input = '';
  loading = false;

  messages: Message[] = [
    {
      role: 'bot',
      text: 'Hello! I can answer your questions about e-commerce data. For example, you can ask: "What is the most reviewed product?"',
      time: this.now()
    }
  ];

  constructor(private http: HttpClient) {}

  toggle() {
    this.isOpen.update(v => !v);
  }

  send() {
    const text = this.input.trim();
    if (!text || this.loading) return;

    this.messages.push({ role: 'user', text, time: this.now() });
    this.input = '';
    this.loading = true;

    this.http.post<{ reply: string }>('http://localhost:8001/chat', { message: text })
      .subscribe({
        next: (res) => {
          this.messages.push({ role: 'bot', text: res.reply, time: this.now() });
          this.loading = false;
          this.scrollToBottom();
        },
        error: () => {
          this.messages.push({
            role: 'bot',
            text: 'The AI service is currently unavailable. Please try again later.',
            time: this.now()
          });
          this.loading = false;
          this.scrollToBottom();
        }
      });

    this.scrollToBottom();
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.send();
    }
  }

  private now(): string {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  private scrollToBottom() {
    setTimeout(() => {
      const el = document.getElementById('chat-messages');
      if (el) el.scrollTop = el.scrollHeight;
    }, 50);
  }
}
