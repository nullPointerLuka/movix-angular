import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './details.html',
  styleUrl: './details.scss'
})

export class Details implements OnInit {

  @ViewChild('heroBg') heroBg?: ElementRef;

  movie: any;
  nuevoComentario: string = '';
  comentarios: any[] = [];
  badgesMain: string = '';
  badgesSecundarios: string[] = [];
  peliculasGlobal: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    const id = this.route.snapshot.queryParamMap.get('id');
    console.log('ID recibida:', id);
    
    if (!id) return;

    this.http.get<any>('assets/data/movies.json')
      .subscribe(data => {
        this.peliculasGlobal = data.movies;
        this.movie = data.movies.find((m: any) => m.id == id);
        console.log('Película asignada:', this.movie);
        this.cdr.detectChanges();
        
        if (this.movie) {
          this.calcularBadges();
          this.cargarComentarios();
        }
      });
  }

  asset(path: string): string {
    return path;
  }

  calcularBadges() {
    if (!this.movie) return;

    let badges: string[] = [];
    const anio = parseInt(this.movie.anio);
    const currentYear = new Date().getFullYear();

    if (!isNaN(anio) && anio >= currentYear - 1) {
      badges.push("New Release");
    }

    if (typeof this.movie.rating === "number" && this.movie.rating >= 95) {
      badges.push("Top Rated");
    }

    if (typeof this.movie.vistas === "number" && this.movie.vistas >= 10000) {
      badges.push("Trending");
    }

    if (this.movie.duracion?.toLowerCase().includes("episodios")) {
      badges.push("Serie");
    }

    if (Array.isArray(this.movie.badges)) {
      badges = badges.concat(this.movie.badges);
    }

    badges = [...new Set(badges)];

    const prioridadScore: any = {
      "Top Rated": this.movie.rating || 0,
      "Trending": (this.movie.vistas || 0) / 1000,
      "New Release": (!isNaN(anio) && anio >= currentYear - 1) ? 80 : 0,
      "IMAX Enhanced": 60,
      "Serie": 50
    };

    badges.sort((a, b) => {
      if (a === "New Release") return -1;
      if (b === "New Release") return 1;
      return (prioridadScore[b] || 0) - (prioridadScore[a] || 0);
    });

    this.badgesMain = badges[0] || '';
    this.badgesSecundarios = badges.slice(1, 4);
  }

  obtenerClaseBadge(badge: string): string {
    if (badge === "New Release") return "nt-badge nt-badge-new";
    if (badge === "IMAX Enhanced") return "nt-badge nt-badge-imax";
    if (badge === "Top Rated") return "nt-badge nt-badge-top";
    if (badge === "Trending") return "nt-badge nt-badge-trending";
    if (badge === "Serie") return "nt-badge nt-badge-serie";
    return "nt-badge";
  }

  obtenerEstrellas(): boolean[] {
    if (!this.movie) return [];
    const total = Math.round(this.movie.rating / 20);
    return Array(total).fill(true).concat(Array(5 - total).fill(false));
  }

  obtenerClasificacion(): { texto: string; color: string } {
    if (!this.movie) return { texto: 'NR', color: '#999' };

    const clas = this.movie.clasificacion || "NR";
    let color = '#999';

    if (clas === "18+") color = "#ff4d4d";
    else if (clas === "16+") color = "#ff944d";
    else if (clas === "13+") color = "#ffd24d";
    else if (clas === "7+") color = "#4dff88";

    return { texto: clas, color };
  }

  cargarComentarios() {
    if (!this.movie?.id) return;

    this.comentarios = [];

    if (Array.isArray(this.movie.comentarios)) {
      this.movie.comentarios.forEach((c: any) => {
        this.comentarios.push({
          nombre: 'User',
          tiempo: 'Ahora',
          texto: c,
          estrellas: 5,
          tipo: 'json'
        });
      });
    }

    const key = `comentarios_${this.movie.id}`;
    let guardados = JSON.parse(localStorage.getItem(key) || '[]');
    guardados.forEach((c: any) => {
      this.comentarios.push({
        nombre: 'Tú',
        tiempo: 'Ahora',
        texto: c.texto,
        estrellas: 5,
        tipo: 'local'
      });
    });
  }

  getTotalComentarios(): number {
    if (!this.movie?.id) return 0;
    const jsonComments = Array.isArray(this.movie.comentarios) ? this.movie.comentarios.length : 0;
    const key = `comentarios_${this.movie.id}`;
    const savedComments = JSON.parse(localStorage.getItem(key) || '[]');
    return jsonComments + savedComments.length;
  }

  agregarComentario() {
    if (!this.nuevoComentario.trim() || !this.movie?.id) return;

    const key = `comentarios_${this.movie.id}`;
    let comentarios = JSON.parse(localStorage.getItem(key) || '[]');
    comentarios.push({ texto: this.nuevoComentario });
    localStorage.setItem(key, JSON.stringify(comentarios));

    this.nuevoComentario = '';
    this.cargarComentarios();
  }

  obtenerEstrellaArray(cantidad: number): boolean[] {
    return Array(cantidad).fill(true).concat(Array(5 - cantidad).fill(false));
  }

}

