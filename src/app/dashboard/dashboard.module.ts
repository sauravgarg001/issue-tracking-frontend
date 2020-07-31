import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { IssueComponent } from './issue/issue.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';




@NgModule({
  declarations: [DashboardComponent, IssueComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: 'dashboard', component: DashboardComponent },
      { path: 'issue/:issueId', component: IssueComponent },
    ]),
    FormsModule,
    FontAwesomeModule,
    CKEditorModule
  ]
})
export class DashboardModule { }
