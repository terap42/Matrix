import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';  // Importation du Router pour la redirection

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    // Importation des composants Ionic définis dans IONIC_STANDALONE_IMPORTS
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]  // Ajout de CUSTOM_ELEMENTS_SCHEMA pour gérer les Web Components comme ion-item
})
export class RegisterPage {
  inscriptionForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {
    // Initialisation du formulaire
    this.inscriptionForm = this.fb.group({
      civilite: ['M', Validators.required],
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      telephone: ['', [Validators.required, Validators.pattern('[0-9]{8,15}')]],
      lieuResidence: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      dahira: [''],
      muqadam: ['']
    });
  }

  onSubmit() {
    if (this.inscriptionForm.valid) {
      console.log('Données du formulaire:', this.inscriptionForm.value);
      
      // Redirection vers la page de login après une soumission réussie
      this.router.navigate(['/login']);
    } else {
      console.log('Formulaire invalide');
    }
  }
}
