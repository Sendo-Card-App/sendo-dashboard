import { Component } from '@angular/core';

import { CommonModule } from '@angular/common';

// project import
import { SharedModule } from 'src/app/demo/shared/shared.module';

@Component({
  selector: 'app-ut-alluser',
  imports: [CommonModule, SharedModule],
  templateUrl: './ut-alluser.component.html',
  styleUrl: './ut-alluser.component.scss'
})
export class UtAlluserComponent {

}
