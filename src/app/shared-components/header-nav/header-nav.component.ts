import { Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HeaderService } from '../../services/header.service';

@Component({
  selector: 'header-nav',
  standalone: true,
  imports: [ CommonModule, RouterLink, RouterLinkActive ],
  templateUrl: './header-nav.component.html',
  styleUrl: './header-nav.component.scss'
})

export class HeaderNavComponent implements OnInit {

  public title: string = "Spanish 21";

  constructor(public headerService: HeaderService) {}

  ngOnInit(): void {}
}





