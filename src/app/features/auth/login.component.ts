import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService, apiErrorMessage } from '../../core/services/api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <main class="login-page">
      <section class="card login-card">
        <h1>Sign in</h1>
        <p>Sign in with your ShopKhata account.</p>
        @if (error) { <p class="field-error" role="alert">{{ error }}</p> }
        <form (ngSubmit)="submit()">
          <div class="form-group">
            <label for="userName">Username</label>
            <input id="userName" name="userName" [(ngModel)]="userName" autocomplete="username" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input id="password" name="password" type="password" [(ngModel)]="password" autocomplete="current-password" required>
          </div>
          <button class="btn btn-primary" type="submit" [disabled]="busy || !userName.trim() || !password">
            {{ busy ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>
      </section>
    </main>
  `,
  styles: [`
    .login-page { min-height: 100vh; display: grid; place-items: center; padding: 24px; background: #f4f6f9; }
    .login-card { width: min(100%, 420px); padding: 28px; }
    .login-card form { display: grid; gap: 16px; }
    .login-card button { justify-self: start; }
  `],
})
export class LoginComponent {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  userName = '';
  password = '';
  busy = false;
  error = this.route.snapshot.queryParamMap.get('error') ?? '';

  async submit(): Promise<void> {
    if (!this.userName.trim() || !this.password || this.busy) return;
    this.busy = true;
    this.error = '';
    try {
      await firstValueFrom(this.api.login(this.userName.trim(), this.password));
      await this.router.navigateByUrl('/dashboard');
    } catch (error) {
      this.error = apiErrorMessage(error);
    } finally {
      this.busy = false;
    }
  }
}
