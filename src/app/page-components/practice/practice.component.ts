import { Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeaderService } from '../../services/header.service';

@Component({
  selector: 'practice',
  standalone: true,
  imports: [ CommonModule, RouterLink ],
  templateUrl: './practice.component.html',
  styleUrl: './practice.component.scss'
})

export class PracticeComponent implements OnInit {

  constructor(private headerService: HeaderService) {}

  ngOnInit(): void {
    this.headerService.showHeader$.next(false);
  }
}