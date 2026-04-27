import { Component, OnDestroy, ChangeDetectorRef, OnInit, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../core/auth/auth.service';
import * as Plotly from 'plotly.js-dist-min';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  chartData?: any;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ai-assistant.component.html',
  styleUrls: ['./ai-assistant.component.scss']
})
export class AiAssistantComponent implements OnInit, OnDestroy, AfterViewChecked {
  private readonly AI_API = 'http://localhost:8081/api/chat/ask';

  isOpen = false;
  inputText = '';
  isTyping = false;
  apiOnline = true;
  private currentUserEmail: string | null = null;

  messages: Message[] = [];
  quickReplies: string[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef,
    private auth: AuthService,
    private el: ElementRef
  ) {}

  ngOnInit() {
    this.auth.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.checkUserChange(user);
    });
  }

  private checkUserChange(user: any) {
    const email = user ? user.sub : null;
    const role = this.auth.getRole();
    
    if (email !== this.currentUserEmail) {
      this.currentUserEmail = email;
      this.messages = [];
      
      const userName = email ? email.split('@')[0] : 'Guest';
      let welcomeText = `Hello ${userName}! I am your AI Assistant. How can I help you today?`;
      
      if (role === 'ADMIN') {
        welcomeText = `Welcome Admin ${userName}! I can help with sales reports and system analytics. Try: "Show total sales by category as a chart"`;
        this.quickReplies = [
          'En çok harcama yapan 3 kişiyi getir',
          'Hangi şehirden ne kadar sipariş verilmiş?',
          'En düşük puan alan ürünler hangileri?',
          'Depoların gönderim sayılarını listele'
        ];
      } else if (role === 'CORPORATE') {
        welcomeText = `Hello Seller ${userName}! I can help you track your products and revenue. Try: "Show my monthly revenue as a chart"`;
        this.quickReplies = [
          'En çok satan ürünlerim neler?',
          'Toplam kazancım ne kadar?',
          'Bekleyen siparişlerim hangileri?'
        ];
      } else if (role === 'INDIVIDUAL') {
        welcomeText = `Hello ${userName}! I am your shopping assistant. Try: "What is the status of my last order?" or "Which products have the best ratings?"`;
        this.quickReplies = [
          'Son siparişimin durumu ne?',
          'En yüksek puanlı ürünler hangileri?',
          'Bana ürün önerir misin?'
        ];
      } else {
        this.quickReplies = [
          'Hangi kategorilerde ürün var?',
          'En popüler ürünler neler?'
        ];
      }

      this.messages.push({
        role: 'assistant',
        text: welcomeText,
        timestamp: new Date()
      });
      this.cdr.detectChanges();
    }
  }

  ngAfterViewChecked() {
    this.initCharts();
  }

  private initCharts() {
    const containers = this.el.nativeElement.querySelectorAll('.chart-render-area');
    containers.forEach((container: any) => {
      if (container.getAttribute('data-rendered')) return;
      
      const chartId = container.getAttribute('data-chart-id');
      const message = this.messages[parseInt(chartId)];
      if (message && message.chartData) {
        try {
          const labels = message.chartData.map((d: any) => d.label || d.category || d.name || d.city || 'N/A');
          const values = message.chartData.map((d: any) => d.value || d.total || d.count || d.total_orders_from_city || d.shipment_count || 0);

          const data: any[] = [{
            x: labels,
            y: values,
            type: 'bar',
            marker: {
              color: 'rgb(99, 102, 241)',
              opacity: 0.7
            }
          }];

          const layout = {
            height: 250,
            margin: { t: 20, b: 40, l: 40, r: 20 },
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            font: { size: 10 },
            showlegend: false
          };

          Plotly.newPlot(container, data, layout, { responsive: true, displayModeBar: false });
          container.setAttribute('data-rendered', 'true');
        } catch (e) {
          console.error('Plotly error:', e);
        }
      }
    });
  }

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
    this.cdr.detectChanges();
    setTimeout(() => this.scrollToBottom(), 50);

    this.http.get(this.AI_API + '?message=' + encodeURIComponent(trimmed), { responseType: 'text' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: string) => {
          this.apiOnline = true;
          let botText = res;
          let chartData = null;

          const chartMarker = '[CHART_JSON]';
          if (res.includes(chartMarker)) {
            const index = res.indexOf(chartMarker);
            botText = res.substring(0, index).trim();
            let jsonStr = res.substring(index + chartMarker.length).trim();
            
            jsonStr = jsonStr.replace(/```json/gi, '').replace(/```/g, '').trim();

            try {
              chartData = JSON.parse(jsonStr);
            } catch (e) {
              console.warn('Truncated or invalid JSON, skipping chart:', e);
            }
          }

          this.messages.push({ 
            role: 'assistant', 
            text: botText, 
            timestamp: new Date(),
            chartData: chartData
          });
          this.isTyping = false;
          this.cdr.detectChanges();
          setTimeout(() => this.scrollToBottom(), 50);
        },
        error: (err) => {
          console.error("Bağlantı hatası:", err);
          this.apiOnline = false;
          this.messages.push({
            role: 'assistant',
            text: '⚠️ Java Backend kapalı veya bağlantı hatası var.',
            timestamp: new Date()
          });
          this.isTyping = false;
          this.cdr.detectChanges();
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

  formatMessage(text: string): string {
    if (!text) return '';
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
      .replace(/---/g, '<hr style="border:0; border-top:1px solid #eee; margin:10px 0;">')
      .replace(/\n/g, '<br>');
    return formatted;
  }
}
