import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div style="min-height:100vh; display:flex; flex-direction:column;">
      <!-- Navbar -->
      <nav class="glass" style="position:sticky; top:0; z-index:50; margin:1rem; padding:1rem 1.5rem; display:flex; align-items:center; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.1);">
        <a routerLink="/" style="display:flex; align-items:center; gap:0.75rem; text-decoration:none;">
          <div style="width:2.5rem; height:2.5rem; background:linear-gradient(135deg,#003189,#1a4db5); border-radius:0.625rem; display:flex; align-items:center; justify-content:center; color:#FFD700; font-weight:900; font-size:1.25rem; box-shadow:0 4px 16px rgba(0,49,137,0.4);">P</div>
          <h1 style="font-size:1.25rem; font-weight:700; letter-spacing:-0.025em; color:white;">Paris <span style="color:#FFD700;">Events</span> AI</h1>
        </a>
        
        <div style="display:flex; align-items:center; gap:1.5rem;">
          <a routerLink="/" 
             routerLinkActive="active-link" 
             [routerLinkActiveOptions]="{exact: true}"
             style="font-size:0.875rem; font-weight:500; color:rgba(255,255,255,0.7); text-decoration:none; transition:color 0.2s;">Predictor</a>
          <a routerLink="/schema" 
             routerLinkActive="active-link"
             style="font-size:0.875rem; font-weight:500; color:rgba(255,255,255,0.7); text-decoration:none; transition:color 0.2s;">API Schema</a>
          <a href="https://github.com/nigrelia" target="_blank" rel="noopener" style="display:flex; align-items:center; padding:0.5rem; border-radius:50%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); color:rgba(255,255,255,0.7);">
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12"/></svg>
          </a>
        </div>
      </nav>

      <!-- Main Content -->
      <main style="flex-grow:1; width:100%; max-width:80rem; margin:0 auto; padding:0 1rem 3rem;">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer style="padding:2rem; text-align:center; font-size:0.875rem; color:rgba(255,255,255,0.3);">
        <p>&copy; 2026 Paris Events AI Project. Built for advanced cultural analysis.</p>
      </footer>
    </div>
  `,
  styles: [`
    .active-link { color: #FFD700 !important; }
    a:hover { color: #FFD700; }
  `]
})
export class AppComponent {}
