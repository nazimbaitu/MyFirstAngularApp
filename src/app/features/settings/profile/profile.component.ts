import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { LayoutService } from '../../../core/services/layout.service';
import { DataService } from '../../../core/services/data.service';
import { ToastService } from '../../../core/services/toast.service';
import { ApiService, apiErrorMessage } from '../../../core/services/api.service';
import { EmployeeDto } from '../../../core/models/api.models';
import { UserProfile } from '../../../core/models/settings.model';
import { initials } from '../../../core/utils/formatters';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="page-head"><h1>My Profile</h1></div>
    <div class="card profile-layout">
      <div class="profile-avatar">{{initials(profile.name)}}</div>
      <div>
        <form (ngSubmit)="save()">
          <div class="form-grid">
            <div class="form-group"><label for="name">Name</label><input id="name" [(ngModel)]="profile.name" name="name" required></div>
            <div class="form-group"><label for="username">Username</label><input id="username" [value]="profile.username" readonly></div>
            <div class="form-group"><label for="role">Role</label><input id="role" [value]="profile.role" readonly></div>
            <div class="form-group"><label for="mobile">Mobile</label><input id="mobile" [(ngModel)]="profile.mobile" name="mobile"></div>
          </div>
          <button class="btn btn-primary" type="submit" [disabled]="saving">{{saving ? 'Saving…' : 'Save Profile'}}</button>
        </form>
      </div>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  private readonly layout = inject(LayoutService);
  private readonly data = inject(DataService);
  private readonly toast = inject(ToastService);
  private readonly api = inject(ApiService);
  profile: UserProfile = { ...this.data.getProfile() };
  readonly initials = initials;
  saving = false;

  ngOnInit(): void { this.layout.setTitle('My Profile'); }

  async save(): Promise<void> {
    if (!this.profile.name.trim()) {
      this.toast.show('Validation Error', 'Name is required.', 'error');
      return;
    }
    this.saving = true;
    try {
      const saved = await firstValueFrom(this.api.put<EmployeeDto>('/profile', {
        name: this.profile.name.trim(), mobile: this.profile.mobile.trim() || null,
      }));
      this.profile = { ...this.profile, name: saved.name, mobile: saved.mobile ?? '' };
      this.data.saveProfile(this.profile);
      this.data.saveSettings({ ...this.data.getSettings(), ownerName: saved.name });
      this.toast.show('Profile Saved', 'Profile saved to the database.', 'success');
    } catch (error) {
      this.toast.show('Save Failed', apiErrorMessage(error), 'error');
    } finally {
      this.saving = false;
    }
  }
}
