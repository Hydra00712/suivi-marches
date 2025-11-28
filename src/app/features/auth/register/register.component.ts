import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Role } from '../../../core/models/employee.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  role: Role = 'employe';
  serviceId = 'srv-1';
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  services: { id: string; name: string }[] = [];

  constructor(private auth: AuthService, private router: Router) {
    this.services = this.auth.listServices();
  }

  submit() {
    this.errorMessage = '';
    this.successMessage = '';

    // Validation
    if (!this.name.trim() || !this.email.trim() || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.errorMessage = 'Veuillez entrer une adresse email valide';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.isLoading = true;

    setTimeout(() => {
      const result = this.auth.register({
        name: this.name.trim(),
        email: this.email.trim().toLowerCase(),
        password: this.password,
        role: this.role,
        serviceId: this.serviceId
      });

      if (result.success) {
        this.successMessage = 'Compte créé avec succès ! Redirection...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      } else {
        switch (result.error) {
          case 'email_exists':
            this.errorMessage = 'Un compte existe déjà avec cet email';
            break;
          default:
            this.errorMessage = 'Erreur lors de la création du compte';
        }
      }
      this.isLoading = false;
    }, 500);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  private isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  clearMessages() {
    this.errorMessage = '';
    this.successMessage = '';
  }
}

