import { Component,OnInit,inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LayoutService } from '../../../core/services/layout.service';
import { DataService } from '../../../core/services/data.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserProfile } from '../../../core/models/settings.model';
import { initials } from '../../../core/utils/formatters';
@Component({selector:'app-profile',standalone:true,imports:[FormsModule],template:`<div class="page-head"><h1>My Profile</h1></div><div class="card profile-layout"><div class="profile-avatar">{{initials(profile.name)}}</div><div><form (ngSubmit)="save()"><div class="form-grid"><div class="form-group"><label>Name</label><input [(ngModel)]="profile.name" name="name"></div><div class="form-group"><label>Username</label><input [(ngModel)]="profile.username" name="username"></div><div class="form-group"><label>Role</label><input [(ngModel)]="profile.role" name="role"></div><div class="form-group"><label>Mobile</label><input [(ngModel)]="profile.mobile" name="mobile"></div></div><button class="btn btn-primary" type="submit">Save Profile</button></form><p class="text-muted">This is a frontend-only demo; no authentication is performed.</p></div></div>`})
export class ProfileComponent implements OnInit {
  private layout=inject(LayoutService);private data=inject(DataService);private toast=inject(ToastService);profile:UserProfile=this.data.getProfile();initials=initials;
  ngOnInit(){this.layout.setTitle('My Profile');}
  save(){this.data.saveProfile({...this.profile});this.toast.show('Profile Saved','Profile updated successfully','success');}
}
