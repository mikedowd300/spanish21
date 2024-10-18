import { Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeaderService } from '../../services/header.service';

@Component({
  selector: 'home',
  standalone: true,
  imports: [ CommonModule, RouterLink ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})

export class HomeComponent implements OnInit {

  constructor(private headerService: HeaderService) {}

  ngOnInit(): void {
    this.headerService.showHeader$.next(true);
  }
}