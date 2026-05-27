import { Component, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {


  constructor(
    private router: Router,
    private http: HttpClient,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  peliculasGlobal: any[] = [];
  peliculasFiltradas: any[] = [];

  generoActivo = "Todos";
  ordenActivo = "ninguno";
  busquedaActiva = "";

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      this.http.get<any>('assets/data/movies.json').subscribe(data => {
        this.ngZone.run(() => {
          this.peliculasGlobal = data.movies;
          this.aplicarFiltros();
          this.cdr.detectChanges();
          
          console.log('Películas cargadas:', this.peliculasGlobal);
          console.log('Películas filtradas:', this.peliculasFiltradas);
        });
      });
    });
  }


  aplicarFiltros() {

    let resultado = [...this.peliculasGlobal];

    // FILTRO GENERO
    if (this.generoActivo !== "Todos") {

      resultado = resultado.filter(movie =>
        movie.genero.includes(this.generoActivo)
      );

    }

    // BUSQUEDA
    if (this.busquedaActiva !== "") {

      resultado = resultado.filter(movie =>
        movie.titulo.toLowerCase().includes(this.busquedaActiva)
      );

    }

    // ORDEN
    if (this.ordenActivo === "rating") {

      resultado.sort((a, b) => b.rating - a.rating);

    }

    if (this.ordenActivo === "vistas") {

      resultado.sort((a, b) => b.vistas - a.vistas);

    }

    if (this.ordenActivo === "recomendado") {

      resultado = resultado.filter(movie =>
        movie.recomendado === true
      );

    }

    this.peliculasFiltradas = resultado;

  }


  filtrarGenero(gen: string) {

    this.generoActivo = gen;

    this.aplicarFiltros();

  }


  ordenarPor(tipo: string) {

    this.ordenActivo = tipo;

    this.aplicarFiltros();

  }


  buscar(event: Event) {

    const input = event.target as HTMLInputElement;

    this.busquedaActiva = input.value.toLowerCase();

    this.aplicarFiltros();

  }


 verDetalle(id: number) {

  this.router.navigate(
    ['/details'],
    {
      queryParams: { id }
    }
  );

 }
}