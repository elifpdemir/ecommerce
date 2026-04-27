import { Component, signal, ViewChildren, QueryList, ElementRef, AfterViewChecked, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Chart from 'chart.js/auto';
import { AuthService } from '../../../core/auth/auth.service';
import { Subject, takeUntil } from 'rxjs';

interface Message {
  role: 'user' | 'bot';
  text: string;
  time: string;
  chartData?: any;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrl: './chatbot.scss'
})
export class ChatbotComponent implements OnInit, AfterViewChecked, OnDestroy {
  isOpen = signal(false);
  input = '';
  loading = false;
  private charts: Chart[] = [];
  messages: Message[] = [];
  private destroy$ = new Subject<void>();
  private currentUserEmail: string | null = null;

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private el: ElementRef
  ) {}

  ngOnInit() {
    this.auth.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      console.log('Chatbot user change detected:', user);
      this.checkUserChange(user);
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkUserChange(user: any) {
    const email = user ? user.sub : null;
    const role = this.auth.getRole();
    
    if (email !== this.currentUserEmail) {
      console.log(`Clearing history: ${this.currentUserEmail} -> ${email}`);
      this.currentUserEmail = email;
      this.messages = [];
      
      const userName = email ? email.split('@')[0] : 'Guest';
      let welcomeText = `Hello ${userName}! I am your AI Assistant. How can I help you today?`;
      
      if (role === 'ADMIN') {
        welcomeText = `Welcome Admin ${userName}! I can help with sales reports and system analytics. Try: "Show total sales by category as a chart"`;
      } else if (role === 'CORPORATE') {
        welcomeText = `Hello Seller ${userName}! I can help you track your products and revenue. Try: "Show my monthly revenue as a chart"`;
      } else if (role === 'INDIVIDUAL') {
        welcomeText = `Hello ${userName}! I am your shopping assistant. Try: "What is the status of my last order?" or "Which products have the best ratings?"`;
      }

      this.messages.push({
        role: 'bot',
        text: welcomeText,
        time: this.now()
      });
    }
  }

  ngAfterViewChecked() {
    this.initCharts();
  }

  private initCharts() {
    const canvases = this.el.nativeElement.querySelectorAll('canvas[data-chart]');
    canvases.forEach((canvas: any) => {
      if (canvas.getAttribute('data-rendered')) return;
      
      const chartId = canvas.getAttribute('data-chart');
      const message = this.messages[parseInt(chartId)];
      if (message && message.chartData) {
        try {
          new Chart(canvas, {
            type: 'bar',
            data: {
              labels: message.chartData.map((d: any) => d.label || d.category || d.name || 'N/A'),
              datasets: [{
                label: 'Analysis Result',
                data: message.chartData.map((d: any) => d.value || d.total || d.count || 0),
                backgroundColor: 'rgba(99, 102, 241, 0.5)',
                borderColor: 'rgb(99, 102, 241)',
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              scales: { y: { beginAtZero: true } }
            }
          });
          canvas.setAttribute('data-rendered', 'true');
        } catch (e) {
          console.error('Chart.js error:', e);
        }
      }
    });
  }

  toggle() {
    this.isOpen.update(v => !v);
  }

  send() {
    const text = this.input.trim();
    if (!text || this.loading) return;

    this.messages.push({ role: 'user', text, time: this.now() });
    this.input = '';
    this.loading = true;

    this.http.get(`http://localhost:8081/api/chat/ask?message=${encodeURIComponent(text)}`, { responseType: 'text' })
      .subscribe({
        next: (res) => {
          let botText = res;
          let chartData = null;

          // Better splitting with regex to avoid leftovers
          const chartMarker = '[CHART_JSON]';
          if (res.includes(chartMarker)) {
            const index = res.indexOf(chartMarker);
            botText = res.substring(0, index).trim();
            let jsonStr = res.substring(index + chartMarker.length).trim();
            
            // Clean markdown
            jsonStr = jsonStr.replace(/```json/gi, '').replace(/```/g, '').trim();

            try {
              chartData = JSON.parse(jsonStr);
            } catch (e) {
              console.warn('Truncated or invalid JSON, skipping chart:', e);
            }
          }

          this.messages.push({ 
            role: 'bot', 
            text: botText, 
            time: this.now(),
            chartData: chartData
          });
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
